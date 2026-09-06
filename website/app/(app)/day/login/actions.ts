'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createDaySession, DEMO_APP_PASSWORD } from '@/lib/auth';

/**
 * Sabiha signs in with email + password, plus an optional PIN lock.
 *
 * There is deliberately no "sign up": this is a private app for one person.
 * Accounts are created by an admin in the database (see `app_users`).
 */
export async function dayLogin(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const users = await db().all('app_users');
  const user = users.find((u) => u.email.toLowerCase() === email && u.isActive);

  const expected =
    process.env.SABIHA_PASSWORD ||
    (process.env.NODE_ENV === 'production' ? null : DEMO_APP_PASSWORD);

  if (!user || !expected || password !== expected) {
    redirect('/day/login?error=1');
  }

  // If she has set a PIN, the session starts locked.
  const pinLocked = !!user.pinHash;
  await createDaySession(user.id, user.displayName, user.role, pinLocked);

  // First time ever? Start with the gentle welcome screen.
  const [journal, checks] = await Promise.all([
    db().all('journal_entries'),
    db().all('daily_checks'),
  ]);
  const isFirstTime =
    !journal.some((j) => j.userId === user.id) && !checks.some((c) => c.userId === user.id);

  redirect(pinLocked ? '/day/lock' : isFirstTime ? '/day/welcome' : '/day');
}

export async function dayLogout() {
  const { destroyDaySession } = await import('@/lib/auth');
  await destroyDaySession();
  redirect('/day/login');
}
