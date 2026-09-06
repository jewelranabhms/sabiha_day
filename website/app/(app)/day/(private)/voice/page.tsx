import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { bnDateLong, toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, LockBadge } from '@/components/app-ui';
import { VoiceRecorder } from '@/components/MediaUploaders';
import { removeRow } from '../../actions';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 12 — Voice Diary
 * "Say what you feel." For the days when writing is too much.
 */
export default async function VoicePage() {
  const session = await getDaySession();
  if (!session) return null;

  const rows = (await db().all('voice_diaries'))
    .filter((v) => v.userId === session.userId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <AppScreen>
      <AppHeader
        title="🎙️ যা অনুভব করছেন, বলুন"
        subtitle="লিখতে ইচ্ছে না করলে — শুধু বলুন।"
        back="/day/more"
        right={<LockBadge />}
      />

      <AppCard className="mb-7">
        <VoiceRecorder />
      </AppCard>

      <div className="rounded-3xl border border-sage-200 bg-sage-50 p-5">
        <p className="font-bn text-sm leading-relaxed text-sage-900/80">
          কখনো কখনো কথাগুলো লেখা যায় না, বলা যায়। তখন শুধু রেকর্ড করুন —
          কেউ শুনবে না, শুধু আপনি।
        </p>
        <p className="mt-2 font-bn text-xs leading-relaxed text-sage-800/60">
          ভবিষ্যতে চাইলে এই রেকর্ডিংগুলো থেকে transcript তৈরি করা যাবে।
        </p>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-bn text-sm font-semibold uppercase tracking-[0.12em] text-faint">
          আপনার রেকর্ডিং ({toBnNum(rows.length)})
        </h2>

        {rows.length === 0 ? (
          <AppCard tone="cream">
            <p className="font-bn text-sm leading-relaxed text-muted">
              এখনো কিছু রেকর্ড করা হয়নি।
            </p>
          </AppCard>
        ) : (
          <ul className="space-y-3">
            {rows.map((v) => (
              <li key={v.id}>
                <AppCard className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bn text-xs font-semibold text-sage-700">{bnDateLong(v.date)}</p>
                    <div className="flex items-center gap-3">
                      {v.durationS ? (
                        <span className="font-bn text-[11px] text-faint">
                          {toBnNum(Math.floor(v.durationS / 60))}:{String(toBnNum(v.durationS % 60)).padStart(2, '০')}
                        </span>
                      ) : null}
                      <form action={removeRow}>
                        <input type="hidden" name="table" value="voice_diaries" />
                        <input type="hidden" name="id" value={v.id} />
                        <button type="submit" aria-label="মুছুন" className="font-bn text-xs text-faint hover:text-blush-600">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls preload="none" src={v.audioUrl} className="mt-3 w-full" />
                  {v.transcript && (
                    <p className="mt-3 border-t border-line/70 pt-3 font-bn text-sm leading-relaxed text-muted">
                      {v.transcript}
                    </p>
                  )}
                </AppCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-9 pb-4 text-center font-bn text-[11px] text-faint">
        🔒 ভয়েস ফাইল cloud-এ সংরক্ষিত, কিন্তু কারও পড়ার অনুমতি নেই।
      </p>
    </AppScreen>
  );
}
