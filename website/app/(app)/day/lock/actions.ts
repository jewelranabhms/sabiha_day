'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createDaySession, destroyDaySession, getDaySession, hashPin, verifyPin } from '@/lib/auth';

/** Unlock the app with the PIN. */
export async function unlockWithPin(formData: FormData) {
  const session = await getDaySession();
  if (!session) redirect('/day/login');

  const pin = String(formData.get('pin') || '');
  const user = await db().get('app_users', session.userId);
  if (!user) redirect('/day/login');

  if (!user.pinHash || verifyPin(pin, user.pinHash)) {
    await createDaySession(user.id, user.displayName, user.role, false);
    redirect('/day');
  }
  redirect('/day/lock?error=1');
}

/** Set (or clear) the journal lock PIN. */
export async function setPin(formData: FormData) {
  const session = await getDaySession();
  if (!session) redirect('/day/login');

  const pin = String(formData.get('pin') || '').trim();
  const confirm = String(formData.get('confirm') || '').trim();
  const remove = formData.get('remove') === '1';

  if (remove) {
    await db().update('app_users', session.userId, { pinHash: null });
    redirect('/day/settings?pin=off');
  }

  if (!/^\d{4,8}$/.test(pin)) redirect('/day/settings?pin=bad');
  if (pin !== confirm) redirect('/day/settings?pin=mismatch');

  await db().update('app_users', session.userId, { pinHash: hashPin(pin) });
  redirect('/day/settings?pin=on');
}

export async function lockNow() {
  const session = await getDaySession();
  if (!session) redirect('/day/login');
  await createDaySession(session.userId, session.name, session.role, true);
  redirect('/day/lock');
}

export async function signOut() {
  await destroyDaySession();
  redirect('/day/login');
}
