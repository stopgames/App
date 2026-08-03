import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { WS_BASE_URL } from '../utils/config';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

export default function ChatScreen() {
  const { token, user } = useAuth();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, []);

  const connect = () => {
    const url = `${WS_BASE_URL}/chat/ws?token=${token}`;
    ws.current = new WebSocket(url);
    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, { text: data.text, sender: data.sender_name || 'system', timestamp: new Date() }]);
    };
    ws.current.onerror = (e) => console.error('WS error', e);
    ws.current.onclose = () => setTimeout(connect, 5000);
  };

  const send = () => {
    if (!input.trim()) return;
    ws.current?.send(JSON.stringify({ text: input.trim() }));
    setMessages((prev) => [...prev, { text: input.trim(), sender: 'Вы', timestamp: new Date() }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Чат" showBack />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.message, { alignSelf: item.sender === 'Вы' ? 'flex-end' : 'flex-start', backgroundColor: item.sender === 'Вы' ? colors.primary : colors.card }]}>
            <Text style={{ color: item.sender === 'Вы' ? '#fff' : colors.text }}>{item.sender === 'Вы' ? 'Вы' : item.sender}</Text>
            <Text style={{ color: item.sender === 'Вы' ? '#fff' : colors.text }}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
      <View style={{ flexDirection: 'row', padding: 12, backgroundColor: colors.card }}>
        <TextInput style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]} value={input} onChangeText={setInput} placeholder="Сообщение..." placeholderTextColor={colors.placeholder} />
        <Button title="Отправить" onPress={send} style={{ marginLeft: 8 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  message: { padding: 10, borderRadius: 12, marginVertical: 4, maxWidth: '80%' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
});