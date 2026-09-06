import { NextResponse } from 'next/server';
import { getDaySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { bnDateLong } from '@/lib/format';

export const dynamic = 'force-dynamic';

/**
 * "Export My Journal" — one button, all her data, out of the system.
 *
 * Only ever returns rows belonging to the signed-in, unlocked user.
 * Formats: `?format=json` (complete, machine readable) or `?format=markdown`
 * (readable, printable).
 */
export async function GET(req: Request) {
  const session = await getDaySession();
  if (!session || session.pinLocked) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const uid = session.userId;
  const url = new URL(req.url);
  const format = url.searchParams.get('format') === 'markdown' ? 'markdown' : 'json';

  const [journal, victories, visitors, memories, photos, voice, prayers, dhikr, checks, messages] =
    await Promise.all([
      db().all('journal_entries'),
      db().all('little_victories'),
      db().all('visitors'),
      db().all('memories'),
      db().all('photos'),
      db().all('voice_diaries'),
      db().all('prayer_logs'),
      db().all('dhikr_logs'),
      db().all('daily_checks'),
      db().all('messages'),
    ]);

  const mine = <T extends { userId: string }>(rows: T[]) => rows.filter((r) => r.userId === uid);

  const data = {
    exportedAt: new Date().toISOString(),
    owner: { name: session.name, email: null as string | null },
    app: "Sabiha's Day",
    journal: mine(journal).sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1)),
    littleVictories: mine(victories).sort((a, b) => (a.date < b.date ? -1 : 1)),
    visitors: mine(visitors).sort((a, b) => (a.visitDate < b.visitDate ? -1 : 1)),
    memories: mine(memories).sort((a, b) => (a.memoryDate < b.memoryDate ? -1 : 1)),
    photos: mine(photos),
    voiceDiaries: mine(voice),
    prayerLogs: mine(prayers),
    dhikrLogs: mine(dhikr),
    dailyChecks: mine(checks),
    messagesForMe: messages.filter((m) => m.status === 'approved'),
  };

  if (format === 'json') {
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="sabihas-day-export-${Date.now()}.json"`,
      },
    });
  }

  /* ── markdown ─────────────────────────────────────────────────────────── */
  const L: string[] = [];
  L.push(`# Sabiha's Day — Export`);
  L.push(`\nExported: ${new Date().toISOString()}\n`);

  L.push(`\n## ✍️ Journal\n`);
  for (const j of data.journal) {
    L.push(`### ${bnDateLong(j.entryDate)}${j.mood ? ` · mood ${j.mood}/5` : ''}`);
    L.push(`\n${j.content}\n`);
  }

  L.push(`\n## 🌱 Little Victories\n`);
  for (const v of data.littleVictories) L.push(`- **${bnDateLong(v.date)}** — ${v.content}`);

  L.push(`\n## 🫂 People I Met\n`);
  for (const v of data.visitors) {
    L.push(`- **${bnDateLong(v.visitDate)}** — ${v.name}${v.relationship ? ` (${v.relationship})` : ''}${v.note ? `: ${v.note}` : ''}`);
  }

  L.push(`\n## 💫 Memories\n`);
  for (const m of data.memories) {
    L.push(`- **${bnDateLong(m.memoryDate)}** — ${m.title}${m.description ? `: ${m.description}` : ''}`);
  }

  L.push(`\n## 💌 Messages for Sabiha\n`);
  for (const m of data.messagesForMe) {
    L.push(`> ${m.message}\n> — ${m.anonymous || !m.name ? 'Anonymous' : m.name}\n`);
  }

  return new NextResponse(L.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="sabihas-day-export-${Date.now()}.md"`,
    },
  });
}
