import { syncPull, syncPush } from './api';
import { insertOrUpdate, getUnsyncedFlights, markFlightSynced } from './localDb';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SYNC_KEY = 'last_sync';

export const pullData = async () => {
  const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY) || new Date(0).toISOString();
  const data = await syncPull(lastSync);
  // data: { drones, flights, markers, users, reb_zones }
  for (const table of ['drones', 'flights', 'markers', 'users', 'reb_zones']) {
    if (data[table]) {
      for (const item of data[table]) {
        await insertOrUpdate(table, item);
      }
    }
  }
  await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  return data;
};

export const pushData = async () => {
  const unsynced = await getUnsyncedFlights();
  if (unsynced.length === 0) return;
  const changes = unsynced.map((f: any) => ({ table: 'flights', operation: 'insert', data: f }));
  await syncPush(changes);
  for (const f of unsynced) {
    await markFlightSynced(f.id);
  }
};