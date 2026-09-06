import { localStore } from './local-store';
import { supabaseStore } from './supabase-store';
import type { Store } from './types';

/**
 * One entry point. `DATA_SOURCE=supabase` in `.env` switches the whole system
 * from the local demo store to production Postgres — no code changes needed.
 */
function resolve(): Store {
  const source = (process.env.DATA_SOURCE || 'local').toLowerCase();
  if (source === 'supabase') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) return supabaseStore;
    console.warn(
      '[db] DATA_SOURCE=supabase but Supabase env vars are missing — falling back to the local store.',
    );
  }
  return localStore;
}

let cached: Store | null = null;

export function db(): Store {
  if (!cached) cached = resolve();
  return cached;
}

export const isLocal = () => db().kind === 'local';

export * from './types';
export { resetLocalStore } from './local-store';
