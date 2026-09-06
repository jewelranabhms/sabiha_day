import Link from 'next/link';
import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { site } from '@/lib/site';
import { detectHardDay, randomApprovedMessage } from '@/lib/queries';
import { bnDateLong, todayStr, toBnNum, relativeDayBn } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, LockBadge } from '@/components/app-ui';
import { ComfortCard } from '@/components/ComfortCard';
import { saveJournalEntry, deleteJournalEntry } from '../../actions';
import { cn } from '@/components/cn';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 03 — "আজকের কথা" (Today's Journal)
 *
 * Private. One entry per day, editable any time.
 * Every entry keeps: date, time, mood, text, optional photo, optional voice.
 */
export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const session = await getDaySession();
  if (!session) return null;

  const date = sp.date || todayStr();
  const entries = (await db().all('journal_entries'))
    .filter((e) => e.userId === session.userId)
    .sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1));

  const current = entries.find((e) => e.entryDate === date);
  const isHardDay = current ? detectHardDay(current.content) : false;
  const comfort = isHardDay ? await randomApprovedMessage() : null;

  return (
    <AppScreen>
      <AppHeader
        title="✍️ আজকের কথা"
        subtitle={bnDateLong(date)}
        back="/day"
        right={<LockBadge />}
      />

      {/* ── the editor ── */}
      <form action={saveJournalEntry}>
        <input type="hidden" name="entryDate" value={date} />

        <AppCard className="p-0">
          <textarea
            name="content"
            defaultValue={current?.content ?? ''}
            rows={9}
            placeholder="আজ আমার মনে যা আছে…"
            className="w-full resize-y rounded-t-3xl bg-transparent p-5 font-bn text-[15px] leading-loose text-ink placeholder:text-faint focus:outline-none"
          />

          <div className="border-t border-line/70 p-4">
            <p className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">
              Mood
            </p>
            <div className="mt-2.5 flex gap-2">
              {site.moods.map((m) => (
                <label key={m.value} className="flex-1">
                  <input
                    type="radio"
                    name="mood"
                    value={m.value}
                    defaultChecked={current?.mood === m.value}
                    className="peer sr-only"
                  />
                  <span
                    title={m.label}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-center rounded-2xl border py-2 text-xl transition-all peer-checked:border-sage-400 peer-checked:bg-sage-50 peer-checked:shadow-soft',
                      'border-line/70 bg-white hover:border-sage-200',
                    )}
                  >
                    {m.emoji}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="submit" className="app-btn flex-1">
                {current ? 'সংরক্ষণ করুন ✓' : 'Save'}
              </button>
              <Link href="/day/voice" className="app-btn-soft" title="ভয়েস ডায়েরি">
                🎙️
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <LockBadge label="Private — শুধু আপনার" />
              {current && (
                <span className="font-bn text-[11px] text-faint">
                  লেখা হয়েছে {relativeDayBn(current.createdAt)}
                </span>
              )}
            </div>
          </div>
        </AppCard>
      </form>

      {/* ── the Easter egg ───────────────────────────────────────────────
          If today's words sound like a hard day, the app does NOT offer
          medical advice. It says one gentle thing, then shows a kind message
          somebody else sent.                                              */}
      {isHardDay && <ComfortCard message={comfort} />}

      {/* ── previous entries ── */}
      <section className="mt-9">
        <h2 className="mb-3 font-bn text-sm font-semibold uppercase tracking-[0.12em] text-faint">
          আগের দিনগুলো ({toBnNum(entries.length)})
        </h2>

        {entries.length === 0 ? (
          <AppCard tone="cream">
            <p className="font-bn text-sm leading-relaxed text-muted">
              এখনো কিছু লেখা হয়নি। প্রথম লাইনটা সবচেয়ে কঠিন — তারপর সহজ হয়ে যায়।
            </p>
          </AppCard>
        ) : (
          <ul className="space-y-3">
            {entries.slice(0, 30).map((e) => {
              const mood = site.moods.find((m) => m.value === e.mood);
              return (
                <li key={e.id}>
                  <Link href={`/day/journal?date=${e.entryDate}`}>
                    <AppCard className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bn text-xs font-semibold text-sage-700">
                          {bnDateLong(e.entryDate)}
                        </span>
                        <span className="flex items-center gap-2">
                          {mood && <span aria-hidden className="text-base">{mood.emoji}</span>}
                          {e.entryDate === date && (
                            <span className="rounded-full bg-sage-100 px-2 py-0.5 font-bn text-[10px] text-sage-800">
                              আজ
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="mt-2 font-bn text-sm leading-relaxed text-muted">
                        {e.content.length > 110 ? e.content.slice(0, 110) + '…' : e.content}
                      </p>
                    </AppCard>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {current && (
        <form action={deleteJournalEntry} className="mt-6">
          <input type="hidden" name="id" value={current.id} />
          <button
            type="submit"
            className="w-full rounded-2xl border border-blush-200 bg-blush-50 px-4 py-2.5 font-bn text-xs font-medium text-blush-600 transition-colors hover:bg-blush-100"
          >
            এই দিনের লেখাটি মুছে ফেলুন
          </button>
        </form>
      )}

      <p className="mt-8 pb-4 text-center font-bn text-[11px] leading-relaxed text-faint">
        🔒 জার্নাল কখনো ওয়েবসাইটে যায় না। পরিবার বা ডাক্তার — কেউ এটা পড়তে পারেন না।
      </p>
    </AppScreen>
  );
}
