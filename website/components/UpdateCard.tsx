import { bnDateShort, bnTime } from '@/lib/format';
import type { Update } from '@/lib/db/types';

const TYPE_LABEL: Record<string, string> = {
  general: 'সাধারণ',
  health: 'স্বাস্থ্য',
  treatment: 'চিকিৎসা',
  chemotherapy: 'Chemotherapy',
  important: 'গুরুত্বপূর্ণ',
};

/**
 * "Today's Update" — one calm card.
 * No medical speculation, no diagnoses, no percentages.
 */
export function UpdateCard({ update, featured = false }: { update: Update; featured?: boolean }) {
  const when = update.publishedAt ?? update.createdAt;
  return (
    <article
      className={
        'print-block rounded-4xl border border-line/70 bg-white shadow-soft ' +
        (featured ? 'p-7 sm:p-9' : 'p-6')
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 font-bn text-xs font-semibold text-sage-700">
          <span aria-hidden>🌿</span>
          {TYPE_LABEL[update.updateType] ?? 'সাধারণ'}
        </span>
        <time dateTime={when} className="font-bn text-xs text-faint">
          {bnDateShort(when)}
        </time>
      </div>

      <h3
        className={
          'mt-3 font-bn font-semibold text-ink ' +
          (featured ? 'text-xl sm:text-2xl' : 'text-lg')
        }
      >
        {update.title}
      </h3>

      <p
        className={
          'mt-2 font-bn leading-relaxed text-muted text-pretty ' +
          (featured ? 'text-base sm:text-lg' : 'text-sm')
        }
      >
        {update.content}
      </p>

      <p className="mt-4 border-t border-line/70 pt-3 font-bn text-xs text-faint">
        Last updated: {bnDateShort(when)}, {bnTime(when)}
      </p>
    </article>
  );
}
