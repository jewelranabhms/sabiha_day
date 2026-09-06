import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for the mobile app.
 *
 * IMPORTANT: the app signs in as Sabiha herself, so every query runs under
 * HER session. Row Level Security then guarantees that:
 *   · journal_entries / daily_checks / voice_diaries / photos / memories are
 *     readable only by her
 *   · messages are readable only when status = 'approved'
 *   · treatment_events with visibility = 'private' are readable by her too
 *
 * The service-role key is never shipped in this app.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (_client) return _client;
  if (!url || !anonKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copy app/.env.example to app/.env and fill in your Supabase project.',
    );
  }
  _client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _client;
}

export const isConfigured = () => !!(url && anonKey);
