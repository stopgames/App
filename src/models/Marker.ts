export interface Marker {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  type: 'drone' | 'reb' | 'other';
  createdBy: number;
  createdAt: string;
}