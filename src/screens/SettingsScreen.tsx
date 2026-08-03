import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Switch, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from 'react-native-modal';
import Input from '../components/Input';
import packageJson from '../../package.json';

export default function SettingsScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [twofaCode, setTwofaCode] = useState('');
  const [appVersion, setAppVersion] = useState(packageJson.version || '1.0.0');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadTwofaStatus = async () => {
      try {
        const res = await api.get('/auth/2fa/status');
        setTwofaEnabled(res.data.enabled);
      } catch (e) {}
    };
    loadTwofaStatus();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setPasswordError('Пароль должен быть не менее 6 символов'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Пароли не совпадают'); return; }
    setPasswordError('');
    try {
      await api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword });
      Alert.alert('Успех', 'Пароль изменён');
      setModalVisible(false);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Ошибка смены пароля');
    }
  };

  const handleEnable2FA = async () => {
    if (!twofaCode) { Alert.alert('Ошибка', 'Введите код из приложения-аутентификатора'); return; }
    try {
      await api.post('/auth/2fa/enable', { code: twofaCode });
      setTwofaEnabled(true);
      Alert.alert('Успех', 'Двухфакторная аутентификация включена');
    } catch (err: any) {
      Alert.alert('Ошибка', err.response?.data?.detail || 'Неверный код');
    }
  };

  const handleDisable2FA = async () => {
    Alert.alert('Отключить 2FA?', 'Это действие потребует подтверждения', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Отключить', style: 'destructive', onPress: async () => {
        try {
          await api.post('/auth/2fa/disable');
          setTwofaEnabled(false);
          Alert.alert('2FA отключена');
        } catch (err: any) {
          Alert.alert('Ошибка', err.response?.data?.detail || 'Не удалось отключить');
        }
      }},
    ]);
  };

  const fetchQR = async () => {
    try {
      const res = await api.get('/auth/2fa/qr', { responseType: 'blob' });
      const secret = res.headers['x-2fa-secret'] || 'секрет не получен';
      Alert.alert('QR-код', `Отсканируйте QR-код в приложении-аутентификаторе. Секрет: ${secret}`);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось получить QR-код');
    }
  };

  const handleClearCache = () => {
    Alert.alert('Очистка кэша', 'Все локальные данные будут удалены. Продолжить?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: async () => {
        await AsyncStorage.clear();
        Alert.alert('Готово', 'Кэш очищен');
      }},
    ]);
  };

  const handleCheckUpdates = async () => {
    setUpdating(true);
    try {
      const res = await api.get('/version');
      const latest = res.data.version;
      if (latest !== appVersion) {
        Alert.alert('Доступно обновление', `Текущая версия: ${appVersion}\nНовая версия: ${latest}\nСкачайте обновление в магазине приложений.`);
      } else {
        Alert.alert('Обновлений нет', 'Вы используете актуальную версию.');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось проверить обновления');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Настройки" showBack />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>Профиль</Text>
          <Text style={{ color: colors.text }}>Логин: {user?.login}</Text>
          <Text style={{ color: colors.text }}>Роль: {user?.role}</Text>
          <Text style={{ color: colors.text }}>Тип: {user?.pilotType || 'не указан'}</Text>
        </Card>

        <Card>
          <Text style={{ color: colors.text, marginBottom: 8 }}>Тема оформления</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text }}>{theme === 'light' ? 'Светлая' : 'Тёмная'}</Text>
            <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
          </View>
        </Card>

        <Card>
          <Button title="Сменить пароль" onPress={() => setModalVisible(true)} />
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.text }}>Двухфакторная аутентификация: {twofaEnabled ? 'Включена' : 'Отключена'}</Text>
            {!twofaEnabled ? (
              <>
                <Button title="Включить 2FA" onPress={fetchQR} style={{ marginTop: 8 }} />
                <Input placeholder="Код из приложения" value={twofaCode} onChangeText={setTwofaCode} keyboardType="numeric" />
                <Button title="Подтвердить 2FA" onPress={handleEnable2FA} />
              </>
            ) : (
              <Button title="Отключить 2FA" onPress={handleDisable2FA} variant="danger" style={{ marginTop: 8 }} />
            )}
          </View>
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>Приложение</Text>
          <Text style={{ color: colors.subtext }}>Версия: {appVersion}</Text>
          <Button title="Проверить обновления" onPress={handleCheckUpdates} loading={updating} style={{ marginTop: 8 }} />
          <Button title="Очистить кэш" onPress={handleClearCache} variant="secondary" style={{ marginTop: 8 }} />
          <Button title="История действий" onPress={() => navigation.navigate('AuditHistory')} style={{ marginTop: 8 }} />
          <Button title="Предложения по улучшению" onPress={() => navigation.navigate('Suggestions')} style={{ marginTop: 8 }} />
          <Button title="Обновить данные" onPress={refreshUser} style={{ marginTop: 8 }} />
        </Card>

        <Button title="Выйти" onPress={handleLogout} variant="danger" style={{ marginTop: 10 }} />
      </ScrollView>

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Сменить пароль</Text>
          <Input label="Текущий пароль" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
          <Input label="Новый пароль (≥6)" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <Input label="Подтвердите пароль" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          {passwordError ? <Text style={{ color: colors.danger }}>{passwordError}</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <Button title="Сохранить" onPress={handleChangePassword} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </View>
  );
}