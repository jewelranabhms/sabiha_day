import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { bnDateLong, relativeDayBn } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, AppSectionTitle, LockBadge } from '@/components/app-ui';
import { Timeline } from '@/components/Timeline';
import type { TreatmentEvent } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 07 — My Treatment
 *
 * This screen exists, but it is never the front door of the app.
 * Two hard rules:
 *   1. The app never gives medical recommendations.
 *   2. Doctor's instructions only appear here when an authorised family /
 *      medical account enters them — and they are marked as such.
 */
export default async function TreatmentPage() {
  const session = await getDaySession();
  if (!session) return null;

  const all = (await db().all('treatment_events')).sort((a, b) =>
    a.eventDate < b.eventDate ? -1 : 1,
  );
  // Inside the app she sees everything, including private notes.
  const visible = all;
  const upcoming = visible.find((e) => e.status === 'scheduled' || e.status === 'ongoing');
  const currentStage =
    [...visible].reverse().find((e) => e.status === 'ongoing' || e.status === 'scheduled') ?? null;

  const doctorNotes = visible.filter((e) => e.visibility === 'private');

  return (
    <AppScreen>
      <AppHeader
        title="🏥 আমার চিকিৎসা"
        subtitle="এখানে যা আছে তা পরিবার ও চিকিৎসকদের দেওয়া তথ্য।"
        back="/day/more"
        right={<LockBadge label="Private" />}
      />

      {/* current stage */}
      {currentStage && (
        <AppCard className="mb-6">
          <p className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            Current stage
          </p>
          <p className="mt-1.5 font-bn text-xl font-semibold text-ink">{currentStage.title}</p>
          <p className="mt-1 font-bn text-sm text-muted">
            {bnDateLong(currentStage.eventDate)} · {relativeDayBn(currentStage.eventDate)}
          </p>
        </AppCard>
      )}

      {/* next appointment */}
      <section className="mb-7">
        <AppSectionTitle>Next appointment</AppSectionTitle>
        {upcoming ? (
          <AppCard tone="sage">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bn text-base font-semibold text-sage-900">{upcoming.title}</p>
                <p className="mt-1 font-bn text-sm text-sage-800/70">
                  {bnDateLong(upcoming.eventDate)}
                </p>
                <p className="mt-0.5 font-bn text-xs text-sage-700/70">
                  {relativeDayBn(upcoming.eventDate)}
                </p>
              </div>
              <span className="text-2xl" aria-hidden>📅</span>
            </div>
            {upcoming.description && (
              <p className="mt-3 border-t border-sage-200 pt-3 font-bn text-sm leading-relaxed text-sage-900/70">
                {upcoming.description}
              </p>
            )}
          </AppCard>
        ) : (
          <AppCard tone="cream">
            <p className="font-bn text-sm text-muted">এই মুহূর্তে কোনো নির্ধারিত appointment নেই।</p>
          </AppCard>
        )}
      </section>

      {/* doctor's notes */}
      <section className="mb-7">
        <AppSectionTitle>Doctor&apos;s Notes</AppSectionTitle>
        {doctorNotes.length === 0 ? (
          <AppCard tone="cream">
            <p className="font-bn text-sm leading-relaxed text-muted">
              এখনো কোনো নোট যোগ করা হয়নি। চিকিৎসকের নির্দেশনা থাকলে পরিবারের অনুমোদিত
              অ্যাকাউন্ট থেকে এখানে যোগ হবে।
            </p>
          </AppCard>
        ) : (
          <ul className="space-y-3">
            {doctorNotes.map((n) => (
              <li key={n.id}>
                <AppCard className="border-blush-200 bg-blush-50/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bn text-sm font-semibold text-ink">{n.title}</p>
                    <LockBadge label="Private" />
                  </div>
                  {n.description && (
                    <p className="mt-2 font-bn text-sm leading-relaxed text-muted">{n.description}</p>
                  )}
                  <p className="mt-2 font-bn text-[11px] text-faint">{bnDateLong(n.eventDate)}</p>
                </AppCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* timeline */}
      <section>
        <AppSectionTitle>Timeline</AppSectionTitle>
        <Timeline events={visible as TreatmentEvent[]} compact showPrivate />
      </section>

      <div className="mt-8 rounded-3xl border border-honey-300 bg-honey-100/50 p-5">
        <p className="font-bn text-sm font-semibold text-ink">⚠️ একটি গুরুত্বপূর্ণ কথা</p>
        <p className="mt-2 font-bn text-sm leading-relaxed text-muted">
          এই অ্যাপ কোনো medical recommendation দেয় না — না ওষুধ, না ডোজ, না পরামর্শ।
          এখানে যা আছে তা শুধু পরিবার ও চিকিৎসকের দেওয়া তথ্য সংরক্ষণ করে।
          শারীরিক অবস্থার কোনো পরিবর্তন হলে সরাসরি চিকিৎসকের সঙ্গে যোগাযোগ করুন।
        </p>
      </div>

      <p className="mt-7 pb-4 text-center font-bn text-[11px] text-faint">
        🔒 এই পাতাটা ওয়েবসাইটে কখনো প্রকাশিত হয় না।
      </p>
    </AppScreen>
  );
}
