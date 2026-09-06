'use server';


import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { site } from '@/lib/site';

/**
 * Every mutation below is a Server Action guarded by the admin session.
 * Nothing in this file is reachable from the public website.
 */

async function guard() {
  if (!(await isAdmin())) redirect('/admin/login');
}

function revalidateAdmin() {
  revalidatePath('/admin', 'layout');
  revalidatePath('/');
  revalidatePath('/messages');
  revalidatePath('/journey');
  revalidatePath('/donate');
}

/* ─────────────────────────── messages ─────────────────────────────────── */

export async function approveMessage(formData: FormData) {
  await guard();
  const id = String(formData.get('id') || '');
  // Optional inline edit while approving.
  const edited = String(formData.get('message') || '').trim();
  const patch: any = { status: 'approved', approvedAt: new Date().toISOString(), moderatorNote: null };
  if (edited) patch.message = edited.slice(0, 600);
  await db().update('messages', id, patch);
  revalidateAdmin();
}

export async function rejectMessage(formData: FormData) {
  await guard();
  const id = String(formData.get('id') || '');
  const note = String(formData.get('note') || '').trim();
  await db().update('messages', id, {
    status: 'rejected',
    moderatorNote: note || null,
  });
  revalidateAdmin();
}

export async function deleteMessage(formData: FormData) {
  await guard();
  await db().remove('messages', String(formData.get('id') || ''));
  revalidateAdmin();
}

export async function unapproveMessage(formData: FormData) {
  await guard();
  await db().update('messages', String(formData.get('id') || ''), {
    status: 'pending',
    approvedAt: null,
  });
  revalidateAdmin();
}

/* ─────────────────────────── updates ──────────────────────────────────── */

const updateSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(80),
  content: z.string().trim().min(2).max(1200),
  updateType: z.enum(['general', 'health', 'treatment', 'chemotherapy', 'important']),
  notifyApp: z.coerce.boolean().optional().default(false),
  published: z.coerce.boolean().optional().default(false),
});

export async function saveUpdate(formData: FormData) {
  await guard();
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Invalid update');

  const d = parsed.data;
  const now = new Date().toISOString();

  if (d.id) {
    await db().update('updates', d.id, {
      title: d.title,
      content: d.content,
      updateType: d.updateType,
      notifyApp: !!d.notifyApp,
      published: !!d.published,
      publishedAt: d.published ? now : null,
    });
  } else {
    await db().insert('updates', {
      title: d.title,
      content: d.content,
      updateType: d.updateType,
      notifyApp: !!d.notifyApp,
      published: !!d.published,
      publishedAt: d.published ? now : null,
      createdBy: null,
    });
  }
  revalidateAdmin();
}

export async function toggleUpdatePublished(formData: FormData) {
  await guard();
  const id = String(formData.get('id') || '');
  const row = await db().get('updates', id);
  if (!row) return;
  await db().update('updates', id, {
    published: !row.published,
    publishedAt: !row.published ? new Date().toISOString() : null,
  });
  revalidateAdmin();
}

export async function deleteUpdate(formData: FormData) {
  await guard();
  await db().remove('updates', String(formData.get('id') || ''));
  revalidateAdmin();
}

/* ─────────────────────────── treatment events ─────────────────────────── */

const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(120),
  description: z
    .string()
    .trim()
    .max(1200)
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'সঠিক তারিখ দিন'),
  eventType: z.enum(['general', 'health', 'treatment', 'chemotherapy', 'important']),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']),
  visibility: z.enum(['public', 'family', 'private']),
});

export async function saveTreatmentEvent(formData: FormData) {
  await guard();
  const raw = Object.fromEntries(formData.entries());
  if (!raw.description) raw.description = '';
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Invalid event');

  const d = parsed.data;
  if (d.id) {
    const { id, ...rest } = d;
    await db().update('treatment_events', id, rest as any);
  } else {
    await db().insert('treatment_events', d as any);
  }
  revalidateAdmin();
}

export async function deleteTreatmentEvent(formData: FormData) {
  await guard();
  await db().remove('treatment_events', String(formData.get('id') || ''));
  revalidateAdmin();
}

/* ─────────────────────────── donations ────────────────────────────────── */

export async function verifyDonation(formData: FormData) {
  await guard();
  const id = String(formData.get('id') || '');
  const row = await db().get('donations', id);
  if (!row) return;
  await db().update('donations', id, { verified: !row.verified });
  revalidateAdmin();
}

export async function deleteDonation(formData: FormData) {
  await guard();
  await db().remove('donations', String(formData.get('id') || ''));
  revalidateAdmin();
}

export async function setFundGoal(formData: FormData) {
  await guard();
  const target = Number(formData.get('target') || 0);
  const label = String(formData.get('label') || site.donation.fundLabel).trim();
  if (!(target >= 0)) throw new Error('Invalid target');

  const rows = await db().all('fund_goal');
  if (rows[0]) {
    await db().update('fund_goal', rows[0].id, { target, label });
  } else {
    await db().insert('fund_goal', { target, label });
  }
  revalidateAdmin();
}

/* ─────────────────────────── profile ──────────────────────────────────── */

export async function saveProfile(formData: FormData) {
  await guard();
  const rows = await db().all('sabiha_profile');
  const payload = {
    name: String(formData.get('name') || 'সাবিহা').trim(),
    photoUrl: String(formData.get('photoUrl') || '/sabiha.jpg').trim() || null,
    headline: String(formData.get('headline') || '').trim() || null,
    bio: String(formData.get('bio') || '').trim() || null,
    batch: String(formData.get('batch') || '').trim() || null,
    college: String(formData.get('college') || '').trim() || null,
  };
  if (rows[0]) {
    await db().update('sabiha_profile', rows[0].id, payload);
  } else {
    await db().insert('sabiha_profile', payload);
  }
  revalidateAdmin();
}
