import Link from 'next/link';
import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { categoryMeta } from '@/lib/site';
import { bnMonthYear, relativeDayBn, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader } from '@/components/app-ui';
import { RandomKindWord } from '@/components/RandomKindWord';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 04 — My Messages
 *
 * Approved messages from the public website arrive here, grouped by day.
 * Plus the app's most loved feature: a random kind word on demand.
 */
export default async function DayMessages() {
  const session = await getDaySession();
  if (!session) return null;

  const all = (await db().all('messages'))
    .filter((m) => m.status === 'approved')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // Group by "আজ / গতকাল" first, then by month — it feels personal, not clinical.
  const groups: { label: string; items: typeof all }[] = [];
  for (const m of all) {
    const rel = relativeDayBn(m.createdAt);
    const label = rel === 'আজ' || rel === 'গতকাল' ? rel : bnMonthYear(m.createdAt);
    let g = groups.find((x) => x.label === label);
    if (!g) {
      g = { label, items: [] };
      groups.push(g);
    }
    g.items.push(m);
  }

  return (
    <AppScreen>
      <AppHeader
        title="💌 আপনার জন্য বার্তা"
        subtitle={`${toBnNum(all.length)} জন মানুষ দূর থেকে ভালোবাসা পাঠিয়েছে।`}
        back="/day"
      />

      {/* the signature feature */}
      <RandomKindWord />

      {all.length === 0 ? (
        <AppCard tone="cream" className="mt-6">
          <p className="font-bn text-sm leading-relaxed text-muted">
            এখনো কোনো বার্তা অনুমোদিত হয়নি। হলে এখানে চলে আসবে।
          </p>
          <Link href="/" className="mt-3 inline-block font-bn text-xs text-sage-700 underline-offset-4 hover:underline">
            ওয়েবসাইট দেখুন →
          </Link>
        </AppCard>
      ) : (
        <div className="mt-6 space-y-7">
          {groups.map((g) => (
            <section key={g.label}>
              <h2 className="mb-3 flex items-center gap-2 font-bn text-sm font-semibold uppercase tracking-[0.12em] text-faint">
                {g.label}
                <span className="h-px flex-1 bg-line/70" />
                <span className="font-normal normal-case">{toBnNum(g.items.length)}</span>
              </h2>

              <ul className="space-y-3">
                {g.items.map((m) => {
                  const cat = categoryMeta(m.category);
                  return (
                    <li key={m.id}>
                      <AppCard className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 text-lg" aria-hidden>{cat.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-bn text-[15px] leading-relaxed text-ink">
                              “{m.message}”
                            </p>
                            <p className="mt-2 font-bn text-xs text-faint">
                              — {m.anonymous || !m.name ? 'Anonymous' : m.name}
                              <span className="mx-1.5 opacity-50">·</span>
                              {cat.label}
                            </p>
                          </div>
                        </div>
                      </AppCard>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-10 pb-4 text-center font-bn text-[11px] leading-relaxed text-faint">
        প্রতিটি বার্তা মানুষ পড়ে অনুমোদন করার পর এখানে আসে।
        <br />
        🔒 এই তালিকা শুধু আপনার।
      </p>
    </AppScreen>
  );
}
