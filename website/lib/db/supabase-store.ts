import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Row, Store, TableName } from './types';

/**
 * Production store — Supabase Postgres.
 *
 * Implements the exact same `Store` interface as the local JSON store, so
 * switching backends is one environment variable:
 *
 *     DATA_SOURCE=supabase
 *     NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY=...      # server-side only, never exposed
 *
 * SECURITY NOTES
 *  · The service-role key bypasses RLS. It is only ever used inside Next.js
 *    server components / route handlers — never imported by client code.
 *  · For the private app, prefer creating a Supabase client with the user's
 *    own session (see `supabaseBrowser()`), so RLS enforces that only Sabiha
 *    can read her journal.
 */

const COLUMN_OVERRIDES: Partial<Record<TableName, Record<string, string>>> = {
  little_victories: { date: 'v_date' },
  voice_diaries: { date: 'v_date' },
};

const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());

function mapKeys<T extends TableName>(table: T, obj: any, toSql: boolean): any {
  if (obj == null) return obj;
  const overrides: Record<string, string> = COLUMN_OVERRIDES[table] ?? {};
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    let key = k;
    if (toSql) {
      key = overrides[k] ?? toSnake(k);
    } else {
      const rev = Object.entries(overrides).find(([, sql]) => sql === k)?.[0];
      key = rev ?? k.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
    }
    out[key] = v;
  }
  return out;
}

let client: SupabaseClient | null = null;

function svc(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'DATA_SOURCE=supabase requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    );
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export const supabaseStore: Store = {
  kind: 'supabase',

  async all<K extends TableName>(table: K): Promise<Row<K>[]> {
    const { data, error } = await svc().from(table).select('*');
    if (error) throw new Error(`supabase.all(${table}): ${error.message}`);
    return (data ?? []).map((r) => mapKeys(table, r, false) as Row<K>);
  },

  async get<K extends TableName>(table: K, id: string): Promise<Row<K> | null> {
    const { data, error } = await svc().from(table).select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`supabase.get(${table}): ${error.message}`);
    return data ? (mapKeys(table, data, false) as Row<K>) : null;
  },

  async insert<K extends TableName>(table: K, row: Partial<Row<K>>): Promise<Row<K>> {
    const payload = mapKeys(table, row, true);
    delete payload.id; // let Postgres generate it
    const { data, error } = await svc().from(table).insert(payload).select().single();
    if (error) throw new Error(`supabase.insert(${table}): ${error.message}`);
    return mapKeys(table, data, false) as Row<K>;
  },

  async update<K extends TableName>(
    table: K, id: string, patch: Partial<Row<K>>,
  ): Promise<Row<K> | null> {
    const payload = mapKeys(table, patch, true);
    delete payload.id;
    const { data, error } = await svc().from(table).update(payload).eq('id', id).select().maybeSingle();
    if (error) throw new Error(`supabase.update(${table}): ${error.message}`);
    return data ? (mapKeys(table, data, false) as Row<K>) : null;
  },

  async remove<K extends TableName>(table: K, id: string): Promise<boolean> {
    const { error } = await svc().from(table).delete().eq('id', id);
    if (error) throw new Error(`supabase.remove(${table}): ${error.message}`);
    return true;
  },
};
