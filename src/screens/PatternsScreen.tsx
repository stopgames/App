import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';

export default function PatternsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [prediction, setPrediction] = useState<any>(null);
  const [anomaly, setAnomaly] = useState<any>(null);
  const [trend, setTrend] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [predRes, anomRes, trendRes] = await Promise.all([api.get('/ml/predict'), api.get('/ml/anomaly'), api.get('/ml/trend')]);
      setPrediction(predRes.data);
      setAnomaly(anomRes.data);
      setTrend(trendRes.data.trend);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleTrain = async () => {
    try {
      await api.post('/ml/train');
      Alert.alert('Обучение запущено');
    } catch (e) { Alert.alert('Ошибка'); }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="ML-аналитика" showBack />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text }}>Прогноз на следующий час</Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>{prediction?.predicted ?? '—'}</Text>
          <Text style={{ color: colors.subtext }}>Интервал: {prediction?.lower} – {prediction?.upper}</Text>
          <Text style={{ color: colors.subtext }}>Уверенность: {Math.round((prediction?.confidence || 0) * 100)}%</Text>
        </Card>
        <Card style={{ backgroundColor: anomaly?.anomaly ? colors.danger : colors.success }}>
          <Text style={{ color: '#fff' }}>Аномалия</Text>
          <Text style={{ color: '#fff' }}>{anomaly?.message || 'Нет данных'}</Text>
        </Card>
        <Card>
          <Text style={{ color: colors.text }}>Тренд активности</Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{trend || 'не определён'}</Text>
        </Card>
        {(user?.role === 'founder' || user?.role === 'bps_dispatcher') && (
          <Button title="Переобучить модель" onPress={handleTrain} />
        )}
      </ScrollView>
    </View>
  );
}