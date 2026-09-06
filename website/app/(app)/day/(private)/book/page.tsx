import Link from 'next/link';
import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { site } from '@/lib/site';
import { bnDateLong, bnMonthYear, toBnNum } from '@/lib/format';
import { categoryMeta } from '@/lib/site';
import { PrintButton } from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

/**
 * 📖 Create My Journey Book
 *
 * "Sabiha's Day — Volume 01"
 *
 * This page is typeset for A4. Press Ctrl/Cmd-P → "Save as PDF" and the
 * volume is produced. Going through the browser's print pipeline (instead of
 * a server-side PDF library) is deliberate: Bangla script shaping is handled
 * correctly, photos stay crisp, and there is no heavy dependency.
 *
 * What goes in is controlled by Settings → Export My Journal. Medical detail
 * is excluded by default.
 */
export default async function JourneyBookPage() {
  const session = await getDaySession();
  if (!session) return null;
  const uid = session.userId;

  const [journal, victories, visitors, memories, photos, voice, treatment, messages, settingsRows] =
    await Promise.all([
      db().all('journal_entries'),
      db().all('little_victories'),
      db().all('visitors'),
      db().all('memories'),
      db().all('photos'),
      db().all('voice_diaries'),
      db().all('treatment_events'),
      db().all('messages'),
      db().all('app_settings'),
    ]);

  const inc = settingsRows.find((s) => s.userId === uid)?.exportInclude ?? {};
  const want = (key: string, fallback: boolean) => (key in inc ? !!inc[key] : fallback);

  const include = {
    journal: want('journal', true),
    victories: want('victories', true),
    photos: want('photos', true),
    memories: want('memories', true),
    messages: want('messages', true),
    voice: want('voice', false),
    treatment: want('treatment', false),
  };

  const mine = <T extends { userId: string }>(rows: T[]) => rows.filter((r) => r.userId === uid);

  const j = mine(journal).sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1));
  const v = mine(victories).sort((a, b) => (a.date < b.date ? -1 : 1));
  const p = mine(visitors).sort((a, b) => (a.visitDate < b.visitDate ? -1 : 1));
  const m = mine(memories).sort((a, b) => (a.memoryDate < b.memoryDate ? -1 : 1));
  const ph = mine(photos).sort((a, b) => (a.photoDate < b.photoDate ? -1 : 1));
  const vd = mine(voice).sort((a, b) => (a.date < b.date ? -1 : 1));
  const msgs = messages
    .filter((x) => x.status === 'approved')
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  const allDates = [...j.map((x) => x.entryDate), ...v.map((x) => x.date), ...p.map((x) => x.visitDate)];
  const from = allDates.length ? allDates.sort()[0] : new Date().toISOString().slice(0, 10);
  const to = allDates.length ? allDates.sort().slice(-1)[0] : new Date().toISOString().slice(0, 10);

  const chapters = [
    include.journal && j.length && { n: '✍️', t: 'Journal · আজকের কথা', c: toBnNum(j.length) },
    include.victories && v.length && { n: '🌱', t: 'Little Victories · ছোট্ট জয়', c: toBnNum(v.length) },
    include.memories && p.length && { n: '🫂', t: 'People I Met · কে এসেছিল', c: toBnNum(p.length) },
    include.memories && m.length && { n: '💫', t: 'Memories · স্মৃতি', c: toBnNum(m.length) },
    include.photos && ph.length && { n: '📷', t: 'Photos', c: toBnNum(ph.length) },
    include.voice && vd.length && { n: '🎙️', t: 'Voice Diary', c: toBnNum(vd.length) },
    include.messages && msgs.length && { n: '💌', t: 'Messages for Sabiha', c: toBnNum(msgs.length) },
    include.treatment && treatment.length && { n: '🏥', t: 'Important Events', c: toBnNum(treatment.length) },
  ].filter(Boolean) as { n: string; t: string; c: string }[];

  return (
    <div className="bg-paper">
      {/* ── controls (never printed) ── */}
      <div className="no-print sticky top-0 z-20 border-b border-line/70 bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Link href="/day/settings" className="font-bn text-xs text-faint hover:text-sage-700">
            ← Settings
          </Link>
          <PrintButton />
        </div>
        <p className="mt-2 font-bn text-[11px] leading-relaxed text-faint">
          Ctrl / Cmd + P চাপুন → Destination-এ “Save as PDF” বেছে নিন। বইটি তৈরি হয়ে যাবে।
        </p>
      </div>

      {/* ══ the book ══ */}
      <div className="print-shadow mx-auto max-w-[42rem] bg-white px-6 py-10 sm:px-12 sm:py-14">
        {/* ── cover ── */}
        <header className="print-block flex min-h-[70vh] flex-col items-center justify-center text-center">
          <p className="font-bn text-[11px] uppercase tracking-[0.34em] text-sage-600">
            {site.brand.day}
          </p>
          <div className="my-8 flex items-center gap-3 text-sage-300">
            <span className="h-px w-12 bg-current" />
            <span className="text-2xl" aria-hidden>🌸</span>
            <span className="h-px w-12 bg-current" />
          </div>
          <h1 className="font-bn text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Volume 01
          </h1>
          <p className="mt-4 font-bn text-lg text-muted">
            {bnMonthYear(from)} — {bnMonthYear(to)}
          </p>
          <p className="mt-10 font-bn text-sm italic text-faint">{site.brand.appTagline}</p>

          <div className="mt-14 rounded-3xl border border-line bg-cream/50 px-6 py-4">
            <p className="font-bn text-xs uppercase tracking-[0.16em] text-faint">This book belongs to</p>
            <p className="mt-1.5 font-bn text-xl font-semibold text-ink">{session.name}</p>
          </div>
        </header>

        {/* ── contents ── */}
        <section className="print-chapter print-block">
          <h2 className="border-b border-line pb-2 font-bn text-lg font-semibold uppercase tracking-[0.16em] text-sage-700">
            সূচিপত্র · Contents
          </h2>
          <ol className="mt-5 space-y-2.5">
            {chapters.map((c, i) => (
              <li key={c.t} className="flex items-baseline gap-3 font-bn text-sm">
                <span className="w-6 shrink-0 tabular-nums text-faint">{toBnNum(i + 1)}.</span>
                <span aria-hidden>{c.n}</span>
                <span className="flex-1 text-ink">{c.t}</span>
                <span className="tabular-nums text-faint">{c.c}</span>
              </li>
            ))}
            {chapters.length === 0 && (
              <li className="font-bn text-sm text-muted">এখনো কিছু লেখা হয়নি — বইটি খালি।</li>
            )}
          </ol>
        </section>

        {/* ── chapter: journal ── */}
        {include.journal && j.length > 0 && (
          <Chapter emoji="✍️" title="Journal · আজকের কথা">
            {j.map((e) => (
              <article key={e.id} className="print-block border-b border-line/60 pb-6 last:border-0">
                <p className="font-bn text-xs font-semibold uppercase tracking-[0.12em] text-sage-700">
                  {bnDateLong(e.entryDate)}
                  {e.mood ? <span className="ml-2 normal-case tracking-normal text-faint">· mood {toBnNum(e.mood)}/৫</span> : null}
                </p>
                <p className="mt-2.5 whitespace-pre-wrap font-bn text-[15px] leading-loose text-ink">
                  {e.content}
                </p>
              </article>
            ))}
          </Chapter>
        )}

        {/* ── chapter: victories ── */}
        {include.victories && v.length > 0 && (
          <Chapter emoji="🌱" title="Little Victories · ছোট্ট জয়">
            <ul className="space-y-3">
              {v.map((x) => (
                <li key={x.id} className="print-block flex gap-3">
                  <span className="w-24 shrink-0 font-bn text-xs text-sage-700">{bnDateLong(x.date)}</span>
                  <span className="font-bn text-[15px] leading-relaxed text-ink">❤️ {x.content}</span>
                </li>
              ))}
            </ul>
          </Chapter>
        )}

        {/* ── chapter: people ── */}
        {include.memories && p.length > 0 && (
          <Chapter emoji="🫂" title="People I Met · কে এসেছিল">
            <ul className="space-y-3">
              {p.map((x) => (
                <li key={x.id} className="print-block flex gap-3">
                  <span className="w-24 shrink-0 font-bn text-xs text-sage-700">{bnDateLong(x.visitDate)}</span>
                  <span className="font-bn text-[15px] leading-relaxed text-ink">
                    <strong>{x.name}</strong>
                    {x.relationship && <span className="text-faint"> · {x.relationship}</span>}
                    {x.note && <span className="text-muted"> — “{x.note}”</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Chapter>
        )}

        {/* ── chapter: memories ── */}
        {include.memories && m.length > 0 && (
          <Chapter emoji="💫" title="Memories · স্মৃতি">
            <ul className="space-y-5">
              {m.map((x) => (
                <li key={x.id} className="print-block">
                  <p className="font-bn text-xs font-semibold uppercase tracking-[0.12em] text-sage-700">
                    {bnDateLong(x.memoryDate)}
                  </p>
                  <p className="mt-1 font-bn text-[15px] font-semibold text-ink">{x.title}</p>
                  {x.description && (
                    <p className="mt-1 font-bn text-sm leading-relaxed text-muted">{x.description}</p>
                  )}
                  {(x.personName || x.relationship) && (
                    <p className="mt-1 font-bn text-xs text-faint">
                      {x.personName} {x.relationship && `· ${x.relationship}`}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Chapter>
        )}

        {/* ── chapter: photos ── */}
        {include.photos && ph.length > 0 && (
          <Chapter emoji="📷" title="Photos">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {ph.map((x) => (
                <figure key={x.id} className="print-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={x.photoUrl}
                    alt={x.caption || ''}
                    className="aspect-square w-full rounded-2xl border border-line object-cover"
                  />
                  {x.caption && (
                    <figcaption className="mt-1.5 font-bn text-[11px] leading-snug text-muted">
                      {x.caption}
                    </figcaption>
                  )}
                  <p className="font-bn text-[10px] text-faint">{bnDateLong(x.photoDate)}</p>
                </figure>
              ))}
            </div>
          </Chapter>
        )}

        {/* ── chapter: voice ── */}
        {include.voice && vd.length > 0 && (
          <Chapter emoji="🎙️" title="Voice Diary">
            <ul className="space-y-4">
              {vd.map((x) => (
                <li key={x.id} className="print-block">
                  <p className="font-bn text-xs font-semibold uppercase tracking-[0.12em] text-sage-700">
                    {bnDateLong(x.date)}
                  </p>
                  <p className="mt-1 font-bn text-sm leading-relaxed text-ink">
                    {x.transcript || <span className="italic text-faint">🎙️ audio recording (not transcribed)</span>}
                  </p>
                </li>
              ))}
            </ul>
          </Chapter>
        )}

        {/* ── chapter: messages ── */}
        {include.messages && msgs.length > 0 && (
          <Chapter emoji="💌" title="Messages for Sabiha">
            <p className="mb-5 font-bn text-sm italic leading-relaxed text-muted">
              হাজারো মানুষ দূরে ছিল — কিন্তু তাদের কথা কাছে ছিল।
            </p>
            <ul className="space-y-5">
              {msgs.map((x) => {
                const cat = categoryMeta(x.category);
                return (
                  <li key={x.id} className="print-block border-l-2 border-sage-200 pl-4">
                    <p className="font-bn text-[15px] leading-relaxed text-ink">“{x.message}”</p>
                    <p className="mt-1.5 font-bn text-xs text-faint">
                      — {x.anonymous || !x.name ? 'Anonymous' : x.name}
                      <span className="mx-1.5 opacity-50">·</span>
                      {cat.emoji} {cat.label}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Chapter>
        )}

        {/* ── chapter: treatment (opt-in only) ── */}
        {include.treatment && treatment.length > 0 && (
          <Chapter emoji="🏥" title="Important Events">
            <ul className="space-y-3">
              {[...treatment]
                .sort((a, b) => (a.eventDate < b.eventDate ? -1 : 1))
                .map((x) => (
                  <li key={x.id} className="print-block flex gap-3">
                    <span className="w-24 shrink-0 font-bn text-xs text-sage-700">{bnDateLong(x.eventDate)}</span>
                    <span className="font-bn text-sm text-ink">
                      <strong>{x.title}</strong>
                      {x.description && <span className="text-muted"> — {x.description}</span>}
                    </span>
                  </li>
                ))}
            </ul>
          </Chapter>
        )}

        {/* ── colophon ── */}
        <footer className="print-chapter print-block mt-10 border-t border-line pt-8 text-center">
          <div className="mx-auto flex items-center justify-center gap-3 text-sage-300">
            <span className="h-px w-10 bg-current" />
            <span aria-hidden>🌱</span>
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="mt-5 font-bn text-sm italic leading-relaxed text-muted">
            “আজ শুধু আজকের দিনটা।”
          </p>
          <p className="mt-6 font-bn text-[11px] leading-relaxed text-faint">
            {site.brand.day} · Volume 01 · তৈরি হয়েছে {bnDateLong(new Date().toISOString())}
            <br />
            এই বইটি সম্পূর্ণ ব্যক্তিগত। প্রকাশের সিদ্ধান্ত শুধু {session.name}-এর।
          </p>
        </footer>
      </div>
    </div>
  );
}

function Chapter({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="print-chapter mt-10">
      <h2 className="border-b border-line pb-2 font-bn text-lg font-semibold text-ink">
        <span aria-hidden className="mr-2">{emoji}</span>
        {title}
      </h2>
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}
