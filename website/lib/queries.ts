
import { db } from './db';
import { site } from './site';
import type {
  Donation, Dua, Message, Profile, TreatmentEvent, Update,
} from './db/types';

/* ─────────────────────────── public site ─────────────────────────────── */

export async function getProfile(): Promise<Profile | null> {
  const rows = await db().all('sabiha_profile');
  return rows[0] ?? null;
}

export async function approvedMessages(limit = 24): Promise<Message[]> {
  const rows = await db().all('messages');
  return rows
    .filter((m) => m.status === 'approved')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export async function messageCount(): Promise<number> {
  const rows = await db().all('messages');
  return rows.filter((m) => m.status === 'approved').length;
}

export async function pendingMessages(): Promise<Message[]> {
  const rows = await db().all('messages');
  return rows
    .filter((m) => m.status === 'pending')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function randomApprovedMessage(excludeId?: string): Promise<Message | null> {
  const rows = await approvedMessages(1000);
  const pool = excludeId && rows.length > 1 ? rows.filter((r) => r.id !== excludeId) : rows;
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function publishedUpdates(limit = 20): Promise<Update[]> {
  const rows = await db().all('updates');
  return rows
    .filter((u) => u.published)
    .sort((a, b) => ((a.publishedAt ?? a.createdAt) < (b.publishedAt ?? b.createdAt) ? 1 : -1))
    .slice(0, limit);
}

export async function latestUpdate(): Promise<Update | null> {
  return (await publishedUpdates(1))[0] ?? null;
}

export async function publicTreatmentEvents(): Promise<TreatmentEvent[]> {
  const rows = await db().all('treatment_events');
  return rows
    .filter((e) => e.visibility === 'public')
    .sort((a, b) => (a.eventDate < b.eventDate ? -1 : 1));
}

export async function fundSummary() {
  const [donations, goalRows] = await Promise.all([
    db().all('donations'),
    db().all('fund_goal'),
  ]);
  const received = (donations as Donation[])
    .filter((d) => d.verified)
    .reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const target = Number(goalRows[0]?.target || site.donation.defaultTarget);
  return {
    received,
    target,
    label: goalRows[0]?.label || site.donation.fundLabel,
    donors: (donations as Donation[]).filter((d) => d.verified).length,
    percent: target > 0 ? Math.min(100, Math.round((received / target) * 100)) : 0,
  };
}

/* ─────────────────────────── private app ─────────────────────────────── */

export async function duasByCategory(category: string): Promise<Dua[]> {
  const rows = await db().all('duas');
  return rows
    .filter((d) => d.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * The Easter egg: when a journal entry sounds like a hard day the app does
 * NOT give medical advice. It offers one gentle line, then a kind message
 * sent by someone else.
 */
export function detectHardDay(text: string): boolean {
  const t = text.toLowerCase();
  return site.hardDayResponse.triggerWords.some((w) => t.includes(w.toLowerCase()));
}

/* ─────────────────────────── admin stats ─────────────────────────────── */

export async function adminStats() {
  const [messages, updates, donations, pending, events] = await Promise.all([
    db().all('messages'),
    db().all('updates'),
    db().all('donations'),
    pendingMessages(),
    db().all('treatment_events'),
  ]);
  return {
    messages: (messages as Message[]).filter((m) => m.status === 'approved').length,
    pending: pending.length,
    updates: (updates as Update[]).filter((u) => u.published).length,
    events: events.length,
    donations: (donations as Donation[])
      .filter((d) => d.verified)
      .reduce((s, d) => s + Number(d.amount || 0), 0),
    unverifiedDonations: (donations as Donation[]).filter((d) => !d.verified).length,
  };
}
