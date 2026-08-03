import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';

// Создаём экземпляр axios с базовым URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Перехватчик запросов: добавляем токен авторизации, если он есть
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответов: если 401 – удаляем токен и пользователя (выход)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ============================
// AUTH (авторизация)
// ============================
export const login = async (login: string, password: string) => {
  const response = await api.post('/auth/login', { login, password });
  return response.data; // { access_token, user_id, role, pilot_type }
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  await api.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
};

export const enable2FA = async (code: string) => {
  await api.post('/auth/2fa/enable', { code });
};

export const disable2FA = async () => {
  await api.post('/auth/2fa/disable');
};

export const get2FAQR = async () => {
  const response = await api.get('/auth/2fa/qr', { responseType: 'blob' });
  return response;
};

export const get2FAStatus = async () => {
  const response = await api.get('/auth/2fa/status');
  return response.data;
};

// ============================
// USERS (пользователи)
// ============================
export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateUnit = async (unit: string) => {
  await api.put('/users/me/unit', { unit });
};

export const getPilots = async () => {
  const response = await api.get('/users/pilots');
  return response.data;
};

export const getMasters = async () => {
  const response = await api.get('/users/masters');
  return response.data;
};

// ============================
// DRONES (дроны)
// ============================
export const getDrones = async () => {
  const response = await api.get('/drones');
  return response.data;
};

export const getDronesByPilot = async (pilotId: number) => {
  const response = await api.get(`/drones?pilot_id=${pilotId}`);
  return response.data;
};

export const createDrone = async (data: any) => {
  const response = await api.post('/drones', data);
  return response.data;
};

export const updateDrone = async (id: number, data: any) => {
  const response = await api.put(`/drones/${id}`, data);
  return response.data;
};

export const deleteDrone = async (id: number) => {
  await api.delete(`/drones/${id}`);
};

// ============================
// FLIGHTS (полёты)
// ============================
export const getFlights = async () => {
  const response = await api.get('/flights');
  return response.data;
};

export const saveFlight = async (flight: any) => {
  const response = await api.post('/flights', flight);
  return response.data;
};

export const uploadFlightAttachment = async (flightId: number, formData: FormData) => {
  const response = await api.post(`/flights/${flightId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getFlightAttachments = async (flightId: number) => {
  const response = await api.get(`/flights/${flightId}/attachments`);
  return response.data;
};

// ============================
// MARKERS (маркеры)
// ============================
export const getMarkers = async () => {
  const response = await api.get('/markers');
  return response.data;
};

export const createMarker = async (marker: any) => {
  const response = await api.post('/markers', marker);
  return response.data;
};

export const deleteMarker = async (id: number) => {
  await api.delete(`/markers/${id}`);
};

// ============================
// REB ZONES (зоны РЭБ)
// ============================
export const getRebZones = async () => {
  const response = await api.get('/reb-zones');
  return response.data;
};

export const createRebZone = async (data: any) => {
  const response = await api.post('/reb-zones', data);
  return response.data;
};

export const deleteRebZone = async (id: number) => {
  await api.delete(`/reb-zones/${id}`);
};

// ============================
// SYNC (синхронизация)
// ============================
export const syncPull = async (lastSync: string) => {
  const response = await api.post('/sync/pull', { last_sync: lastSync });
  return response.data;
};

export const syncPush = async (changes: any[]) => {
  const response = await api.post('/sync/push', { changes });
  return response.data;
};

// ============================
// TASKS (задания)
// ============================
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (data: any) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const updateTask = async (id: number, data: any) => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

export const getTaskAttachments = async (taskId: number) => {
  const response = await api.get(`/tasks/${taskId}/attachments`);
  return response.data;
};

export const uploadTaskAttachment = async (taskId: number, formData: FormData) => {
  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============================
// ANALYTICS & STATS (статистика)
// ============================
export const getMyStats = async () => {
  const response = await api.get('/analytics/me');
  return response.data;
};

export const getStats = async (pilotId?: number) => {
  if (pilotId) {
    const response = await api.get(`/analytics/pilot/${pilotId}`);
    return response.data;
  }
  const response = await api.get('/analytics/me');
  return response.data;
};

export const getGlobalRating = async () => {
  const response = await api.get('/analytics/global-rating');
  return response.data;
};

// ============================
// ML (прогнозы и аномалии)
// ============================
export const getMLPrediction = async () => {
  const response = await api.get('/ml/predict');
  return response.data;
};

export const getMLAnomaly = async () => {
  const response = await api.get('/ml/anomaly');
  return response.data;
};

export const getMLTrend = async () => {
  const response = await api.get('/ml/trend');
  return response.data;
};

export const trainML = async () => {
  const response = await api.post('/ml/train');
  return response.data;
};

// ============================
// ADMIN: MASTERS (управление мастерами – только для основателя)
// ============================
export const getMastersAdmin = async () => {
  const response = await api.get('/admin/masters');
  return response.data;
};

export const createMaster = async (data: { login: string; password: string }) => {
  const response = await api.post('/admin/masters', data);
  return response.data;
};

export const deleteMaster = async (id: number) => {
  await api.delete(`/admin/masters/${id}`);
};

// ============================
// ADMIN: PILOTS (управление пилотами – для мастера и основателя)
// ============================
export const getPilotsAdmin = async () => {
  const response = await api.get('/admin/pilots');
  return response.data;
};

export const createPilot = async (data: { login: string; password: string; pilot_type?: string }) => {
  const response = await api.post('/admin/pilots', data);
  return response.data;
};

export const deletePilot = async (id: number) => {
  await api.delete(`/admin/pilots/${id}`);
};

// ============================
// REPORTS (отчёты)
// ============================
export const getReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

export const generateReport = async (date: string) => {
  const response = await api.post('/reports', { date });
  return response.data;
};