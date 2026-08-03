export interface Flight {
  id?: number;
  pilotId: number;
  droneId: number;
  type: 'fpv' | 'kt';
  takeoffTime: string;
  landingTime?: string;
  durationMinutes?: number;
  result?: string;
  targetX?: number;
  targetY?: number;
  distanceKm?: number;
  ammo?: string;
  flightArea?: string;
  videoRecorded?: boolean;
  videoMissingReason?: string;
  objectiveWitnessId?: number;
  synced: number; // 0 = локально, 1 = на сервере
}