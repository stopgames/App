import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
}

export default function Input({ label, style, ...props }: InputProps) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border },
          style,
        ]}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});