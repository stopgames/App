export interface Drone {
  id: number;
  pilotId: number;
  name: string;
  type: 'fpv' | 'kt';
  videoFreq?: string;
  controlSystem?: string;
  totalQuantity?: number;
  remainingQuantity?: number;
  isActive: boolean;
}