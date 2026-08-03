import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert, Modal, TextInput, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';
import { getMarkers, getRebZones, createMarker } from '../services/api';
import { query } from '../services/localDb';
import Header from '../components/Header';
import Button from '../components/Button';
import FAB from '../components/FAB';
import Input from '../components/Input';

export default function MapScreen() {
  const { colors } = useTheme();
  const [markers, setMarkers] = useState([]);
  const [rebZones, setRebZones] = useState([]);
  const [location, setLocation] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [markerName, setMarkerName] = useState('');
  const [markerLat, setMarkerLat] = useState('');
  const [markerLng, setMarkerLng] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        setMarkerLat(loc.coords.latitude.toString());
        setMarkerLng(loc.coords.longitude.toString());
      }
      loadData();
    })();
  }, []);

  const loadData = async () => {
    try {
      const markerData = await getMarkers();
      setMarkers(markerData);
      const zoneData = await getRebZones();
      setRebZones(zoneData);
    } catch {
      const rows = await query('SELECT * FROM markers');
      setMarkers(rows);
      const zones = await query('SELECT * FROM reb_zones');
      setRebZones(zones);
    }
  };

  const handleCreateMarker = async () => {
    if (!markerName.trim()) { Alert.alert('Ошибка', 'Введите название'); return; }
    const lat = parseFloat(markerLat);
    const lng = parseFloat(markerLng);
    if (isNaN(lat) || isNaN(lng)) { Alert.alert('Ошибка', 'Неверные координаты'); return; }
    try {
      await createMarker({ name: markerName.trim(), latitude: lat, longitude: lng, type: 'drone' });
      Alert.alert('Успех', 'Маркер добавлен');
      setModalVisible(false);
      setMarkerName('');
      loadData();
    } catch (e: any) { Alert.alert('Ошибка', e.response?.data?.detail || 'Не удалось создать'); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Карта" showBack />
      <View style={{ flex: 1 }}>
        <MapView
          style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height - 100 }}
          initialRegion={{ latitude: location?.coords?.latitude || 50.0, longitude: location?.coords?.longitude || 30.0, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        >
          {markers.map((m: any) => <Marker key={m.id} coordinate={{ latitude: m.latitude, longitude: m.longitude }} title={m.name} />)}
          {rebZones.map((z: any) => <Circle key={z.id} center={{ latitude: z.latitude, longitude: z.longitude }} radius={z.radius} strokeColor="rgba(255,0,0,0.5)" fillColor="rgba(255,0,0,0.1)" />)}
        </MapView>
        <View style={{ position: 'absolute', bottom: 100, left: 20, right: 20 }}>
          <Button title="Обновить" onPress={loadData} style={{ marginBottom: 8 }} />
        </View>
        <FAB onPress={() => setModalVisible(true)} icon="add" />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.card, margin: 20, padding: 20, borderRadius: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Новый маркер</Text>
            <Input label="Название" value={markerName} onChangeText={setMarkerName} />
            <Input label="Широта" value={markerLat} onChangeText={setMarkerLat} keyboardType="decimal-pad" />
            <Input label="Долгота" value={markerLng} onChangeText={setMarkerLng} keyboardType="decimal-pad" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <Button title="Сохранить" onPress={handleCreateMarker} />
              <Button title="Отмена" onPress={() => setModalVisible(false)} variant="secondary" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}