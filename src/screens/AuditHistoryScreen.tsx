import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import LoadingIndicator from '../components/LoadingIndicator';
import { formatDate } from '../utils/helpers';

export default function AuditHistoryScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const res = await api.get('/audit/me');
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadLogs(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="История действий" showBack />
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ color: colors.text }}>{item.action}</Text>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>Таблица: {item.table_name || '—'}</Text>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>{formatDate(item.timestamp)}</Text>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: 'center' }}>Нет записей</Text>}
      />
    </View>
  );
}