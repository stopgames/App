import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Header from '../components/Header';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberLogin, setRememberLogin] = useState(true);

  useEffect(() => {
    const loadSavedLogin = async () => {
      const saved = await AsyncStorage.getItem('saved_login');
      if (saved) { setLoginInput(saved); setRememberLogin(true); }
    };
    loadSavedLogin();
  }, []);

  const handleLogin = async () => {
    if (loginInput.length < 3) { setError('Логин должен быть не менее 3 символов'); return; }
    if (password.length < 6) { setError('Пароль должен быть не менее 6 символов'); return; }
    setError('');
    setLoading(true);
    try {
      await login(loginInput, password);
      if (rememberLogin) await AsyncStorage.setItem('saved_login', loginInput);
      else await AsyncStorage.removeItem('saved_login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.title, { color: colors.primary }]}>FPV/KT</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Вход в систему</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Логин</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]} placeholder="Введите логин" placeholderTextColor={colors.placeholder} value={loginInput} onChangeText={setLoginInput} autoCapitalize="none" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Пароль</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]} placeholder="Введите пароль" placeholderTextColor={colors.placeholder} value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={handleLogin} />
          </View>
          <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberLogin(!rememberLogin)}>
            <View style={[styles.checkbox, rememberLogin && { backgroundColor: colors.primary }]} />
            <Text style={[styles.rememberText, { color: colors.text }]}>Запомнить логин</Text>
          </TouchableOpacity>
          {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
          <Button title={loading ? 'Вход...' : 'Войти'} onPress={handleLogin} disabled={loading} />
          {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { borderRadius: 16, padding: 24, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#007aff', marginRight: 10 },
  rememberText: { fontSize: 14 },
});