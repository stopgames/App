import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingIndicator from '../components/LoadingIndicator';

export default function CreateTaskScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [targetType, setTargetType] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => { loadPilots(); }, []);

  const loadPilots = async () => {
    try {
      const res = await api.get('/users/pilots');
      setPilots(res.data);
    } catch (e) { Alert.alert('Ошибка', 'Не удалось загрузить пилотов'); }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!assignedTo) { Alert.alert('Ошибка', 'Выберите пилота'); return; }
    if (!latitude || !longitude) { Alert.alert('Ошибка', 'Введите координаты'); return; }
    const data = {
      assigned_to: assignedTo,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      target_type: targetType || null,
      description: description || null,
      deadline: deadline || null,
    };
    try {
      await api.post('/tasks', data);
      Alert.alert('Успех', 'Задание создано');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Ошибка', e.response?.data?.detail || 'Не удалось создать');
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Создание задания" showBack />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, marginBottom: 8 }}>Пилот</Text>
          {pilots.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.pilotItem, assignedTo === p.id && { borderColor: colors.primary, backgroundColor: colors.inputBackground }]} onPress={() => setAssignedTo(p.id)}>
              <Text style={{ color: colors.text }}>{p.login} {p.unit ? `(${p.unit})` : ''}</Text>
            </TouchableOpacity>
          ))}
          <Input label="Широта" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" />
          <Input label="Долгота" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" />
          <Input label="Тип цели" value={targetType} onChangeText={setTargetType} />
          <Input label="Описание" value={description} onChangeText={setDescription} multiline />
          <Input label="Срок (ISO-дата)" value={deadline} onChangeText={setDeadline} />
          <Button title="Создать задание" onPress={handleCreate} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = {
  pilotItem: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 6 },
};