import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

const CATEGORIES = site.categories.map((c) => c.id) as [string, ...string[]];

const schema = z.object({
  name: z.string().trim().max(60).nullable().optional(),
  message: z.string().trim().min(3, 'বার্তাটি খুব ছোট').max(600, 'বার্তাটি অনেক বড়'),
  category: z.enum(CATEGORIES).catch('love'),
  anonymous: z.boolean().default(false),
});

/**
 * Public submission endpoint.
 *
 * Every message is created with `status = 'pending'`. There is no way for a
 * visitor to publish directly to the wall or to the app.
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
    return NextResponse.json(
      { error: first?.message || 'ফর্মে সমস্যা আছে।' },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Simple content guard: no links, no phone numbers, no contact requests.
  const lower = data.message.toLowerCase();
  if (/https?:\/\/|www\./.test(lower)) {
    return NextResponse.json(
      { error: 'বার্তায় লিংক পাঠানো যাবে না।' },
      { status: 400 },
    );
  }

  const message = await db().insert('messages', {
    name: data.anonymous ? null : (data.name ?? null),
    message: data.message,
    category: data.category as any,
    anonymous: !!data.anonymous,
    status: 'pending',
    moderatorNote: null,
    approvedAt: null,
  });

  return NextResponse.json({ ok: true, id: message.id, status: 'pending' }, { status: 201 });
}

/** Read approved messages (used by the app + any external embed). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Number(searchParams.get('limit') || 24));
  const random = searchParams.get('random') === '1';

  const rows = await db().all('messages');
  const approved = rows
    .filter((m) => m.status === 'approved')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (random && approved.length) {
    const exclude = searchParams.get('exclude');
    const pool =
      exclude && approved.length > 1 ? approved.filter((m) => m.id !== exclude) : approved;
    return NextResponse.json({ message: pool[Math.floor(Math.random() * pool.length)] });
  }

  return NextResponse.json({ count: approved.length, messages: approved.slice(0, limit) });
}
