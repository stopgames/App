import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';

export default function SuggestionsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [sending, setSending] = useState(false);

  const loadSuggestions = async () => {
    try {
      const res = await api.get('/suggestions');
      setSuggestions(res.data);
    } catch (e) { Alert.alert('Ошибка', 'Не удалось загрузить предложения'); }
    setLoading(false);
  };

  useEffect(() => { loadSuggestions(); }, []);

  const handleSend = async () => {
    if (!text.trim()) { Alert.alert('Ошибка', 'Введите текст предложения'); return; }
    setSending(true);
    try {
      await api.post('/suggestions', { text: text.trim(), category: category.trim() || null });
      Alert.alert('Успех', 'Предложение отправлено');
      setText('');
      setCategory('');
      loadSuggestions();
    } catch (e) { Alert.alert('Ошибка', 'Не удалось отправить'); }
    setSending(false);
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { new: 'Новое', reviewed: 'Рассмотрено', implemented: 'Внедрено', rejected: 'Отклонено' };
    return map[status] || status;
  };

  if (loading) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Предложения" showBack />
      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, marginBottom: 8 }}>Ваше предложение:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
            placeholder="Идея по улучшению..."
            placeholderTextColor={colors.placeholder}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border, marginTop: 8 }]}
            placeholder="Категория (необязательно)"
            placeholderTextColor={colors.placeholder}
            value={category}
            onChangeText={setCategory}
          />
          <Button title={sending ? 'Отправка...' : 'Отправить'} onPress={handleSend} disabled={sending} />
        </Card>
        <Text style={{ color: colors.text, marginVertical: 12 }}>Мои предложения</Text>
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card>
              <Text style={{ color: colors.text }}>{item.text}</Text>
              <Text style={{ color: colors.subtext }}>Категория: {item.category || '—'}</Text>
              <Text style={{ color: colors.subtext }}>Статус: {getStatusLabel(item.status)}</Text>
              {item.user_id === user?.id && <Text style={{ color: colors.subtext }}>Ваше</Text>}
            </Card>
          )}
          ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: 'center' }}>Нет предложений</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});