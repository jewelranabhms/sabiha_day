import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { bnDateLong, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, LockBadge } from '@/components/app-ui';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Item = {
  id: string;
  date: string;
  kind: string;
  emoji: string;
  title: string;
  detail?: string | null;
};

/**
 * APP SCREEN 14 — My Journey
 *
 * Everything in one timeline. Years from now, this is the single most
 * valuable thing in the whole system.
 *
 * Mirrors the `journey_timeline` SQL view in `database/schema.sql`.
 */
export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const session = await getDaySession();
  if (!session) return null;

  const sp = await searchParams;
  const uid = session.userId;

  const [journal, victories, visitors, memories, voice, photos, treatment] = await Promise.all([
    db().all('journal_entries'),
    db().all('little_victories'),
    db().all('visitors'),
    db().all('memories'),
    db().all('voice_diaries'),
    db().all('photos'),
    db().all('treatment_events'),
  ]);

  const items: Item[] = [
    ...journal.filter((r) => r.userId === uid).map<Item>((r) => ({
      id: `j-${r.id}`, date: r.entryDate, kind: 'journal', emoji: '✍️',
      title: 'Journal', detail: r.content,
    })),
    ...victories.filter((r) => r.userId === uid).map<Item>((r) => ({
      id: `v-${r.id}`, date: r.date, kind: 'victory', emoji: '🌱',
      title: 'Little victory', detail: r.content,
    })),
    ...visitors.filter((r) => r.userId === uid).map<Item>((r) => ({
      id: `p-${r.id}`, date: r.visitDate, kind: 'visitor', emoji: '🫂',
      title: r.name, detail: r.note,
    })),
    ...memories.filter((r) => r.userId === uid).map<Item>((r) => ({
      id: `m-${r.id}`, date: r.memoryDate, kind: 'memory', emoji: '💫',
      title: r.title, detail: r.description,
    })),
    ...voice.filter((r) => r.userId === uid).map<Item>((r) => ({
      id: `a-${r.id}`, date: r.date, kind: 'voice', emoji: '🎙️',
      title: 'Voice diary', detail: r.transcript,
    })),
    ...photos.filter((r) => r.userId === uid).map<Item>((r) => ({
      id: `ph-${r.id}`, date: r.photoDate, kind: 'photo', emoji: '📷',
      title: r.caption || 'A memory', detail: null,
    })),
    ...treatment.map<Item>((r) => ({
      id: `t-${r.id}`, date: r.eventDate, kind: 'treatment', emoji: '🏥',
      title: r.title, detail: r.description,
    })),
  ]
    .filter((i) => (sp.kind ? i.kind === sp.kind : true))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const FILTERS: { id: string; label: string; emoji: string }[] = [
    { id: '', label: 'সব', emoji: '🌸' },
    { id: 'journal', label: 'জার্নাল', emoji: '✍️' },
    { id: 'victory', label: 'জয়', emoji: '🌱' },
    { id: 'visitor', label: 'মানুষ', emoji: '🫂' },
    { id: 'memory', label: 'স্মৃতি', emoji: '💫' },
    { id: 'voice', label: 'ভয়েস', emoji: '🎙️' },
    { id: 'photo', label: 'ছবি', emoji: '📷' },
    { id: 'treatment', label: 'চিকিৎসা', emoji: '🏥' },
  ];

  // group by date
  const grouped: { date: string; items: Item[] }[] = [];
  for (const it of items) {
    let g = grouped.find((x) => x.date === it.date);
    if (!g) { g = { date: it.date, items: [] }; grouped.push(g); }
    g.items.push(it);
  }

  return (
    <AppScreen>
      <AppHeader
        title="🌸 আমার journey"
        subtitle={`${toBnNum(items.length)} টি মুহূর্ত, এক সুতোয় গাঁথা।`}
        back="/day/more"
        right={<LockBadge />}
      />

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <a
            key={f.id}
            href={f.id ? `/day/journey?kind=${f.id}` : '/day/journey'}
            className={'chip shrink-0 ' + ((sp.kind || '') === f.id ? 'chip-active' : '')}
          >
            <span aria-hidden>{f.emoji}</span> {f.label}
          </a>
        ))}
      </div>

      {grouped.length === 0 ? (
        <AppCard tone="cream">
          <p className="font-bn text-sm leading-relaxed text-muted">
            এখনো কিছু লেখা হয়নি। আজ থেকে শুরু করলে এক বছর পরে এই পাতাটা ভরে উঠবে।
          </p>
        </AppCard>
      ) : (
        <ol className="relative">
          <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-sage-200" />
          {grouped.map((g) => (
            <li key={g.date} className="relative pb-6 pl-7">
              <span aria-hidden className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-sage-300 bg-paper" />
              <p className="font-bn text-xs font-semibold uppercase tracking-[0.12em] text-sage-700">
                {bnDateLong(g.date)}
              </p>
              <ul className="mt-2.5 space-y-2">
                {g.items.map((it) => (
                  <li key={it.id}>
                    <AppCard className="p-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-sm" aria-hidden>{it.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bn text-[13px] font-semibold text-ink">{it.title}</p>
                          {it.detail && (
                            <p className="mt-1 font-bn text-[13px] leading-relaxed text-muted">
                              {it.detail.length > 140 ? it.detail.slice(0, 140) + '…' : it.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </AppCard>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 rounded-3xl border border-line/70 bg-cream p-5 text-center">
        <p className="font-bn text-sm leading-relaxed text-muted">
          পুরো journey-টা একটা বই বানাতে চান?
        </p>
        <a href="/day/book" className="app-btn mt-3 inline-flex">
          📖 Create My Journey Book
        </a>
      </div>

      <p className="mt-7 pb-4 text-center font-bn text-[11px] text-faint">
        🔒 {site.brand.day} · শুধু আপনার জন্য সংরক্ষিত
      </p>
    </AppScreen>
  );
}
