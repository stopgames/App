import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getPilotsAdmin, createPilot, deletePilot } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FAB from '../components/FAB';
import Modal from 'react-native-modal';

export default function PilotsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [pilots, setPilots] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [pilotType, setPilotType] = useState('fpv');

  useEffect(() => {
    if (user?.role !== 'founder' && user?.role !== 'master') {
      Alert.alert('Доступ запрещён', 'Только мастер или основатель');
      navigation.goBack();
      return;
    }
    loadPilots();
  }, []);

  const loadPilots = async () => {
    try {
      const data = await getPilotsAdmin();
      setPilots(data);
    } catch (e) { Alert.alert('Ошибка', 'Не удалось загрузить'); }
  };

  const handleCreate = async () => {
    if (!login.trim() || !password.trim()) { Alert.alert('Ошибка', 'Введите логин и пароль'); return; }
    try {
      await createPilot({ login, password, pilot_type: pilotType });
      Alert.alert('Успех', 'Пилот создан');
      setModalVisible(false);
      setLogin(''); setPassword('');
      loadPilots();
    } catch (e: any) { Alert.alert('Ошибка', e.response?.data?.detail); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Удалить пилота?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deletePilot(id); loadPilots(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Пилоты" showBack />
      <FlatList
        data={pilots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.text }}>{item.login}</Text>
              <Text style={{ color: colors.subtext }}>Тип: {item.pilot_type || 'не указан'}</Text>
              <Text style={{ color: colors.subtext }}>Подразделение: {item.unit || '—'}</Text>
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
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Новый пилот</Text>
          <Input label="Логин" value={login} onChangeText={setLogin} autoCapitalize="none" />
          <Input label="Пароль" value={password} onChangeText={setPassword} secureTextEntry />
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setPilotType('fpv')} style={[styles.typeBtn, { backgroundColor: pilotType === 'fpv' ? colors.primary : colors.card }]}>
              <Text style={{ color: pilotType === 'fpv' ? '#fff' : colors.text }}>FPV</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPilotType('kt')} style={[styles.typeBtn, { backgroundColor: pilotType === 'kt' ? colors.primary : colors.card }]}>
              <Text style={{ color: pilotType === 'kt' ? '#fff' : colors.text }}>КТ</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <Button title="Создать" onPress={handleCreate} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  typeBtn: { padding: 10, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#ccc' },
};