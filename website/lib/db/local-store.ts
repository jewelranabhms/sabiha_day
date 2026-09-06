import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { seed as SEED } from './seed';
import type { Row, Store, TableName, TableMap } from './types';

/**
 * Local, file-backed store.
 *
 * Used for development and for the live demo — zero infrastructure, works
 * instantly, and is safe to reset at any time. Production uses Supabase
 * (see `supabase-store.ts`) with the exact same interface.
 *
 * Data file: website/data/db.json  (gitignored — never commit real journals)
 */

const TABLES = Object.keys(SEED) as TableName[];

type DB = { [K in TableName]: Row<K>[] };

function freshDb(): DB {
  const db = {} as DB;
  for (const t of TABLES) {
    // deep copy so runtime mutations never touch the seed object
    (db as any)[t] = JSON.parse(JSON.stringify((SEED as any)[t]));
  }
  return db;
}

let cache: DB | null = null;
let cacheFile: string | null = null;
let writeTimer: NodeJS.Timeout | null = null;

function filePath(): string {
  const rel = process.env.LOCAL_DATA_FILE || 'data/db.json';
  return path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
}

function load(): DB {
  const file = filePath();
  if (cache && cacheFile === file) return cache;

  try {
    if (fs.existsSync(file)) {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<DB>;
      const db = freshDb();
      for (const t of TABLES) {
        if (Array.isArray(raw[t])) (db as any)[t] = raw[t];
      }
      cache = db;
      cacheFile = file;
      return db;
    }
  } catch (err) {
    console.error('[local-store] could not read data file, starting fresh:', err);
  }

  const db = freshDb();
  cache = db;
  cacheFile = file;
  persist(file, db);
  return db;
}

function persist(file: string, db: DB) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  } catch (err) {
    console.error('[local-store] could not write data file:', err);
  }
}

function schedulePersist() {
  const file = filePath();
  if (!cache) return;
  if (writeTimer) clearTimeout(writeTimer);
  // coalesce bursts of writes
  writeTimer = setTimeout(() => persist(file, cache!), 60);
  // never leave the process hanging on the timer
  writeTimer.unref?.();
}

const CREATED_AT_TABLES = new Set<TableName>([
  'app_users', 'messages', 'updates', 'treatment_events', 'donations',
  'journal_entries', 'favourite_duas', 'visitors', 'little_victories',
  'voice_diaries', 'contacts',
]);
const UPDATED_AT_TABLES = new Set<TableName>([
  'app_settings',
  'app_users', 'sabiha_profile', 'updates', 'journal_entries',
]);

export const localStore: Store = {
  kind: 'local',

  async all<K extends TableName>(table: K): Promise<Row<K>[]> {
    const db = load();
    return structuredClone((db[table] ?? []) as Row<K>[]);
  },

  async get<K extends TableName>(table: K, id: string): Promise<Row<K> | null> {
    const db = load();
    const row = ((db[table] ?? []) as Row<K>[]).find((r: any) => r.id === id);
    return row ? structuredClone(row) : null;
  },

  async insert<K extends TableName>(table: K, row: Partial<Row<K>>): Promise<Row<K>> {
    const db = load();
    const nowIso = new Date().toISOString();
    const record: any = { id: randomUUID(), ...row };
    if (CREATED_AT_TABLES.has(table) && !record.createdAt) record.createdAt = nowIso;
    if (UPDATED_AT_TABLES.has(table) && !record.updatedAt) record.updatedAt = nowIso;
    const list = (db[table] ?? []) as any[];
    list.unshift(record);
    (db as any)[table] = list;
    schedulePersist();
    return structuredClone(record as Row<K>);
  },

  async update<K extends TableName>(
    table: K, id: string, patch: Partial<Row<K>>,
  ): Promise<Row<K> | null> {
    const db = load();
    const list = (db[table] ?? []) as any[];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const nowIso = new Date().toISOString();
    list[idx] = { ...list[idx], ...patch };
    if (UPDATED_AT_TABLES.has(table)) list[idx].updatedAt = nowIso;
    schedulePersist();
    return structuredClone(list[idx] as Row<K>);
  },

  async remove<K extends TableName>(table: K, id: string): Promise<boolean> {
    const db = load();
    const list = (db[table] ?? []) as any[];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    schedulePersist();
    return true;
  },
};

/** Reset the local store back to seed data (used by `npm run seed`). */
export function resetLocalStore() {
  const file = filePath();
  const db = freshDb();
  cache = db;
  cacheFile = file;
  persist(file, db);
}

export type { TableMap };
