import Link from 'next/link';
import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { site } from '@/lib/site';
import { greetingBn, bnDateWithWeekday, todayStr, toBnNum } from '@/lib/format';
import { categoryMeta } from '@/lib/site';
import { AppScreen, AppCard, AppSectionTitle, LockBadge } from '@/components/app-ui';
import { setMood, toggleLittleThing } from '../actions';
import { cn } from '@/components/cn';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 02 — Home.
 *
 * The most important screen in the whole product, and it obeys one rule:
 *
 *      "Don't make Sabiha feel like a patient."
 *
 * So the order is: greeting → how are you feeling → today's little things →
 * messages for you → today's words.
 *
 * There is no diagnosis here. No chemotherapy countdown. No percentages.
 * Treatment exists in this app, but it is never her identity.
 */
export default async function DayHome() {
  const session = await getDaySession();
  if (!session) return null;

  const today = todayStr();
  const [checks, journal, messages, prayers] = await Promise.all([
    db().all('daily_checks'),
    db().all('journal_entries'),
    db().all('messages'),
    db().all('prayer_logs'),
  ]);

  const check = checks.find((c) => c.userId === session.userId && c.checkDate === today);
  const todaysEntry = journal.find((j) => j.userId === session.userId && j.entryDate === today);
  const prayer = prayers.find((p) => p.userId === session.userId && p.logDate === today);

  const forYou = messages
    .filter((m) => m.status === 'approved')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 2);

  const prayerCount = prayer
    ? site.prayers.filter((p) => (prayer as any)[p.id]).length
    : 0;

  const littleThings = check?.littleThings ?? {};
  const doneCount = site.littleThings.filter((t) => littleThings[t.id]).length;

  return (
    <AppScreen>
      {/* ── greeting ── */}
      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-bn text-2xl font-semibold leading-snug tracking-tight text-ink">
              {greetingBn()}, {session.name} <span aria-hidden>❤️</span>
            </h1>
            <p className="mt-1 font-bn text-sm text-muted">
              আজ: {bnDateWithWeekday(today)}
            </p>
          </div>
          <LockBadge />
        </div>
        <p className="mt-3 font-bn text-sm leading-relaxed text-faint">
          আজ শুধু আজকের দিনটা। বাকিটা পরে ভাবা যাবে।
        </p>
      </header>

      {/* ── mood ── */}
      <section className="mt-7">
        <AppSectionTitle>আজ কেমন লাগছে?</AppSectionTitle>
        <form action={setMood}>
          <div className="flex items-stretch justify-between gap-1.5">
            {site.moods.map((m) => {
              const active = check?.mood === m.value;
              return (
                <button
                  key={m.value}
                  type="submit"
                  name="mood"
                  value={m.value}
                  title={m.label}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1.5 rounded-3xl border px-1 py-3 transition-all active:scale-95',
                    active
                      ? 'border-sage-400 bg-sage-50 shadow-soft'
                      : 'border-line/70 bg-white hover:border-sage-200',
                  )}
                >
                  <span className={cn('text-2xl leading-none transition-transform', active && 'scale-110')} aria-hidden>
                    {m.emoji}
                  </span>
                  <span className={cn('font-bn text-[10px] leading-tight', active ? 'text-sage-800' : 'text-faint')}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </form>
        {check?.mood ? (
          <p className="mt-2.5 text-center font-bn text-xs text-faint">
            আজকের অনুভূতি সংরক্ষিত হয়েছে 🔒
          </p>
        ) : (
          <p className="mt-2.5 text-center font-bn text-xs text-faint">
            যেটাই সত্যি, সেটাই বেছে নিন — ভুল উত্তর বলে কিছু নেই।
          </p>
        )}
      </section>

      {/* ── today's little things ── */}
      <section className="mt-8">
        <AppSectionTitle
          href="/day/prayer"
          hrefLabel={prayerCount ? `${toBnNum(prayerCount)}/৫ নামাজ` : undefined}
        >
          🌿 আজকের ছোট্ট কাজগুলো
        </AppSectionTitle>

        <AppCard tone="cream" className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {site.littleThings.map((t) => {
              const on = !!littleThings[t.id];
              return (
                <form key={t.id} action={toggleLittleThing}>
                  <input type="hidden" name="key" value={t.id} />
                  <input type="hidden" name="value" value={on ? 'false' : 'true'} />
                  <button
                    type="submit"
                    aria-pressed={on}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98]',
                      on
                        ? 'border-sage-300 bg-sage-50'
                        : 'border-line/70 bg-white hover:border-sage-200',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px]',
                        on ? 'border-sage-500 bg-sage-500 text-white' : 'border-line bg-white',
                      )}
                      aria-hidden
                    >
                      {on ? '✓' : ''}
                    </span>
                    <span aria-hidden className="text-base">{t.emoji}</span>
                    <span className={cn('font-bn text-sm', on ? 'text-sage-900' : 'text-muted')}>
                      {t.label}
                    </span>
                  </button>
                </form>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2.5">
            <span className="font-bn text-xs text-muted">আজ সম্পন্ন</span>
            <span className="font-bn text-xs font-semibold text-sage-700">
              {toBnNum(doneCount)} / {toBnNum(site.littleThings.length)}
            </span>
          </div>

          <p className="mt-3 px-1 font-bn text-[11px] leading-relaxed text-faint">
            এগুলো কোনো দায়িত্ব নয়। আজ কিছু না করলেও কোনো সমস্যা নেই —
            “বাদ পড়া” মানে “ব্যর্থতা” নয়।
          </p>
        </AppCard>
      </section>

      {/* ── messages for you ── */}
      <section className="mt-8">
        <AppSectionTitle href="/day/messages" hrefLabel="আরও দেখুন">
          💌 আপনার জন্য বার্তা
        </AppSectionTitle>

        {forYou.length === 0 ? (
          <AppCard tone="cream">
            <p className="font-bn text-sm leading-relaxed text-muted">
              এখনো কোনো বার্তা আসেনি। কেউ লিখলে এখানে চলে আসবে।
            </p>
          </AppCard>
        ) : (
          <div className="space-y-3">
            {forYou.map((m) => {
              const cat = categoryMeta(m.category);
              return (
                <AppCard key={m.id} className="p-4">
                  <span className="text-base" aria-hidden>{cat.emoji}</span>
                  <p className="mt-1.5 font-bn text-[15px] leading-relaxed text-ink">
                    “{m.message}”
                  </p>
                  <p className="mt-2 font-bn text-xs text-faint">
                    — {m.anonymous || !m.name ? 'Anonymous' : m.name}
                  </p>
                </AppCard>
              );
            })}
          </div>
        )}
      </section>

      {/* ── today's words ── */}
      <section className="mt-8">
        <AppSectionTitle href="/day/journal" hrefLabel="জার্নাল">
          ✍️ আজকের কথা
        </AppSectionTitle>

        <Link href="/day/journal" className="block">
          <AppCard className="transition-all hover:-translate-y-0.5 hover:shadow-lift">
            {todaysEntry ? (
              <>
                <p className="font-bn text-sm leading-relaxed text-ink">
                  {todaysEntry.content.length > 160
                    ? todaysEntry.content.slice(0, 160) + '…'
                    : todaysEntry.content}
                </p>
                <p className="mt-3 font-bn text-xs text-sage-700">আজ লিখেছেন ✓ · সম্পাদনা করুন</p>
              </>
            ) : (
              <>
                <p className="font-bn text-sm leading-relaxed text-faint">
                  আজ আমার মনে যা আছে…
                </p>
                <p className="mt-3 font-bn text-xs text-sage-700">লিখতে শুরু করুন →</p>
              </>
            )}
          </AppCard>
        </Link>
      </section>

      {/* ── quiet footer, never a status bar of illness ── */}
      <footer className="mt-10 pb-4 text-center">
        <p className="font-bn text-[11px] leading-relaxed text-faint">
          🌱 {site.brand.day} · {site.brand.appTagline}
        </p>
        <Link href="/day/more" className="mt-2 inline-block font-bn text-xs text-sage-700 underline-offset-4 hover:underline">
          সব ঘর দেখুন →
        </Link>
      </footer>
    </AppScreen>
  );
}
