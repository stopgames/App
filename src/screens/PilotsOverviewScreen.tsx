import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getPilots, getDronesByPilot } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import LoadingIndicator from '../components/LoadingIndicator';

export default function PilotsOverviewScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadPilots(); }, []);

  const loadPilots = async () => {
    try {
      const res = await getPilots();
      const enriched = await Promise.all(res.map(async (p: any) => {
        try {
          const dronesRes = await getDronesByPilot(p.id);
          const drones = dronesRes.data || [];
          const fpvCount = drones.filter((d: any) => d.type === 'fpv').reduce((sum: number, d: any) => sum + (d.remaining_quantity || 0), 0);
          const ktCount = drones.filter((d: any) => d.type === 'kt').length;
          return { ...p, fpvRemaining: fpvCount, ktCount };
        } catch { return { ...p, fpvRemaining: '?', ktCount: '?' }; }
      }));
      setPilots(enriched);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); loadPilots(); };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Пилоты подразделения" showBack />
      <FlatList
        data={pilots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.login} {item.unit ? `(${item.unit})` : ''}</Text>
            <Text style={{ color: colors.subtext }}>FPV остаток: {item.fpvRemaining ?? '∞'}</Text>
            <Text style={{ color: colors.subtext }}>КТ дронов: {item.ktCount}</Text>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: 'center' }}>Нет пилотов</Text>}
      />
    </View>
  );
}