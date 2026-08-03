import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getStats, getGlobalRating } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import LoadingIndicator from '../components/LoadingIndicator';

export default function StatsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [rating, setRating] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const s = await getStats(user?.id);
        setStats(s);
        const r = await getGlobalRating();
        setRating(r);
      } catch (e) {}
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Статистика" showBack />
      <View style={{ padding: 20 }}>
        {stats && (
          <Card>
            <Text style={{ color: colors.text }}>Полётов: {stats.total}</Text>
            <Text style={{ color: colors.text }}>Попаданий: {stats.hits}</Text>
            <Text style={{ color: colors.text }}>Район: {stats.area}</Text>
            <Text style={{ color: colors.text }}>Сбито: {stats.shotdown}</Text>
            <Text style={{ color: colors.text }}>Средняя длительность: {stats.avg_duration} мин</Text>
            <Text style={{ color: colors.text }}>Очки: {stats.points}</Text>
          </Card>
        )}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginVertical: 12 }}>Общий рейтинг</Text>
        <FlatList
          data={rating}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Card>
              <Text style={{ color: colors.text }}>{index+1}. {item.nickname || item.login} – {item.points} очков</Text>
            </Card>
          )}
        />
      </View>
    </View>
  );
}