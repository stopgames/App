export interface User {
  id: number;
  login: string;
  role: 'founder' | 'master' | 'pilot' | 'reb' | 'rer' | 'observer';
  pilotType?: 'fpv' | 'kt' | null;
  nickname?: string;
  startX?: number;
  startY?: number;
}