import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { bnDateShort, groupByMonth, todayStr, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, LockBadge } from '@/components/app-ui';
import { addVictory, removeRow } from '../../actions';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 09 — Little Victories
 *
 * The emotional centre of the app. Not "progress against illness" —
 * simply the small things that went right.
 */
export default async function VictoriesPage() {
  const session = await getDaySession();
  if (!session) return null;

  const rows = (await db().all('little_victories'))
    .filter((v) => v.userId === session.userId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const groups = groupByMonth(rows, (v) => v.date);
  const todayCount = rows.filter((v) => v.date === todayStr()).length;

  return (
    <AppScreen>
      <AppHeader
        title="🌱 ছোট্ট জয়"
        subtitle="যে ছোট জিনিসগুলো আজ ঠিকঠাক ছিল।"
        back="/day/more"
        right={<LockBadge />}
      />

      <AppCard tone="sage" className="mb-7">
        <form action={addVictory} className="space-y-3">
          <p className="font-bn text-sm font-semibold text-sage-900">
            + আজকের ছোট্ট জয় যোগ করুন
          </p>
          <input type="hidden" name="date" defaultValue={todayStr()} />
          <textarea
            name="content"
            rows={3}
            required
            maxLength={500}
            className="field-area"
            placeholder="যেমন: আজ কঠিন একটা দিন পার করেছি।"
          />
          <button type="submit" className="app-btn w-full">
            ❤️ সংরক্ষণ করুন
          </button>
        </form>

        {todayCount === 0 && (
          <p className="mt-3 font-bn text-[11px] leading-relaxed text-sage-800/70">
            খুব ছোট কিছুও লেখা যায় — “আজ এক গ্লাস পানি খেয়েছি”, “আজ জানালা খুলেছি”।
            জয়ের কোনো আকার নেই।
          </p>
        )}
      </AppCard>

      {rows.length === 0 ? (
        <AppCard tone="cream">
          <p className="font-bn text-sm leading-relaxed text-muted">
            এখনো কিছু লেখা হয়নি। আজকের প্রথম ছোট্ট জয়টা লিখুন — বড় হতে হবে না।
          </p>
        </AppCard>
      ) : (
        <div className="space-y-7">
          {groups.map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-3 flex items-center gap-2 font-bn text-sm font-semibold uppercase tracking-[0.12em] text-faint">
                {new Intl.DateTimeFormat('bn-BD', {
                  month: 'long', year: 'numeric', numberingSystem: 'beng',
                }).format(new Date(month + '-01'))}
                <span className="h-px flex-1 bg-line/70" />
                <span className="font-normal normal-case">{toBnNum(items.length)}</span>
              </h2>

              <ul className="space-y-3">
                {items.map((v) => (
                  <li key={v.id}>
                    <AppCard className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-base" aria-hidden>❤️</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bn text-[15px] leading-relaxed text-ink">{v.content}</p>
                          <p className="mt-2 font-bn text-xs text-faint">{bnDateShort(v.date)}</p>
                        </div>
                        <form action={removeRow}>
                          <input type="hidden" name="table" value="little_victories" />
                          <input type="hidden" name="id" value={v.id} />
                          <button type="submit" aria-label="মুছুন" className="font-bn text-xs text-faint hover:text-blush-600">
                            ✕
                          </button>
                        </form>
                      </div>
                    </AppCard>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-9 pb-4 text-center font-bn text-[11px] leading-relaxed text-faint">
        মোট {toBnNum(rows.length)} টি ছোট্ট জয় সংরক্ষিত · 🔒 শুধু আপনার জন্য
      </p>
    </AppScreen>
  );
}
