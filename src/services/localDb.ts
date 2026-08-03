import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';

let db: SQLite.SQLiteDatabase;

export const initDb = async () => {
  db = await SQLite.openDatabaseAsync('fpv_app.db');
  await createTables();
};

const createTables = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      login TEXT,
      role TEXT,
      pilot_type TEXT,
      nickname TEXT,
      start_x REAL,
      start_y REAL,
      unit TEXT
    );
    CREATE TABLE IF NOT EXISTS drones (
      id INTEGER PRIMARY KEY,
      pilot_id INTEGER,
      name TEXT,
      type TEXT,
      video_freq TEXT,
      control_system TEXT,
      total_quantity INTEGER,
      remaining_quantity INTEGER,
      is_active INTEGER
    );
    CREATE TABLE IF NOT EXISTS flights (
      id INTEGER PRIMARY KEY,
      pilot_id INTEGER,
      drone_id INTEGER,
      type TEXT,
      takeoff_time TEXT,
      landing_time TEXT,
      duration_minutes REAL,
      result TEXT,
      target_x REAL,
      target_y REAL,
      distance_km REAL,
      ammo TEXT,
      flight_area TEXT,
      video_recorded INTEGER,
      video_missing_reason TEXT,
      objective_witness_id INTEGER,
      synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS markers (
      id INTEGER PRIMARY KEY,
      latitude REAL,
      longitude REAL,
      name TEXT,
      type TEXT,
      created_by INTEGER,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS reb_zones (
      id INTEGER PRIMARY KEY,
      name TEXT,
      latitude REAL,
      longitude REAL,
      radius REAL,
      created_by INTEGER
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      created_by INTEGER,
      assigned_to INTEGER,
      status TEXT,
      latitude REAL,
      longitude REAL,
      target_type TEXT,
      description TEXT,
      created_at TEXT,
      updated_at TEXT,
      deadline TEXT,
      is_deleted INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS task_attachments (
      id INTEGER PRIMARY KEY,
      task_id INTEGER,
      file_url TEXT,
      file_type TEXT,
      uploaded_by INTEGER,
      uploaded_at TEXT
    );
    CREATE TABLE IF NOT EXISTS flight_attachments (
      id INTEGER PRIMARY KEY,
      flight_id INTEGER,
      file_url TEXT,
      file_type TEXT,
      uploaded_by INTEGER,
      uploaded_at TEXT,
      is_deleted INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT,
      operation TEXT,
      data TEXT,
      client_updated_at TEXT,
      status TEXT DEFAULT 'pending'
    );
  `);
};

export const insertOrUpdate = async (table: string, data: Record<string, any>) => {
  const id = data.id;
  if (id) {
    await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
  }
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(',');
  const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
  await db.runAsync(sql, keys.map(k => data[k]));
};

export const query = async (sql: string, params: any[] = []) => {
  return await db.getAllAsync(sql, params);
};

export const getUnsyncedFlights = async () => {
  return await query('SELECT * FROM flights WHERE synced = 0');
};

export const markFlightSynced = async (id: number) => {
  await db.runAsync('UPDATE flights SET synced = 1 WHERE id = ?', [id]);
};