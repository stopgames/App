import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getRebZones, createRebZone, deleteRebZone } from '../services/api';
import { query } from '../services/localDb';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FAB from '../components/FAB';
import Modal from 'react-native-modal';

export default function RebZonesScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [zones, setZones] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('');

  useEffect(() => { loadZones(); }, []);

  const loadZones = async () => {
    try {
      const data = await getRebZones();
      setZones(data);
    } catch {
      const rows = await query('SELECT * FROM reb_zones');
      setZones(rows);
    }
  };

  const handleAdd = async () => {
    if (!name || !lat || !lng || !radius) { Alert.alert('Ошибка', 'Заполните все поля'); return; }
    try {
      await createRebZone({ name, latitude: parseFloat(lat), longitude: parseFloat(lng), radius: parseFloat(radius), created_by: user!.id });
      Alert.alert('Успех', 'Зона РЭБ добавлена');
      setName(''); setLat(''); setLng(''); setRadius('');
      setModalVisible(false);
      loadZones();
    } catch { Alert.alert('Ошибка', 'Не удалось добавить'); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Удалить?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteRebZone(id); loadZones(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Зоны РЭБ" showBack />
      <FlatList
        data={zones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.text }}>{item.name}</Text>
              <Text style={{ color: colors.subtext }}>({item.latitude}, {item.longitude}) радиус {item.radius}м</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={{ color: colors.danger }}>Удалить</Text>
            </TouchableOpacity>
          </Card>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      />
      <FAB onPress={() => setModalVisible(true)} />

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Новая зона РЭБ</Text>
          <Input label="Название" value={name} onChangeText={setName} />
          <Input label="Широта" value={lat} onChangeText={setLat} keyboardType="decimal-pad" />
          <Input label="Долгота" value={lng} onChangeText={setLng} keyboardType="decimal-pad" />
          <Input label="Радиус (м)" value={radius} onChangeText={setRadius} keyboardType="decimal-pad" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <Button title="Добавить" onPress={handleAdd} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </View>
  );
}