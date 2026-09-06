import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { bnDateLong, relativeDayBn, todayStr, toBnNum, groupByMonth } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, AppSectionTitle, LockBadge } from '@/components/app-ui';
import { addVisitor, removeRow } from '../../actions';

export const dynamic = 'force-dynamic';

const RELATIONSHIP_ICONS: Record<string, string> = {
  mom: '👩', mother: '👩', 'আম্মু': '👩',
  dad: '👨', father: '👨', 'আব্বু': '👨',
  friend: '👭', 'বন্ধু': '👭',
  doctor: '👨‍⚕️', 'ডাক্তার': '👨‍⚕️',
  family: '👨‍👩‍👧', teacher: '🧑‍🏫',
};

/**
 * APP SCREEN 08 — "আজ কে এসেছিল?"
 *
 * Over time this quietly becomes a memory timeline: the record of everyone
 * who showed up.
 */
export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await getDaySession();
  if (!session) return null;

  const sp = await searchParams;
  const date = sp.date || todayStr();

  const rows = (await db().all('visitors'))
    .filter((v) => v.userId === session.userId)
    .sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1));

  const todays = rows.filter((v) => v.visitDate === date);
  const groups = groupByMonth(rows, (v) => v.visitDate);

  return (
    <AppScreen>
      <AppHeader
        title="🫂 আজ কে এসেছিল?"
        subtitle="যারা আপনার পাশে ছিলেন — তাদের একটু মনে রাখা।"
        back="/day/more"
        right={<LockBadge />}
      />

      {/* add */}
      <AppCard tone="cream" className="mb-7">
        <form action={addVisitor} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bn text-sm font-semibold text-ink">নতুন করে যোগ করুন</p>
            <input type="date" name="visitDate" defaultValue={date} className="rounded-xl border border-line bg-white px-2.5 py-1.5 font-bn text-xs text-muted" />
          </div>

          <input name="name" className="field" required maxLength={60} placeholder="নাম — যেমন: আম্মু, নুসরাত" />

          <input name="relationship" className="field" maxLength={40} placeholder="সম্পর্ক — যেমন: Mom, Friend, Doctor" />

          <textarea
            name="note"
            rows={2}
            maxLength={500}
            className="field-area"
            placeholder="একটু লিখুন — “ফুল নিয়ে এসেছিল।”"
          />

          <button type="submit" className="app-btn w-full">+ Add person</button>
        </form>
      </AppCard>

      {/* today */}
      <AppSectionTitle>{relativeDayBn(date)} · {bnDateLong(date)}</AppSectionTitle>
      {todays.length === 0 ? (
        <AppCard className="mb-7">
          <p className="font-bn text-sm leading-relaxed text-muted">
            আজ কেউ এলে লিখে রাখুন। ছোট্ট একটা লাইনও বছর পরে অনেক বড় হয়ে ওঠে।
          </p>
        </AppCard>
      ) : (
        <ul className="mb-7 space-y-3">
          {todays.map((v) => {
            const icon =
              RELATIONSHIP_ICONS[(v.relationship || '').toLowerCase()] ??
              RELATIONSHIP_ICONS[v.name.toLowerCase()] ??
              '🫂';
            return (
              <li key={v.id}>
                <AppCard className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-lg" aria-hidden>
                      {icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bn text-[15px] font-semibold text-ink">{v.name}</p>
                      {v.relationship && <p className="font-bn text-xs text-faint">{v.relationship}</p>}
                      {v.note && (
                        <p className="mt-2 font-bn text-sm leading-relaxed text-muted">“{v.note}”</p>
                      )}
                    </div>
                    <form action={removeRow}>
                      <input type="hidden" name="table" value="visitors" />
                      <input type="hidden" name="id" value={v.id} />
                      <button type="submit" aria-label="মুছুন" className="font-bn text-xs text-faint hover:text-blush-600">
                        ✕
                      </button>
                    </form>
                  </div>
                </AppCard>
              </li>
            );
          })}
        </ul>
      )}

      {/* history */}
      {groups.length > 0 && (
        <>
          <AppSectionTitle>সব মিলিয়ে ({toBnNum(rows.length)} জন)</AppSectionTitle>
          <div className="space-y-6">
            {groups.map(([month, items]) => (
              <section key={month}>
                <h3 className="mb-2 font-bn text-xs font-semibold uppercase tracking-[0.12em] text-faint">
                  {bnDateLong(items[0].visitDate).replace(/\d+/, '')}
                </h3>
                <ul className="space-y-2">
                  {items.map((v) => (
                    <li key={v.id}>
                      <a href={`/day/visitors?date=${v.visitDate}`} className="block">
                        <AppCard className="p-3.5 transition-all hover:-translate-y-0.5">
                          <div className="flex items-center gap-3">
                            <span className="font-bn text-sm text-ink">{v.name}</span>
                            {v.relationship && (
                              <span className="rounded-full bg-cream px-2 py-0.5 font-bn text-[10px] text-muted">
                                {v.relationship}
                              </span>
                            )}
                            <span className="ml-auto font-bn text-[11px] text-faint">
                              {bnDateLong(v.visitDate)}
                            </span>
                          </div>
                        </AppCard>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <p className="mt-9 pb-4 text-center font-bn text-[11px] leading-relaxed text-faint">
        এটাই একদিন হয়ে উঠবে আপনার memory timeline — কে কে পাশে ছিল, তার পূর্ণ হিসাব।
      </p>
    </AppScreen>
  );
}
