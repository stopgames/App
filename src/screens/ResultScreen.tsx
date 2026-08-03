import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { saveFlight, uploadFlightAttachment } from '../services/api';
import { insertOrUpdate } from '../services/localDb';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import * as ImagePicker from 'expo-image-picker';

export default function ResultScreen({ route, navigation }) {
  const { droneId, takeoffTime, landingTime, duration } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [result, setResult] = useState<string>('');
  const [targetX, setTargetX] = useState('');
  const [targetY, setTargetY] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [ammo, setAmmo] = useState('');
  const [flightArea, setFlightArea] = useState('');
  const [videoRecorded, setVideoRecorded] = useState<boolean | null>(null);
  const [videoMissingReason, setVideoMissingReason] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const results = user?.pilotType === 'fpv' 
    ? ['В цель', 'В район цели', 'Заглушил РЭБ', 'Перебили картинку', 'Неисправность', 'Сбили', 'Подрыв на старте']
    : ['Завершено', 'Сбили', 'Погода'];

  const resultMap: any = {
    'В цель': 'result_fpv_target',
    'В район цели': 'result_fpv_area',
    'Заглушил РЭБ': 'result_fpv_jammed',
    'Перебили картинку': 'result_fpv_interfered',
    'Неисправность': 'result_fpv_malfunction',
    'Сбили': user?.pilotType === 'fpv' ? 'result_fpv_shotdown' : 'result_kt_shotdown',
    'Подрыв на старте': 'result_fpv_exploded',
    'Завершено': 'result_kt_completed',
    'Погода': 'result_kt_weather',
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) setVideoUri(result.assets[0].uri);
  };

  const handleFinish = async () => {
    if (!result) { Alert.alert('Ошибка', 'Выберите результат'); return; }
    const flightData = {
      pilot_id: user!.id, drone_id: droneId, type: user!.pilotType || 'fpv',
      takeoff_time: takeoffTime, landing_time: landingTime, duration_minutes: duration,
      result: resultMap[result],
      target_x: targetX ? parseFloat(targetX) : null, target_y: targetY ? parseFloat(targetY) : null,
      distance_km: distanceKm ? parseFloat(distanceKm) : null,
      ammo: ammo || null, flight_area: flightArea || null,
      video_recorded: videoRecorded === true ? 1 : (videoRecorded === false ? 0 : null),
      video_missing_reason: videoMissingReason || null,
      objective_witness_id: null,
    };
    try {
      const resp = await saveFlight(flightData);
      const flightId = resp.id;
      if (videoUri) {
        const formData = new FormData();
        formData.append('file', { uri: videoUri, name: 'video.mp4', type: 'video/mp4' } as any);
        await uploadFlightAttachment(flightId, formData);
      }
      Alert.alert('Успех', 'Полёт сохранён');
      navigation.popToTop();
    } catch {
      await insertOrUpdate('flights', { ...flightData, synced: 0 });
      Alert.alert('Сохранено локально', 'Будет синхронизировано позже');
      navigation.popToTop();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Результат" showBack />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>Выберите результат</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {results.map(r => (
            <TouchableOpacity key={r} onPress={() => setResult(r)} style={[styles.chip, { backgroundColor: result === r ? colors.primary : colors.card }]}>
              <Text style={{ color: result === r ? '#fff' : colors.text }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {result && (
          <>
            {user?.pilotType === 'fpv' && (
              <>
                <Input label="X координата" value={targetX} onChangeText={setTargetX} keyboardType="decimal-pad" />
                <Input label="Y координата" value={targetY} onChangeText={setTargetY} keyboardType="decimal-pad" />
                <Input label="Дистанция (км)" value={distanceKm} onChangeText={setDistanceKm} keyboardType="decimal-pad" />
                <Input label="Снаряд" value={ammo} onChangeText={setAmmo} />
              </>
            )}
            <Input label="Район полёта" value={flightArea} onChangeText={setFlightArea} />
            <Text style={{ color: colors.text, marginVertical: 8 }}>Видео записано?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <Button title="Да" onPress={() => setVideoRecorded(true)} style={{ marginRight: 8 }} />
              <Button title="Нет" onPress={() => setVideoRecorded(false)} variant="secondary" />
            </View>
            {videoRecorded === false && <Input label="Причина" value={videoMissingReason} onChangeText={setVideoMissingReason} />}
            <Input label="Свидетель (пилот КТ)" value={witnessName} onChangeText={setWitnessName} />
            <Button title="Прикрепить видео" onPress={pickVideo} style={{ marginVertical: 8 }} variant="secondary" />
            {videoUri && <Text style={{ color: colors.success }}>Видео выбрано</Text>}
            <Button title="Завершить полёт" onPress={handleFinish} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, margin: 4, borderWidth: 1, borderColor: '#ccc' },
});