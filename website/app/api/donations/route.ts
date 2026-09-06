import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const schema = z.object({
  donorName: z.string().trim().max(60).nullable().optional(),
  amount: z.number().positive('সঠিক পরিমাণ দিন').max(10_000_000),
  method: z.string().trim().min(2).max(20),
  transactionReference: z.string().trim().max(40).nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
});

/**
 * Donation reports are always created UNVERIFIED.
 * Only an admin, from the dashboard, can mark one verified — and only
 * verified rows are counted in the public total.
 *
 * SECURITY: this endpoint never accepts or stores a PIN, password, OTP or
 * card number. If such a field ever appears here, it is dropped.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'অবৈধ অনুরোধ।' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message || 'ফর্মে সমস্যা আছে।' }, { status: 400 });
  }

  const d = parsed.data;
  const row = await db().insert('donations', {
    donorName: d.donorName ?? null,
    amount: d.amount,
    method: d.method,
    transactionReference: d.transactionReference ?? null,
    note: d.note ?? null,
    verified: false,
  });

  return NextResponse.json({ ok: true, id: row.id, verified: false }, { status: 201 });
}
