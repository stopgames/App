import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatDate } from '../utils/helpers';
import * as ImagePicker from 'expo-image-picker';

export default function TaskDetailScreen({ route }) {
  const { taskId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [task, setTask] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [taskRes, attRes] = await Promise.all([api.get(`/tasks/${taskId}`), api.get(`/tasks/${taskId}/attachments`)]);
      setTask(taskRes.data);
      setAttachments(attRes.data);
    } catch (e) { Alert.alert('Ошибка', 'Не удалось загрузить'); }
    setLoading(false);
  };

  const updateStatus = async (status: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      Alert.alert('Успех', 'Статус обновлён');
      loadData();
    } catch (e) { Alert.alert('Ошибка', 'Не удалось обновить'); }
  };

  const pickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) {
      const formData = new FormData();
      formData.append('file', { uri: result.assets[0].uri, name: 'upload.jpg', type: 'image/jpeg' } as any);
      try {
        await api.post(`/tasks/${taskId}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('Успех', 'Файл прикреплён');
        loadData();
      } catch (e) { Alert.alert('Ошибка', 'Не удалось загрузить'); }
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!task) return <Text>Задание не найдено</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Детали задания" showBack />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>#{task.id} {task.target_type || 'Цель'}</Text>
          <Text style={{ color: colors.text }}>Статус: {task.status}</Text>
          <Text style={{ color: colors.text }}>Координаты: {task.latitude.toFixed(5)}, {task.longitude.toFixed(5)}</Text>
          <Text style={{ color: colors.subtext }}>Описание: {task.description || 'нет'}</Text>
          <Text style={{ color: colors.subtext }}>Создано: {formatDate(task.created_at)}</Text>
          {task.deadline && <Text style={{ color: colors.subtext }}>Срок: {formatDate(task.deadline)}</Text>}
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}>
          {user?.role === 'pilot' && task.status !== 'completed' && task.status !== 'cancelled' && (
            <>
              <Button title="Принять" onPress={() => updateStatus('assigned')} style={{ marginRight: 8 }} />
              <Button title="В работе" onPress={() => updateStatus('in_progress')} style={{ marginRight: 8 }} />
              <Button title="Выполнено" onPress={() => updateStatus('completed')} />
            </>
          )}
          {(user?.role === 'founder' || user?.role === 'bps_dispatcher') && (
            <Button title="Отменить" onPress={() => updateStatus('cancelled')} variant="danger" />
          )}
          <Button title="Прикрепить файл" onPress={pickFile} variant="secondary" />
        </View>

        <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8 }}>Вложения</Text>
        {attachments.length === 0 ? <Text style={{ color: colors.subtext }}>Нет вложений</Text> : attachments.map((att) => (
          <View key={att.id} style={{ marginBottom: 10 }}>
            {att.file_type === 'image' ? (
              <Image source={{ uri: att.file_url }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
            ) : (
              <Video source={{ uri: att.file_url }} rate={1.0} volume={1.0} isMuted={false} resizeMode="contain" style={{ width: '100%', height: 200, borderRadius: 8 }} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}