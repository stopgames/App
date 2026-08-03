import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getMastersAdmin, createMaster, deleteMaster } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FAB from '../components/FAB';
import Modal from 'react-native-modal';

export default function MastersScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [masters, setMasters] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user?.role !== 'founder') {
      Alert.alert('Доступ запрещён', 'Только основатель');
      navigation.goBack();
      return;
    }
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const data = await getMastersAdmin();
      setMasters(data);
    } catch (e) { Alert.alert('Ошибка', 'Не удалось загрузить'); }
  };

  const handleCreate = async () => {
    if (!login.trim() || !password.trim()) { Alert.alert('Ошибка', 'Введите логин и пароль'); return; }
    try {
      await createMaster({ login, password });
      Alert.alert('Успех', 'Мастер создан');
      setModalVisible(false);
      setLogin(''); setPassword('');
      loadMasters();
    } catch (e: any) { Alert.alert('Ошибка', e.response?.data?.detail); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Удалить мастера?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteMaster(id); loadMasters(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Мастера" showBack />
      <FlatList
        data={masters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.text }}>{item.login}</Text>
              <Text style={{ color: colors.subtext }}>Пилоты: {item.pilot_count || 0}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: colors.danger }}>Удалить</Text>
            </TouchableOpacity>
          </Card>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      />
      <FAB onPress={() => setModalVisible(true)} />

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Новый мастер</Text>
          <Input label="Логин" value={login} onChangeText={setLogin} autoCapitalize="none" />
          <Input label="Пароль" value={password} onChangeText={setPassword} secureTextEntry />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <Button title="Создать" onPress={handleCreate} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </View>
  );
}