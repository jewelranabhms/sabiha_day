import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { bnMonthYear, groupByMonth, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, LockBadge } from '@/components/app-ui';
import { PhotoUploader } from '@/components/MediaUploaders';
import { removeRow } from '../../actions';

export const dynamic = 'force-dynamic';

/** APP SCREEN 11 — My Memories (photos). These never go to the public website. */
export default async function PhotosPage() {
  const session = await getDaySession();
  if (!session) return null;

  const rows = (await db().all('photos'))
    .filter((p) => p.userId === session.userId)
    .sort((a, b) => (a.photoDate < b.photoDate ? 1 : -1));

  const groups = groupByMonth(rows, (p) => p.photoDate);

  return (
    <AppScreen>
      <AppHeader
        title="📷 আমার স্মৃতি"
        subtitle="ছবিগুলো শুধু এখানে — কখনো ওয়েবসাইটে নয়।"
        back="/day/more"
        right={<LockBadge />}
      />

      <AppCard tone="cream" className="mb-7">
        <PhotoUploader />
      </AppCard>

      {rows.length === 0 ? (
        <AppCard>
          <p className="font-bn text-sm leading-relaxed text-muted">
            এখনো কোনো ছবি যোগ করা হয়নি। আজকের একটা সাধারণ মুহূর্তও বছর পরে অমূল্য হয়ে ওঠে।
          </p>
        </AppCard>
      ) : (
        <div className="space-y-7">
          {groups.map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-3 font-bn text-sm font-semibold uppercase tracking-[0.12em] text-faint">
                {bnMonthYear(items[0].photoDate)}
              </h2>
              <ul className="grid grid-cols-2 gap-3">
                {items.map((p) => (
                  <li key={p.id} className="group relative overflow-hidden rounded-3xl border border-line/70 bg-white shadow-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photoUrl}
                      alt={p.caption || 'স্মৃতি'}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                    {p.caption && (
                      <p className="px-3 py-2 font-bn text-xs leading-snug text-muted">{p.caption}</p>
                    )}
                    <form action={removeRow} className="absolute right-2 top-2">
                      <input type="hidden" name="table" value="photos" />
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        aria-label="মুছুন"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 font-bn text-xs text-faint shadow-soft transition-colors hover:text-blush-600"
                      >
                        ✕
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-9 pb-4 text-center font-bn text-[11px] text-faint">
        মোট {toBnNum(rows.length)} টি ছবি · 🔒 private storage
      </p>
    </AppScreen>
  );
}
