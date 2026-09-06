import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { todayStr, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, AppSectionTitle, LockBadge } from '@/components/app-ui';
import { bumpDhikr, deleteFavouriteDua, markDuaDone, saveFavouriteDua } from '../../actions';
import { cn } from '@/components/cn';

export const dynamic = 'force-dynamic';

const MORNING_DHIKR = ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar'];
const TARGET = 33;

/**
 * APP SCREEN 05 — Dua & Dhikr
 *
 * Not a generic Islamic app. Small, simple, repeatable — nothing to master,
 * nothing to fail at.
 */
export default async function DuaPage() {
  const session = await getDaySession();
  if (!session) return null;

  const today = todayStr();
  const [dhikrRows, duas, favs] = await Promise.all([
    db().all('dhikr_logs'),
    db().all('duas'),
    db().all('favourite_duas'),
  ]);

  const mine = dhikrRows.filter((d) => d.userId === session.userId && d.logDate === today);
  const todaysDuas = duas.filter((d) => d.category === 'today').sort((a, b) => a.sortOrder - b.sortOrder);
  const myFavs = favs.filter((f) => f.userId === session.userId);

  return (
    <AppScreen>
      <AppHeader title="🤲 দোয়া ও যিকির" subtitle="ছোট, সহজ, প্রতিদিনের মতো।" back="/day" right={<LockBadge />} />

      {/* ── morning dhikr ── */}
      <AppSectionTitle>Morning</AppSectionTitle>
      <AppCard tone="cream" className="p-4">
        <ul className="space-y-2.5">
          {MORNING_DHIKR.map((name) => {
            const log = mine.find((m) => m.dhikrName === name);
            const count = log?.count ?? 0;
            const done = count >= TARGET;
            return (
              <li key={name}>
                <form action={bumpDhikr} className="flex items-center gap-3">
                  <input type="hidden" name="name" value={name} />

                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px]',
                      done ? 'border-sage-500 bg-sage-500 text-white' : 'border-line bg-white',
                    )}
                    aria-hidden
                  >
                    {done ? '✓' : ''}
                  </span>

                  <span className={cn('flex-1 font-bn text-sm', done ? 'text-sage-800' : 'text-ink')}>
                    {name}
                  </span>

                  <span className="shrink-0 font-bn text-xs tabular-nums text-faint">
                    {toBnNum(count)} / {toBnNum(TARGET)}
                  </span>

                  <button
                    type="submit"
                    name="amount"
                    value="1"
                    className="h-10 w-10 shrink-0 rounded-2xl border border-line bg-white font-bn text-lg text-sage-700 shadow-soft transition-all active:scale-90 hover:border-sage-300"
                    aria-label={`${name} +1`}
                  >
                    +
                  </button>
                  <button
                    type="submit"
                    name="amount"
                    value="10"
                    className="h-10 shrink-0 rounded-2xl border border-line bg-white px-3 font-bn text-xs text-sage-700 shadow-soft transition-all active:scale-90 hover:border-sage-300"
                    aria-label={`${name} +10`}
                  >
                    +১০
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 border-t border-line/70 pt-3 font-bn text-[11px] leading-relaxed text-faint">
          সংখ্যা পূর্ণ না হলেও কোনো অসুবিধা নেই। এটা হিসাব নয়, অভ্যাস।
        </p>
      </AppCard>

      {/* ── today's dua ── */}
      <section className="mt-8">
        <AppSectionTitle>Today&apos;s Dua</AppSectionTitle>
        <div className="space-y-3">
          {todaysDuas.map((d) => {
            const log = mine.find((m) => m.dhikrName === `dua:${d.title}`);
            const read = log?.completed;
            return (
              <AppCard key={d.id} className={cn(read && 'border-sage-200 bg-sage-50/50')}>
                <h3 className="font-bn text-sm font-semibold text-sage-700">{d.title}</h3>
                {d.arabic && (
                  <p dir="rtl" lang="ar" className="mt-3 text-right text-2xl leading-[2.1] text-ink">
                    {d.arabic}
                  </p>
                )}
                {d.transliteration && (
                  <p className="mt-2 font-sans text-xs italic text-faint">{d.transliteration}</p>
                )}
                {d.translation && (
                  <p className="mt-2 font-bn text-sm leading-relaxed text-muted">{d.translation}</p>
                )}

                <form action={markDuaDone} className="mt-4">
                  <input type="hidden" name="name" value={d.title} />
                  <button
                    type="submit"
                    className={cn(
                      'w-full rounded-2xl px-4 py-2.5 font-bn text-sm font-medium transition-all active:scale-[0.98]',
                      read
                        ? 'border border-sage-300 bg-white text-sage-700'
                        : 'bg-sage-600 text-white hover:bg-sage-700',
                    )}
                  >
                    {read ? '✓ আজ পড়েছি' : 'আজ পড়েছি ✓'}
                  </button>
                </form>
              </AppCard>
            );
          })}
        </div>
      </section>

      {/* ── my favourite dua ── */}
      <section className="mt-8">
        <AppSectionTitle>My Favourite Dua</AppSectionTitle>

        {myFavs.length > 0 && (
          <ul className="mb-3 space-y-3">
            {myFavs.map((f) => (
              <li key={f.id}>
                <AppCard className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bn text-sm font-semibold text-ink">{f.title}</p>
                    <form action={deleteFavouriteDua}>
                      <input type="hidden" name="id" value={f.id} />
                      <button type="submit" aria-label="মুছুন" className="font-bn text-xs text-faint hover:text-blush-600">
                        ✕
                      </button>
                    </form>
                  </div>
                  <p className="mt-2 font-bn text-sm leading-relaxed text-muted">{f.body}</p>
                </AppCard>
              </li>
            ))}
          </ul>
        )}

        <AppCard tone="cream">
          <form action={saveFavouriteDua} className="space-y-3">
            <input name="title" className="field" placeholder="শিরোনাম (ঐচ্ছিক)" maxLength={80} />
            <textarea
              name="body"
              rows={3}
              required
              maxLength={1000}
              className="field-area"
              placeholder="যে দোয়াটা আপনার মনকে শান্ত করে…"
            />
            <button type="submit" className="app-btn-soft w-full">
              ★ সংরক্ষণ করুন
            </button>
          </form>
        </AppCard>
      </section>

      <p className="mt-9 pb-4 text-center font-bn text-[11px] text-faint">
        🔒 আপনার ইবাদতের হিসাব কারও সঙ্গে শেয়ার হয় না।
      </p>
    </AppScreen>
  );
}
