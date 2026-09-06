import { bnDateLong, relativeDayBn } from '@/lib/format';
import type { TreatmentEvent } from '@/lib/db/types';
import { cn } from './cn';

const TYPE_META: Record<string, { emoji: string; label: string }> = {
  general: { emoji: '🌿', label: 'General' },
  health: { emoji: '🩺', label: 'Health' },
  treatment: { emoji: '🌱', label: 'Treatment' },
  chemotherapy: { emoji: '💧', label: 'Chemotherapy' },
  important: { emoji: '⭐', label: 'Important' },
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'নির্ধারিত',
  ongoing: 'চলমান',
  completed: 'সম্পন্ন',
  cancelled: 'বাতিল',
};

/**
 * The treatment journey, shown as a calm timeline.
 *
 * Deliberately NOT a progress bar of illness — no percentages, no countdowns,
 * no clinical language. Events are milestones the family chose to share.
 */
export function Timeline({
  events,
  compact = false,
  showPrivate = false,
}: {
  events: TreatmentEvent[];
  compact?: boolean;
  showPrivate?: boolean;
}) {
  const visible = showPrivate ? events : events.filter((e) => e.visibility === 'public');

  if (!visible.length) {
    return (
      <p className="font-bn text-sm text-faint">
        এখনো কোনো তথ্য প্রকাশ করা হয়নি।
      </p>
    );
  }

  return (
    <ol className="relative">
      {/* the thread */}
      <span
        aria-hidden
        className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-sage-200 via-sage-200 to-transparent"
      />
      {visible.map((e, i) => {
        const meta = TYPE_META[e.eventType] ?? TYPE_META.general;
        const isDone = e.status === 'completed';
        const isPrivate = e.visibility !== 'public';
        return (
          <li
            key={e.id}
            className={cn(
              'relative pl-9',
              compact ? 'pb-6' : 'pb-9',
              i === visible.length - 1 && 'pb-0',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-paper',
                isDone
                  ? 'border-sage-400 bg-sage-400'
                  : e.status === 'ongoing'
                    ? 'border-honey-500 bg-honey-100'
                    : 'border-sage-300',
              )}
            >
              {isDone && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>

            <div
              className={cn(
                'rounded-3xl border bg-white p-5 shadow-soft transition-colors',
                isPrivate ? 'border-blush-200 bg-blush-50/40' : 'border-line/70',
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <time
                  dateTime={e.eventDate}
                  className="font-bn text-xs font-semibold text-sage-700"
                >
                  {bnDateLong(e.eventDate)}
                </time>
                <span className="h-1 w-1 rounded-full bg-line" aria-hidden />
                <span className="font-bn text-xs text-faint">{relativeDayBn(e.eventDate)}</span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 font-bn text-[11px] font-medium text-muted">
                  <span aria-hidden>{meta.emoji}</span>
                  {STATUS_LABEL[e.status] ?? e.status}
                </span>
              </div>

              <h3 className="mt-2.5 font-bn text-lg font-semibold text-ink">{e.title}</h3>

              {e.description && (
                <p className="mt-1.5 font-bn text-sm leading-relaxed text-muted text-pretty">
                  {e.description}
                </p>
              )}

              {isPrivate && (
                <p className="mt-3 inline-flex items-center gap-1.5 font-bn text-[11px] font-medium text-blush-600">
                  🔒 শুধু সাবিহার অ্যাপে দৃশ্যমান
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
