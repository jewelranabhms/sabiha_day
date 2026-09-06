'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { todayStr } from '@/lib/format';

/**
 * Every write inside Sabiha's Day goes through here.
 *
 * All of them are scoped to the signed-in user id — an action can never touch
 * another person's rows. In production the same rule is enforced again by
 * Postgres Row Level Security (`database/policies.sql`).
 */

async function me() {
  const session = await getDaySession();
  if (!session) redirect('/day/login');
  if (session.pinLocked) redirect('/day/lock');
  return session;
}

function revalidateDay(path = '/day') {
  revalidatePath(path, 'layout');
}

/* ── mood + today's little things ──────────────────────────────────────── */

export async function setMood(formData: FormData) {
  const s = await me();
  const mood = Number(formData.get('mood'));
  if (!(mood >= 1 && mood <= 5)) return;

  const rows = await db().all('daily_checks');
  const today = todayStr();
  const existing = rows.find((r) => r.userId === s.userId && r.checkDate === today);

  if (existing) {
    await db().update('daily_checks', existing.id, { mood });
  } else {
    await db().insert('daily_checks', {
      userId: s.userId, checkDate: today, mood, littleThings: {}, note: null,
    });
  }
  revalidateDay();
}

export async function toggleLittleThing(formData: FormData) {
  const s = await me();
  const key = String(formData.get('key') || '');
  const value = formData.get('value') === 'true';
  if (!key) return;

  const rows = await db().all('daily_checks');
  const today = todayStr();
  const existing = rows.find((r) => r.userId === s.userId && r.checkDate === today);

  if (existing) {
    await db().update('daily_checks', existing.id, {
      littleThings: { ...(existing.littleThings || {}), [key]: value },
    });
  } else {
    await db().insert('daily_checks', {
      userId: s.userId, checkDate: today, mood: null, littleThings: { [key]: value }, note: null,
    });
  }
  revalidateDay();
}

/* ── journal ───────────────────────────────────────────────────────────── */

const journalSchema = z.object({
  content: z.string().trim().min(1).max(20000),
  mood: z.coerce.number().int().min(1).max(5).nullable().optional(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function saveJournalEntry(formData: FormData) {
  const s = await me();
  const parsed = journalSchema.safeParse({
    content: String(formData.get('content') || ''),
    mood: formData.get('mood') ? Number(formData.get('mood')) : null,
    entryDate: String(formData.get('entryDate') || todayStr()),
  });
  if (!parsed.success) throw new Error('Entry could not be saved.');

  const d = parsed.data;
  const rows = await db().all('journal_entries');
  const existing = rows.find(
    (r) => r.userId === s.userId && r.entryDate === d.entryDate,
  );

  if (existing) {
    await db().update('journal_entries', existing.id, {
      content: d.content, mood: d.mood ?? existing.mood,
    });
  } else {
    await db().insert('journal_entries', {
      userId: s.userId,
      entryDate: d.entryDate,
      content: d.content,
      mood: d.mood ?? null,
      photoUrl: null,
      voiceUrl: null,
    });
  }
  revalidatePath('/day/journal');
  revalidatePath('/day');
  revalidatePath('/day/journey');
}

export async function deleteJournalEntry(formData: FormData) {
  const s = await me();
  const id = String(formData.get('id') || '');
  const row = await db().get('journal_entries', id);
  if (row && row.userId === s.userId) await db().remove('journal_entries', id);
  revalidatePath('/day/journal');
  revalidatePath('/day');
  revalidatePath('/day/journey');
}

/* ── prayer (no streaks, no guilt) ─────────────────────────────────────── */

export async function togglePrayer(formData: FormData) {
  const s = await me();
  const key = String(formData.get('key') || '') as
    'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  if (!['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(key)) return;

  const rows = await db().all('prayer_logs');
  const today = todayStr();
  const existing = rows.find((r) => r.userId === s.userId && r.logDate === today);

  if (existing) {
    await db().update('prayer_logs', existing.id, { [key]: !existing[key] } as any);
  } else {
    await db().insert('prayer_logs', {
      userId: s.userId, logDate: today,
      fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
      [key]: true,
    } as any);
  }
  revalidatePath('/day/prayer');
  revalidatePath('/day');
}

/* ── dhikr ─────────────────────────────────────────────────────────────── */

export async function bumpDhikr(formData: FormData) {
  const s = await me();
  const name = String(formData.get('name') || '').trim().slice(0, 60);
  const amount = Number(formData.get('amount') || 1);
  if (!name) return;

  const rows = await db().all('dhikr_logs');
  const today = todayStr();
  const existing = rows.find(
    (r) => r.userId === s.userId && r.logDate === today && r.dhikrName === name,
  );

  if (existing) {
    const count = Math.max(0, existing.count + amount);
    await db().update('dhikr_logs', existing.id, { count, completed: count > 0 });
  } else {
    const count = Math.max(0, amount);
    await db().insert('dhikr_logs', {
      userId: s.userId, dhikrName: name, logDate: today, count, completed: count > 0,
    });
  }
  revalidatePath('/day/dua');
  revalidatePath('/day');
}

export async function markDuaDone(formData: FormData) {
  const s = await me();
  const name = String(formData.get('name') || '').trim().slice(0, 80);
  if (!name) return;
  const rows = await db().all('dhikr_logs');
  const today = todayStr();
  const existing = rows.find(
    (r) => r.userId === s.userId && r.logDate === today && r.dhikrName === `dua:${name}`,
  );
  if (existing) {
    await db().update('dhikr_logs', existing.id, { completed: !existing.completed });
  } else {
    await db().insert('dhikr_logs', {
      userId: s.userId, dhikrName: `dua:${name}`, logDate: today, count: 1, completed: true,
    });
  }
  revalidatePath('/day/dua');
  revalidatePath('/day');
}

export async function saveFavouriteDua(formData: FormData) {
  const s = await me();
  const title = String(formData.get('title') || '').trim().slice(0, 80);
  const body = String(formData.get('body') || '').trim().slice(0, 1000);
  if (!body) throw new Error('দোয়াটি লিখুন।');
  await db().insert('favourite_duas', {
    userId: s.userId, title: title || 'আমার পছন্দের দোয়া', body,
  });
  revalidatePath('/day/dua');
}

export async function deleteFavouriteDua(formData: FormData) {
  const s = await me();
  const id = String(formData.get('id') || '');
  const row = await db().get('favourite_duas', id);
  if (row && row.userId === s.userId) await db().remove('favourite_duas', id);
  revalidatePath('/day/dua');
}

/* ── visitors: "আজ কে এসেছিল?" ─────────────────────────────────────────── */

export async function addVisitor(formData: FormData) {
  const s = await me();
  const name = String(formData.get('name') || '').trim().slice(0, 60);
  if (!name) throw new Error('নাম লিখুন।');
  await db().insert('visitors', {
    userId: s.userId,
    name,
    relationship: String(formData.get('relationship') || '').trim().slice(0, 40) || null,
    visitDate: String(formData.get('visitDate') || todayStr()),
    note: String(formData.get('note') || '').trim().slice(0, 500) || null,
    photoUrl: null,
  });
  revalidatePath('/day/visitors');
  revalidatePath('/day/journey');
}

export async function removeRow(formData: FormData) {
  const s = await me();
  const table = String(formData.get('table') || '') as any;
  const id = String(formData.get('id') || '');
  const allowed = [
    'visitors', 'little_victories', 'memories', 'photos', 'voice_diaries', 'contacts',
  ] as const;
  if (!allowed.includes(table)) return;

  const row: any = await db().get(table, id);
  if (!row || row.userId !== s.userId) return;
  await db().remove(table, id);
  revalidatePath('/day', 'layout');
}

/* ── little victories ──────────────────────────────────────────────────── */

export async function addVictory(formData: FormData) {
  const s = await me();
  const content = String(formData.get('content') || '').trim().slice(0, 500);
  if (!content) throw new Error('আজকের ছোট্ট জয়টা লিখুন।');
  await db().insert('little_victories', {
    userId: s.userId,
    date: String(formData.get('date') || todayStr()),
    content,
    photoUrl: null,
  });
  revalidatePath('/day/victories');
  revalidatePath('/day');
  revalidatePath('/day/journey');
}

/* ── people & memories ─────────────────────────────────────────────────── */

export async function addMemory(formData: FormData) {
  const s = await me();
  const title = String(formData.get('title') || '').trim().slice(0, 120);
  if (!title) throw new Error('শিরোনাম লিখুন।');
  await db().insert('memories', {
    userId: s.userId,
    title,
    description: String(formData.get('description') || '').trim().slice(0, 1000) || null,
    personName: String(formData.get('personName') || '').trim().slice(0, 60) || null,
    relationship: String(formData.get('relationship') || '').trim().slice(0, 40) || null,
    memoryDate: String(formData.get('memoryDate') || todayStr()),
    photoUrl: null,
  });
  revalidatePath('/day/people');
  revalidatePath('/day/journey');
}

/* ── contacts ──────────────────────────────────────────────────────────── */

export async function addContact(formData: FormData) {
  const s = await me();
  const name = String(formData.get('name') || '').trim().slice(0, 60);
  if (!name) throw new Error('নাম লিখুন।');
  await db().insert('contacts', {
    userId: s.userId,
    name,
    relationship: String(formData.get('relationship') || '').trim().slice(0, 40) || null,
    phone: String(formData.get('phone') || '').trim().slice(0, 24) || null,
    sortOrder: 0,
  });
  revalidatePath('/day/contacts');
}

/* ── photos & voice diary ──────────────────────────────────────────────── */

export async function addPhoto(formData: FormData) {
  const s = await me();
  const url = String(formData.get('photoUrl') || '').trim();
  if (!url.startsWith('/api/day/media/')) return; // only our own private media
  await db().insert('photos', {
    userId: s.userId,
    photoUrl: url,
    caption: String(formData.get('caption') || '').trim().slice(0, 300) || null,
    photoDate: String(formData.get('photoDate') || todayStr()),
  });
  revalidatePath('/day/photos');
  revalidatePath('/day/journey');
}

export async function addVoiceDiary(formData: FormData) {
  const s = await me();
  const url = String(formData.get('audioUrl') || '').trim();
  if (!url.startsWith('/api/day/media/')) return;
  await db().insert('voice_diaries', {
    userId: s.userId,
    audioUrl: url,
    durationS: Number(formData.get('durationS') || 0) || null,
    transcript: String(formData.get('transcript') || '').trim().slice(0, 4000) || null,
    date: String(formData.get('date') || todayStr()),
  });
  revalidatePath('/day/voice');
  revalidatePath('/day');
  revalidatePath('/day/journey');
}

/* ── settings ──────────────────────────────────────────────────────────── */

async function settingsRow(userId: string) {
  const rows = await db().all('app_settings');
  return rows.find((r) => r.userId === userId) ?? null;
}

export async function toggleSetting(formData: FormData) {
  const s = await me();
  const group = String(formData.get('group') || '') as 'notifications' | 'exportInclude';
  const key = String(formData.get('key') || '');
  const value = formData.get('value') === 'true';
  if (!['notifications', 'exportInclude'].includes(group) || !key) return;

  const existing = await settingsRow(s.userId);
  if (existing) {
    const current = (existing[group] || {}) as Record<string, boolean>;
    await db().update('app_settings', existing.id, { [group]: { ...current, [key]: value } } as any);
  } else {
    await db().insert('app_settings', {
      userId: s.userId,
      notifications: group === 'notifications' ? { [key]: value } : {},
      exportInclude: group === 'exportInclude' ? { [key]: value } : {},
    } as any);
  }
  revalidatePath('/day/settings');
}

/**
 * "Delete Account" — wipes every private row belonging to this user.
 * Public content (approved messages, updates, timeline) is untouched.
 */
export async function deleteMyPrivateData(formData: FormData) {
  const s = await me();
  const confirmText = String(formData.get('confirm') || '').trim();
  if (confirmText !== 'DELETE') return;

  const tables = [
    'journal_entries', 'daily_checks', 'prayer_logs', 'dhikr_logs',
    'favourite_duas', 'visitors', 'little_victories', 'memories',
    'photos', 'voice_diaries', 'contacts', 'app_settings',
  ] as const;

  for (const t of tables) {
    const rows: any[] = await db().all(t);
    for (const r of rows) {
      if (r.userId === s.userId) await db().remove(t, r.id);
    }
  }
  revalidatePath('/day', 'layout');
}
