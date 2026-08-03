import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getReports, generateReport } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingIndicator from '../components/LoadingIndicator';

export default function ReportsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (e) { Alert.alert('Ошибка', 'Не удалось загрузить отчёты'); }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!date.trim()) { Alert.alert('Ошибка', 'Введите дату ГГГГ-ММ-ДД'); return; }
    setGenerating(true);
    try {
      await generateReport(date.trim());
      Alert.alert('Успех', 'Отчёт сгенерирован');
      setDate('');
      loadReports();
    } catch (e: any) { Alert.alert('Ошибка', e.response?.data?.detail); }
    setGenerating(false);
  };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Отчёты" showBack />
      <View style={{ padding: 20 }}>
        <Card>
          <Input label="Дата (ГГГГ-ММ-ДД)" value={date} onChangeText={setDate} />
          <Button title={generating ? 'Генерация...' : 'Сгенерировать'} onPress={handleGenerate} disabled={generating} />
        </Card>
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card>
              <Text style={{ color: colors.text }}>Отчёт за {item.date}</Text>
              <Text style={{ color: colors.subtext }}>Полётов: {item.total_flights}</Text>
              <Text style={{ color: colors.subtext }}>Попаданий: {item.hits}</Text>
              <Text style={{ color: colors.subtext }}>Сбитий: {item.shotdown}</Text>
              <Text style={{ color: colors.subtext }}>Пилоты: {item.pilots}</Text>
            </Card>
          )}
          ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: 'center' }}>Нет отчётов</Text>}
        />
      </View>
    </View>
  );
}