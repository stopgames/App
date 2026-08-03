import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';
import { formatDate } from '../utils/helpers';
import { Task } from '../models/Task';

export default function TasksScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); loadTasks(); };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Ожидает',
      assigned: 'Назначено',
      in_progress: 'В работе',
      completed: 'Выполнено',
      cancelled: 'Отменено',
    };
    return map[status] || status;
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}>
      <Card>
        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.target_type || 'Цель'}</Text>
        <Text style={{ color: colors.subtext }}>Координаты: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}</Text>
        <Text style={{ color: colors.text }}>Статус: {getStatusLabel(item.status)}</Text>
        <Text style={{ color: colors.subtext }}>Пилот: ID {item.assigned_to}</Text>
        {item.deadline && <Text style={{ color: colors.subtext }}>Срок: {formatDate(item.deadline)}</Text>}
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Задания" showBack />
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
          {['all', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map((f) => (
            <TouchableOpacity key={f} style={[styles.filterChip, filter === f && { backgroundColor: colors.primary }]} onPress={() => setFilter(f)}>
              <Text style={{ color: filter === f ? '#fff' : colors.text, fontSize: 12 }}>
                {f === 'all' ? 'Все' : getStatusLabel(f)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {(user?.role === 'founder' || user?.role === 'bps_dispatcher') && (
          <Button title="Создать задание" onPress={() => navigation.navigate('CreateTask')} style={{ marginBottom: 12 }} />
        )}
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: 'center' }}>Нет заданий</Text>}
      />
    </View>
  );
}

const styles = {
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e9ecef', marginRight: 8, marginBottom: 8 },
};