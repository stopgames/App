import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateUnit } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingIndicator from '../components/LoadingIndicator';

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [unit, setUnit] = useState(user?.unit || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user?.unit) setUnit(user.unit); }, [user]);

  const handleSaveUnit = async () => {
    if (!unit.trim()) { Alert.alert('Ошибка', 'Введите подразделение'); return; }
    setLoading(true);
    try {
      await updateUnit(unit.trim());
      Alert.alert('Успех', 'Подразделение обновлено');
      await refreshUser();
    } catch (e) { Alert.alert('Ошибка', 'Не удалось обновить'); }
    finally { setLoading(false); }
  };

  if (!user) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Профиль" showBack />
      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text }}>Логин: {user.login}</Text>
          <Text style={{ color: colors.text }}>Роль: {user.role}</Text>
          <Text style={{ color: colors.text }}>Тип пилота: {user.pilotType || 'не указан'}</Text>
        </Card>
        <Card>
          <Text style={{ color: colors.text, marginBottom: 8 }}>Подразделение</Text>
          <Input value={unit} onChangeText={setUnit} placeholder="Введите подразделение" />
          <Button title="Сохранить" onPress={handleSaveUnit} loading={loading} />
        </Card>
        <Button title="Редактировать профиль" onPress={() => navigation.navigate('Settings')} style={{ marginBottom: 12 }} />
        <Button title="Выйти" onPress={logout} variant="danger" />
      </View>
    </View>
  );
}