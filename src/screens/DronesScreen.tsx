import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TextInput, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getDrones, createDrone, updateDrone, deleteDrone } from '../services/api';
import { insertOrUpdate, query } from '../services/localDb';
import { Drone } from '../models/Drone';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import FAB from '../components/FAB';
import Input from '../components/Input';
import LoadingIndicator from '../components/LoadingIndicator';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DronesScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'fpv' | 'kt'>('fpv');
  const [videoFreq, setVideoFreq] = useState('');
  const [controlSystem, setControlSystem] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('');

  useEffect(() => { loadDrones(); }, []);

  const loadDrones = async () => {
    try {
      const data = await getDrones();
      setDrones(data);
      for (const d of data) await insertOrUpdate('drones', d);
    } catch {
      const rows = await query('SELECT * FROM drones WHERE pilot_id = ?', [user?.id]);
      setDrones(rows.map((r: any) => ({
        id: r.id,
        pilotId: r.pilot_id,
        name: r.name,
        type: r.type,
        videoFreq: r.video_freq,
        controlSystem: r.control_system,
        totalQuantity: r.total_quantity,
        remainingQuantity: r.remaining_quantity,
        isActive: r.is_active === 1,
      })));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name) { Alert.alert('Ошибка', 'Введите название'); return; }
    const data = {
      pilot_id: user!.id,
      name,
      type,
      video_freq: videoFreq || null,
      control_system: controlSystem || null,
      total_quantity: totalQuantity ? parseInt(totalQuantity) : null,
      remaining_quantity: totalQuantity ? parseInt(totalQuantity) : null,
      is_active: true,
    };
    try {
      if (editingDrone) await updateDrone(editingDrone.id, data);
      else await createDrone(data);
      setModalVisible(false);
      loadDrones();
    } catch (error) { Alert.alert('Ошибка', 'Не удалось сохранить'); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Удалить?', 'Дрон будет удалён', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => {
        await deleteDrone(id);
        loadDrones();
      }},
    ]);
  };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Дроны" showBack />
      <FlatList
        data={drones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{item.name}</Text>
              <Text style={{ color: colors.subtext }}>Тип: {item.type === 'fpv' ? 'FPV' : 'КТ'}</Text>
              {item.type === 'fpv' && <Text style={{ color: colors.subtext }}>Остаток: {item.remainingQuantity ?? '∞'}</Text>}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => { setEditingDrone(item); setName(item.name); setType(item.type); setVideoFreq(item.videoFreq || ''); setControlSystem(item.controlSystem || ''); setTotalQuantity(item.totalQuantity?.toString() || ''); setModalVisible(true); }} style={{ marginRight: 16 }}>
                <Icon name="pencil-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Icon name="trash-outline" size={22} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      />
      <FAB onPress={() => { setEditingDrone(null); setName(''); setType('fpv'); setVideoFreq(''); setControlSystem(''); setTotalQuantity(''); setModalVisible(true); }} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingDrone ? 'Редактировать' : 'Новый дрон'}</Text>
            <Input label="Название" value={name} onChangeText={setName} />
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setType('fpv')} style={[styles.typeButton, type === 'fpv' && { backgroundColor: colors.primary }]}>
                <Text style={{ color: type === 'fpv' ? '#fff' : colors.text }}>FPV</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setType('kt')} style={[styles.typeButton, type === 'kt' && { backgroundColor: colors.primary }]}>
                <Text style={{ color: type === 'kt' ? '#fff' : colors.text }}>КТ</Text>
              </TouchableOpacity>
            </View>
            <Input label="Частота видео (FPV)" value={videoFreq} onChangeText={setVideoFreq} />
            <Input label="Система управления" value={controlSystem} onChangeText={setControlSystem} />
            <Input label="Количество (для FPV)" value={totalQuantity} onChangeText={setTotalQuantity} keyboardType="numeric" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <Button title="Сохранить" onPress={handleSave} />
              <Button title="Отмена" onPress={() => setModalVisible(false)} variant="secondary" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  typeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#ccc' },
});