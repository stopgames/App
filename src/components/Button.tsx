import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ title, onPress, style, variant = 'primary', disabled, loading }: ButtonProps) {
  const { colors } = useTheme();
  const bgColor = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.secondary;
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor }, style, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.text}>{loading ? '...' : title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
});