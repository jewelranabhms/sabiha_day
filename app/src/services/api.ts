import { supabase } from './supabase';

/**
 * Data layer for Sabiha's Day.
 *
 * Column names are snake_case — exactly as in `database/schema.sql`.
 * Every private query is scoped by RLS to the signed-in user, so the app
 * never has to (and never should) filter by someone else's id.
 */

export const todayISO = () => new Date().toISOString().slice(0, 10);

const sb = () => supabase();

/* ── auth ──────────────────────────────────────────────────────────────── */

export async function signIn(email: string, password: string) {
  const { data, error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await sb().auth.signOut();
}

export async function currentUser() {
  const { data } = await sb().auth.getUser();
  return data.user;
}

/* ── mood + today's little things ──────────────────────────────────────── */

export async function getDailyCheck(date = todayISO()) {
  const { data } = await sb()
    .from('daily_checks')
    .select('*')
    .eq('check_date', date)
    .maybeSingle();
  return data as DailyCheck | null;
}

export async function upsertDailyCheck(date: string, patch: Partial<DailyCheckRow>) {
  const existing = await getDailyCheck(date);
  if (existing) {
    const { data } = await sb()
      .from('daily_checks')
      .update(patch)
      .eq('id', existing.id)
      .select()
      .single();
    return data;
  }
  const { data } = await sb()
    .from('daily_checks')
    .insert({ check_date: date, little_things: {}, ...patch })
    .select()
    .single();
  return data;
}

/* ── journal ───────────────────────────────────────────────────────────── */

export async function listJournal(limit = 200) {
  const { data } = await sb()
    .from('journal_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(limit);
  return (data ?? []) as JournalRow[];
}

export async function getJournalFor(date: string) {
  const { data } = await sb()
    .from('journal_entries')
    .select('*')
    .eq('entry_date', date)
    .maybeSingle();
  return data as JournalRow | null;
}

export async function saveJournal(date: string, content: string, mood: number | null) {
  const existing = await getJournalFor(date);
  if (existing) {
    const { data } = await sb()
      .from('journal_entries')
      .update({ content, mood: mood ?? existing.mood, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    return data;
  }
  const { data } = await sb()
    .from('journal_entries')
    .insert({ entry_date: date, content, mood })
    .select()
    .single();
  return data;
}

export async function deleteJournal(id: string) {
  await sb().from('journal_entries').delete().eq('id', id);
}

/* ── messages (approved only — enforced by RLS) ────────────────────────── */

export async function listMessages(limit = 100) {
  const { data } = await sb()
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as MessageRow[];
}

export async function randomMessage(excludeId?: string) {
  const all = await listMessages(200);
  const pool = excludeId && all.length > 1 ? all.filter((m) => m.id !== excludeId) : all;
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── prayer ────────────────────────────────────────────────────────────── */

export async function getPrayerLog(date = todayISO()) {
  const { data } = await sb().from('prayer_logs').select('*').eq('log_date', date).maybeSingle();
  return data as PrayerRow | null;
}

export async function togglePrayer(key: keyof PrayerFlags, date = todayISO()) {
  const log = await getPrayerLog(date);
  if (log) {
    await sb().from('prayer_logs').update({ [key]: !log[key] }).eq('id', log.id);
  } else {
    await sb()
      .from('prayer_logs')
      .insert({ log_date: date, fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, [key]: true });
  }
}

export async function weekPrayers() {
  const from = new Date();
  from.setDate(from.getDate() - 6);
  const { data } = await sb()
    .from('prayer_logs')
    .select('*')
    .gte('log_date', from.toISOString().slice(0, 10));
  return (data ?? []) as PrayerRow[];
}

/* ── dua & dhikr ───────────────────────────────────────────────────────── */

export async function listDuas(category?: string) {
  let q = sb().from('duas').select('*').order('sort_order');
  if (category) q = q.eq('category', category);
  const { data } = await q;
  return (data ?? []) as DuaRow[];
}

export async function getDhikr(date = todayISO()) {
  const { data } = await sb().from('dhikr_logs').select('*').eq('log_date', date);
  return (data ?? []) as DhikrRow[];
}

export async function bumpDhikr(name: string, amount: number, date = todayISO()) {
  const { data } = await sb()
    .from('dhikr_logs')
    .select('*')
    .eq('log_date', date)
    .eq('dhikr_name', name)
    .maybeSingle();

  if (data) {
    const count = Math.max(0, (data.count ?? 0) + amount);
    await sb().from('dhikr_logs').update({ count, completed: count > 0 }).eq('id', data.id);
  } else {
    const count = Math.max(0, amount);
    await sb()
      .from('dhikr_logs')
      .insert({ dhikr_name: name, log_date: date, count, completed: count > 0 });
  }
}

export async function toggleDuaRead(title: string, date = todayISO()) {
  const key = `dua:${title}`;
  const { data } = await sb()
    .from('dhikr_logs')
    .select('*')
    .eq('log_date', date)
    .eq('dhikr_name', key)
    .maybeSingle();

  if (data) {
    await sb().from('dhikr_logs').update({ completed: !data.completed }).eq('id', data.id);
  } else {
    await sb().from('dhikr_logs').insert({ dhikr_name: key, log_date: date, count: 1, completed: true });
  }
}

export async function listFavouriteDuas() {
  const { data } = await sb().from('favourite_duas').select('*').order('created_at', { ascending: false });
  return (data ?? []) as FavouriteRow[];
}

export async function addFavouriteDua(title: string, body: string) {
  await sb().from('favourite_duas').insert({ title: title || 'আমার পছন্দের দোয়া', body });
}

export async function deleteFavouriteDua(id: string) {
  await sb().from('favourite_duas').delete().eq('id', id);
}

/* ── visitors / victories / memories / photos / voice / contacts ───────── */

export async function listVisitors(limit = 200) {
  const { data } = await sb().from('visitors').select('*').order('visit_date', { ascending: false }).limit(limit);
  return (data ?? []) as VisitorRow[];
}
export async function addVisitor(v: { name: string; relationship?: string; note?: string; visit_date?: string }) {
  await sb().from('visitors').insert({ visit_date: todayISO(), ...v });
}

export async function listVictories(limit = 300) {
  const { data } = await sb().from('little_victories').select('*').order('v_date', { ascending: false }).limit(limit);
  return (data ?? []) as VictoryRow[];
}
export async function addVictory(content: string, date = todayISO()) {
  await sb().from('little_victories').insert({ v_date: date, content });
}

export async function listMemories(limit = 300) {
  const { data } = await sb().from('memories').select('*').order('memory_date', { ascending: false }).limit(limit);
  return (data ?? []) as MemoryRow[];
}
export async function addMemory(m: {
  title: string; description?: string; person_name?: string; relationship?: string; memory_date?: string;
}) {
  await sb().from('memories').insert({ memory_date: todayISO(), ...m });
}

export async function listPhotos(limit = 300) {
  const { data } = await sb().from('photos').select('*').order('photo_date', { ascending: false }).limit(limit);
  return (data ?? []) as PhotoRow[];
}

export async function listVoice(limit = 100) {
  const { data } = await sb().from('voice_diaries').select('*').order('v_date', { ascending: false }).limit(limit);
  return (data ?? []) as VoiceRow[];
}

export async function listContacts() {
  const { data } = await sb().from('contacts').select('*').order('sort_order');
  return (data ?? []) as ContactRow[];
}
export async function addContact(c: { name: string; relationship?: string; phone?: string }) {
  await sb().from('contacts').insert(c);
}

export async function deleteFrom(table: string, id: string) {
  const allowed = ['visitors', 'little_victories', 'memories', 'photos', 'voice_diaries', 'contacts', 'favourite_duas'];
  if (!allowed.includes(table)) throw new Error('table not allowed');
  await sb().from(table).delete().eq('id', id);
}

/* ── treatment (private + public) ──────────────────────────────────────── */

export async function listTreatment() {
  const { data } = await sb().from('treatment_events').select('*').order('event_date');
  return (data ?? []) as TreatmentRow[];
}

/* ── storage: private media ────────────────────────────────────────────── */

export async function uploadPrivateMedia(
  userId: string,
  folder: 'voice' | 'photos',
  localUri: string,
  mime: string,
) {
  const ext = mime.includes('webm') ? 'webm' : mime.includes('png') ? 'png' : mime.includes('wav') ? 'wav' : 'jpg';
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const res = await fetch(localUri);
  const blob = await res.blob();
  const { error } = await sb().storage.from('private-media').upload(path, blob, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function privateMediaUrl(path: string, expiresIn = 3600) {
  const { data } = await sb().storage.from('private-media').createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

export async function saveVoiceDiary(audioPath: string, durationS: number, transcript?: string) {
  await sb().from('voice_diaries').insert({
    v_date: todayISO(), audio_url: audioPath, duration_s: durationS, transcript: transcript || null,
  });
}

export async function savePhoto(photoPath: string, caption?: string) {
  await sb().from('photos').insert({
    photo_date: todayISO(), photo_url: photoPath, caption: caption || null,
  });
}

/* ── settings ──────────────────────────────────────────────────────────── */

export async function getSettings() {
  const { data } = await sb().from('app_settings').select('*').maybeSingle();
  return data as SettingsRow | null;
}

export async function setSetting(group: 'notifications' | 'export_include', key: string, value: boolean) {
  const existing = await getSettings();
  if (existing) {
    const current = (existing as any)[group] ?? {};
    await sb().from('app_settings').update({ [group]: { ...current, [key]: value } }).eq('id', existing.id);
  } else {
    await sb().from('app_settings').insert({ [group]: { [key]: value } });
  }
}

/* ── journey timeline (one query, mirrors the SQL view) ────────────────── */

export type JourneyItem = {
  id: string; date: string; kind: string; emoji: string; title: string; detail?: string | null;
};

export async function journeyTimeline(): Promise<JourneyItem[]> {
  const [j, v, p, m, voice, photos, t] = await Promise.all([
    listJournal(400), listVictories(400), listVisitors(400), listMemories(400),
    listVoice(200), listPhotos(400), listTreatment(),
  ]);

  const items: JourneyItem[] = [
    ...j.map((r) => ({ id: `j-${r.id}`, date: r.entry_date, kind: 'journal', emoji: '✍️', title: 'Journal', detail: r.content })),
    ...v.map((r) => ({ id: `v-${r.id}`, date: r.v_date, kind: 'victory', emoji: '🌱', title: 'Little victory', detail: r.content })),
    ...p.map((r) => ({ id: `p-${r.id}`, date: r.visit_date, kind: 'visitor', emoji: '🫂', title: r.name, detail: r.note })),
    ...m.map((r) => ({ id: `m-${r.id}`, date: r.memory_date, kind: 'memory', emoji: '💫', title: r.title, detail: r.description })),
    ...voice.map((r) => ({ id: `a-${r.id}`, date: r.v_date, kind: 'voice', emoji: '🎙️', title: 'Voice diary', detail: r.transcript })),
    ...photos.map((r) => ({ id: `ph-${r.id}`, date: r.photo_date, kind: 'photo', emoji: '📷', title: r.caption || 'A memory', detail: null })),
    ...t.map((r) => ({ id: `t-${r.id}`, date: r.event_date, kind: 'treatment', emoji: '🏥', title: r.title, detail: r.description })),
  ];

  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ── row shapes ────────────────────────────────────────────────────────── */

export type DailyCheckRow = { id: string; check_date: string; mood: number | null; little_things: Record<string, boolean>; note?: string | null };
export type DailyCheck = DailyCheckRow;
export type JournalRow = { id: string; entry_date: string; content: string; mood: number | null; photo_url?: string | null; voice_url?: string | null; created_at: string };
export type MessageRow = { id: string; name: string | null; message: string; category: string; anonymous: boolean; status: string; created_at: string };
export type PrayerFlags = { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean };
export type PrayerRow = { id: string; log_date: string } & PrayerFlags;
export type DuaRow = { id: string; title: string; arabic: string | null; transliteration: string | null; translation: string | null; category: string; sort_order: number };
export type DhikrRow = { id: string; dhikr_name: string; log_date: string; count: number; completed: boolean };
export type FavouriteRow = { id: string; title: string; body: string; created_at: string };
export type VisitorRow = { id: string; name: string; relationship: string | null; visit_date: string; note: string | null };
export type VictoryRow = { id: string; v_date: string; content: string; photo_url: string | null };
export type MemoryRow = { id: string; title: string; description: string | null; person_name: string | null; relationship: string | null; memory_date: string };
export type PhotoRow = { id: string; caption: string | null; photo_url: string; photo_date: string };
export type VoiceRow = { id: string; v_date: string; audio_url: string; duration_s: number | null; transcript: string | null };
export type ContactRow = { id: string; name: string; relationship: string | null; phone: string | null };
export type TreatmentRow = { id: string; title: string; description: string | null; event_date: string; event_type: string; status: string; visibility: string };
export type SettingsRow = { id: string; notifications: Record<string, boolean>; export_include: Record<string, boolean> };
