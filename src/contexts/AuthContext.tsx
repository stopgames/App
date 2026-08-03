import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../models/User';
import { login as apiLogin } from '../services/api';
import { initDb } from '../services/localDb';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedToken = await AsyncStorage.getItem('access_token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      await initDb();
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const login = async (login: string, password: string) => {
    const data = await apiLogin(login, password);
    const userData: User = {
      id: data.user_id,
      login,
      role: data.role,
      pilotType: data.pilot_type,
    };
    setToken(data.access_token);
    setUser(userData);
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user');
  };

  const refreshUser = async () => {
  try {
    const response = await api.get('/users/me');
    const userData = response.data;
    setUser({
      id: userData.id,
      login: userData.login,
      role: userData.role,
      pilotType: userData.pilot_type,
      nickname: userData.pilot_nickname,
    });
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  } catch (e) {
    console.warn('Refresh user failed', e);
  }
};

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};