import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';

interface FABProps {
  onPress: () => void;
  icon?: string;
}

export default function FAB({ onPress, icon = 'add' }: FABProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={onPress}>
      <Icon name={icon} size={30} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});