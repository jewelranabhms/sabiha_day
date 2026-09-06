import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { site } from '@/lib/site';
import { todayStr, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, LockBadge } from '@/components/app-ui';
import { togglePrayer } from '../../actions';
import { cn } from '@/components/cn';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 06 — Prayer
 *
 * A simple tracker with two rules we will not break:
 *   · no guilt-inducing streaks
 *   · "missed" is not "failure"
 */
export default async function PrayerPage() {
  const session = await getDaySession();
  if (!session) return null;

  const today = todayStr();
  const rows = await db().all('prayer_logs');
  const log = rows.find((r) => r.userId === session.userId && r.logDate === today);
  const done = site.prayers.filter((p) => log && (log as any)[p.id]).length;

  // Last 7 days, shown as quiet dots — never as a broken chain.
  const week = Array.from({ length: 7 }, (_, i) => todayStr(-(6 - i)));

  return (
    <AppScreen>
      <AppHeader title="🕌 নামাজ" subtitle="আজকের দিনটা — যেটুকু পেরেছেন, সেটুকুই যথেষ্ট।" back="/day" right={<LockBadge />} />

      <AppCard className="p-4">
        <ul className="divide-y divide-line/60">
          {site.prayers.map((p) => {
            const on = !!(log && (log as any)[p.id]);
            return (
              <li key={p.id}>
                <form action={togglePrayer} className="flex items-center gap-3 py-1">
                  <input type="hidden" name="key" value={p.id} />
                  <button
                    type="submit"
                    aria-pressed={on}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-cream/60"
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-all',
                        on ? 'border-sage-500 bg-sage-500 text-white' : 'border-line bg-white',
                      )}
                      aria-hidden
                    >
                      {on ? '✓' : ''}
                    </span>
                    <span className="flex-1">
                      <span className={cn('block font-bn text-[15px]', on ? 'text-sage-900' : 'text-ink')}>
                        {p.bn}
                      </span>
                      <span className="block font-sans text-[11px] text-faint">{p.label}</span>
                    </span>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
          <span className="font-bn text-sm text-muted">আজ</span>
          <span className="font-bn text-sm font-semibold tabular-nums text-sage-700">
            {toBnNum(done)} / {toBnNum(site.prayers.length)}
          </span>
        </div>
      </AppCard>

      {/* last seven days — dots, not a streak */}
      <section className="mt-7">
        <h2 className="mb-3 font-bn text-sm font-semibold uppercase tracking-[0.12em] text-faint">
          গত সাত দিন
        </h2>
        <AppCard tone="cream" className="p-4">
          <ul className="flex items-end justify-between gap-1.5">
            {week.map((d) => {
              const row = rows.find((r) => r.userId === session.userId && r.logDate === d);
              const count = row ? site.prayers.filter((p) => (row as any)[p.id]).length : 0;
              return (
                <li key={d} className="flex flex-1 flex-col items-center gap-2">
                  <span
                    className={cn(
                      'h-14 w-full max-w-[22px] rounded-full transition-all',
                      count === 0 && 'bg-line/60',
                      count > 0 && count < 3 && 'bg-sage-200',
                      count >= 3 && count < 5 && 'bg-sage-300',
                      count === 5 && 'bg-sage-500',
                    )}
                    style={{ height: `${Math.max(14, count * 11 + 14)}px` }}
                    title={`${count}/5`}
                    aria-label={`${d}: ${count} of 5`}
                  />
                  <span className="font-bn text-[10px] text-faint">
                    {toBnNum(new Date(d).getDate())}
                  </span>
                </li>
              );
            })}
          </ul>
        </AppCard>
      </section>

      <div className="mt-7 rounded-3xl border border-sage-200 bg-sage-50 p-5">
        <p className="font-bn text-sm leading-relaxed text-sage-900/80">
          এখানে কোনো streak নেই, কোনো লাল দাগ নেই।
          <br />
          <strong className="font-semibold">“বাদ পড়া” মানে “ব্যর্থতা” নয়।</strong>
        </p>
        <p className="mt-2 font-bn text-xs leading-relaxed text-sage-800/60">
          শরীর যখন ক্লান্ত, তখন বিশ্রামও একটা ইবাদত।
        </p>
      </div>

      <p className="mt-8 pb-4 text-center font-bn text-[11px] text-faint">🔒 Private</p>
    </AppScreen>
  );
}
