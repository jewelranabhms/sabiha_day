import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { site } from '@/lib/site';
import { bnDateLong, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, AppSectionTitle, LockBadge } from '@/components/app-ui';
import { addMemory, removeRow } from '../../actions';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 10 — People & Memories
 * Grouped by relationship: Family, Friends, Teachers, Doctors, Classmates, Others.
 */
export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ rel?: string }>;
}) {
  const session = await getDaySession();
  if (!session) return null;

  const sp = await searchParams;
  const rows = (await db().all('memories'))
    .filter((m) => m.userId === session.userId)
    .sort((a, b) => (a.memoryDate < b.memoryDate ? 1 : -1));

  const filtered = sp.rel ? rows.filter((m) => (m.relationship || 'Others') === sp.rel) : rows;

  const counts = site.relationships.map((r) => ({
    rel: r,
    n: rows.filter((m) => (m.relationship || 'Others') === r).length,
  }));

  return (
    <AppScreen>
      <AppHeader
        title="🫂 আমার মানুষেরা"
        subtitle="নাম, সম্পর্ক আর তাদের সঙ্গে জড়িয়ে থাকা স্মৃতি।"
        back="/day/more"
        right={<LockBadge />}
      />

      {/* relationship filter */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        <a href="/day/people" className={'chip shrink-0 ' + (!sp.rel ? 'chip-active' : '')}>
          সব ({toBnNum(rows.length)})
        </a>
        {counts.map((c) => (
          <a
            key={c.rel}
            href={`/day/people?rel=${encodeURIComponent(c.rel)}`}
            className={'chip shrink-0 ' + (sp.rel === c.rel ? 'chip-active' : '')}
          >
            {c.rel} ({toBnNum(c.n)})
          </a>
        ))}
      </div>

      {/* add memory */}
      <AppCard tone="cream" className="mb-7">
        <form action={addMemory} className="space-y-3">
          <p className="font-bn text-sm font-semibold text-ink">নতুন স্মৃতি যোগ করুন</p>

          <input name="title" className="field" required maxLength={120} placeholder="শিরোনাম — যেমন: বৃষ্টির দিন" />

          <textarea
            name="description"
            rows={3}
            maxLength={1000}
            className="field-area"
            placeholder="স্মৃতিটা লিখুন…"
          />

          <div className="grid grid-cols-2 gap-3">
            <input name="personName" className="field" maxLength={60} placeholder="কার সঙ্গে?" />
            <select name="relationship" className="field" defaultValue="">
              <option value="">সম্পর্ক…</option>
              {site.relationships.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <input type="date" name="memoryDate" defaultValue={new Date().toISOString().slice(0, 10)} className="field" />

          <button type="submit" className="app-btn w-full">সংরক্ষণ করুন</button>
        </form>
      </AppCard>

      {/* list */}
      <AppSectionTitle>{sp.rel || 'সব স্মৃতি'}</AppSectionTitle>

      {filtered.length === 0 ? (
        <AppCard>
          <p className="font-bn text-sm leading-relaxed text-muted">
            এই তালিকা এখন খালি। একটা পুরনো দিনের কথা লিখে শুরু করা যাক।
          </p>
        </AppCard>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <AppCard className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bn text-[15px] font-semibold text-ink">{m.title}</p>
                    {m.description && (
                      <p className="mt-1.5 font-bn text-sm leading-relaxed text-muted">{m.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {m.personName && (
                        <span className="rounded-full bg-cream px-2.5 py-1 font-bn text-[11px] text-muted">
                          👤 {m.personName}
                        </span>
                      )}
                      {m.relationship && (
                        <span className="rounded-full bg-sage-50 px-2.5 py-1 font-bn text-[11px] text-sage-700">
                          {m.relationship}
                        </span>
                      )}
                      <span className="font-bn text-[11px] text-faint">{bnDateLong(m.memoryDate)}</span>
                    </div>
                  </div>
                  <form action={removeRow}>
                    <input type="hidden" name="table" value="memories" />
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" aria-label="মুছুন" className="font-bn text-xs text-faint hover:text-blush-600">
                      ✕
                    </button>
                  </form>
                </div>
              </AppCard>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-9 pb-4 text-center font-bn text-[11px] text-faint">
        🔒 এগুলো কখনো public website-এ যায় না।
      </p>
    </AppScreen>
  );
}
