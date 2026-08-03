import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#f2f2f7',
  card: '#ffffff',
  text: '#1c1c1e',
  subtext: '#6c6c70',
  border: '#e5e5ea',
  primary: '#007aff',
  secondary: '#5856d6',
  shadow: 'rgba(0,0,0,0.08)',
  inputBackground: '#f8f8fc',
  placeholder: '#8e8e93',
  danger: '#ff3b30',
  success: '#34c759',
  warning: '#ff9500',
};

const darkColors = {
  background: '#0e0e0e',
  card: '#1c1c1e',
  text: '#f2f2f7',
  subtext: '#8e8e93',
  border: '#38383a',
  primary: '#0a84ff',
  secondary: '#5e5ce6',
  shadow: 'rgba(255,255,255,0.05)',
  inputBackground: '#2c2c2e',
  placeholder: '#636366',
  danger: '#ff453a',
  success: '#32d74b',
  warning: '#ff9f0a',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme() as ThemeType;
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('app_theme');
      if (saved) {
        setTheme(saved as ThemeType);
      } else {
        setTheme(systemTheme || 'light');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);