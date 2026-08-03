export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const isValidLogin = (login: string): boolean => {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(login);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
};

export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

export const isNumeric = (value: string): boolean => {
  return /^-?\d+(\.\d+)?$/.test(value);
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('ru-RU');
};

export const timeAgo = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин. назад`;
  if (diffHour < 24) return `${diffHour} ч. назад`;
  if (diffDay < 7) return `${diffDay} дн. назад`;
  return formatDate(d);
};

export const getResultColor = (result: string): string => {
  const map: Record<string, string> = {
    'result_fpv_target': '#28a745',
    'result_fpv_area': '#ffc107',
    'result_fpv_jammed': '#17a2b8',
    'result_fpv_interfered': '#fd7e14',
    'result_fpv_malfunction': '#6c757d',
    'result_fpv_shotdown': '#dc3545',
    'result_fpv_exploded': '#dc3545',
    'result_kt_completed': '#28a745',
    'result_kt_shotdown': '#dc3545',
    'result_kt_weather': '#6c757d',
  };
  return map[result] || '#6c757d';
};

export const getResultLabel = (result: string): string => {
  const map: Record<string, string> = {
    'result_fpv_target': 'Попадание в цель',
    'result_fpv_area': 'Попадание в район',
    'result_fpv_jammed': 'Заглушил РЭБ',
    'result_fpv_interfered': 'Перебили картинку',
    'result_fpv_malfunction': 'Неисправность',
    'result_fpv_shotdown': 'Сбили',
    'result_fpv_exploded': 'Подрыв на старте',
    'result_kt_completed': 'Завершено',
    'result_kt_shotdown': 'Сбили',
    'result_kt_weather': 'Погода',
  };
  return map[result] || result;
};

export const getResultIcon = (result: string): string => {
  const map: Record<string, string> = {
    'result_fpv_target': '🎯',
    'result_fpv_area': '📍',
    'result_fpv_jammed': '📡',
    'result_fpv_interfered': '📺',
    'result_fpv_malfunction': '🔧',
    'result_fpv_shotdown': '💥',
    'result_fpv_exploded': '💣',
    'result_kt_completed': '✅',
    'result_kt_shotdown': '💥',
    'result_kt_weather': '🌧',
  };
  return map[result] || '❓';
};

export const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'Ожидает',
    assigned: 'Назначено',
    in_progress: 'В работе',
    completed: 'Выполнено',
    cancelled: 'Отменено',
  };
  return map[status] || status;
};