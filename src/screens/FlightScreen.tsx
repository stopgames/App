import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getDrones } from '../services/api';
import { query } from '../services/localDb';
import { Drone } from '../models/Drone';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';

export default function FlightScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [isFlying, setIsFlying] = useState(false);
  const [takeoffTime, setTakeoffTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDrones(); }, []);

  const loadDrones = async () => {
    try {
      const data = await getDrones();
      setDrones(data);
    } catch {
      const rows = await query('SELECT * FROM drones WHERE pilot_id = ?', [user?.id]);
      setDrones(rows.map((r: any) => ({
        id: r.id,
        pilotId: r.pilot_id,
        name: r.name,
        type: r.type,
        remainingQuantity: r.remaining_quantity,
        isActive: r.is_active === 1,
      })));
    }
    setLoading(false);
  };

  const takeoff = () => {
    if (!selectedDrone) { Alert.alert('Ошибка', 'Выберите дрон'); return; }
    setIsFlying(true);
    setTakeoffTime(new Date());
    Alert.alert('Взлёт', 'Дрон в воздухе');
  };

  const landing = () => {
    setIsFlying(false);
    const now = new Date();
    const duration = (now.getTime() - takeoffTime!.getTime()) / 60000;
    navigation.navigate('Result', {
      droneId: selectedDrone!.id,
      takeoffTime: takeoffTime!.toISOString(),
      landingTime: now.toISOString(),
      duration,
    });
  };

  const abort = () => { setIsFlying(false); Alert.alert('Полёт прерван'); };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Полёт" showBack />
      <FlatList
        data={drones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedDrone(item)}>
            <Card style={[selectedDrone?.id === item.id && { borderColor: colors.primary, borderWidth: 2 }]}>
              <Text style={{ color: colors.text }}>{item.name} {item.type === 'fpv' ? `(остаток: ${item.remainingQuantity ?? '∞'})` : ''}</Text>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
      {selectedDrone && (
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          {!isFlying ? (
            <Button title="Взлёт" onPress={takeoff} />
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button title="Посадка" onPress={landing} />
              <Button title="Прервать" onPress={abort} variant="danger" />
            </View>
          )}
        </View>
      )}
    </View>
  );
}