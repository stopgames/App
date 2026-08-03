import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import Button from '../components/Button';

const menuMap: Record<string, Array<{ title: string; icon: string; screen: string }>> = {
  founder: [
    { title: 'Мастера', icon: 'people-outline', screen: 'Masters' },
    { title: 'Пилоты', icon: 'person-outline', screen: 'Pilots' },
    { title: 'Статистика', icon: 'stats-chart-outline', screen: 'Stats' },
    { title: 'Карта', icon: 'map-outline', screen: 'Map' },
    { title: 'Задания', icon: 'clipboard-outline', screen: 'Tasks' },
    { title: 'Зоны РЭБ', icon: 'radio-outline', screen: 'RebZones' },
    { title: 'Аналитика', icon: 'trending-up-outline', screen: 'Patterns' },
    { title: 'Чат', icon: 'chatbubble-outline', screen: 'Chat' },
  ],
  master: [
    { title: 'Пилоты', icon: 'person-outline', screen: 'Pilots' },
    { title: 'Статистика', icon: 'stats-chart-outline', screen: 'Stats' },
    { title: 'Карта', icon: 'map-outline', screen: 'Map' },
    { title: 'Задания', icon: 'clipboard-outline', screen: 'Tasks' },
    { title: 'Зоны РЭБ', icon: 'radio-outline', screen: 'RebZones' },
    { title: 'Аналитика', icon: 'trending-up-outline', screen: 'Patterns' },
    { title: 'Чат', icon: 'chatbubble-outline', screen: 'Chat' },
  ],
  pilot: [
    { title: 'Дроны', icon: 'drone-outline', screen: 'Drones' },
    { title: 'Полёт', icon: 'airplane-outline', screen: 'Flight' },
    { title: 'Статистика', icon: 'stats-chart-outline', screen: 'Stats' },
    { title: 'Рейтинг', icon: 'trophy-outline', screen: 'Stats' },
    { title: 'Профиль', icon: 'person-outline', screen: 'Profile' },
    { title: 'Карта', icon: 'map-outline', screen: 'Map' },
    { title: 'Задания', icon: 'clipboard-outline', screen: 'Tasks' },
    { title: 'Аналитика', icon: 'trending-up-outline', screen: 'Patterns' },
    { title: 'Чат', icon: 'chatbubble-outline', screen: 'Chat' },
  ],
  bps_dispatcher: [
    { title: 'Пилоты', icon: 'people-outline', screen: 'PilotsOverview' },
    { title: 'Задания', icon: 'clipboard-outline', screen: 'Tasks' },
    { title: 'Карта', icon: 'map-outline', screen: 'Map' },
    { title: 'Аналитика', icon: 'trending-up-outline', screen: 'Patterns' },
    { title: 'Чат', icon: 'chatbubble-outline', screen: 'Chat' },
  ],
  reb: [
    { title: 'Зоны РЭБ', icon: 'radio-outline', screen: 'RebZones' },
    { title: 'Карта', icon: 'map-outline', screen: 'Map' },
    { title: 'Аналитика', icon: 'trending-up-outline', screen: 'Patterns' },
    { title: 'Чат', icon: 'chatbubble-outline', screen: 'Chat' },
  ],
  rer: [
    { title: 'Карта', icon: 'map-outline', screen: 'Map' },
    { title: 'Аналитика', icon: 'trending-up-outline', screen: 'Patterns' },
    { title: 'Чат', icon: 'chatbubble-outline', screen: 'Chat' },
  ],
  observer: [
    { title: 'Карта', icon: 'map-outline', screen: 'Map' },
    { title: 'Аналитика', icon: 'trending-up-outline', screen: 'Patterns' },
  ],
};

export default function MainMenuScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { colors, toggleTheme, theme } = useTheme();

  const role = user?.role || 'pilot';
  const items = menuMap[role] || menuMap.pilot;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="FPV/KT" rightAction={
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 8 }}>
          <Icon name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} size={24} color={colors.text} />
        </TouchableOpacity>
      } />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.welcome, { color: colors.text }]}>Добро пожаловать, {user?.login}</Text>
        <View style={styles.grid}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.gridItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Icon name={item.icon} size={32} color={colors.primary} />
              <Text style={[styles.gridText, { color: colors.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button title="Выйти" onPress={logout} variant="danger" style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  welcome: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  gridText: { fontSize: 12, fontWeight: '500', marginTop: 8, textAlign: 'center' },
});