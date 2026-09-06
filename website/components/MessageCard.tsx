import { categoryMeta } from '@/lib/site';
import { bnDateShort, relativeDayBn } from '@/lib/format';
import type { Message } from '@/lib/db/types';
import { cn } from './cn';

/**
 * A single approved message. Rendered as a quiet card — never as a
 * "comment thread". There is no reply, no like count, no public conversation.
 */
export function MessageCard({
  message,
  className,
  showDate = true,
}: {
  message: Message;
  className?: string;
  showDate?: boolean;
}) {
  const cat = categoryMeta(message.category);
  const who = message.anonymous || !message.name ? 'Anonymous' : message.name;

  return (
    <article
      className={cn(
        'print-shadow print-block group relative rounded-4xl border border-line/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-7',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 font-bn text-xs font-medium text-muted"
          title={cat.en}
        >
          <span aria-hidden>{cat.emoji}</span>
          {cat.label}
        </span>
        {showDate && (
          <time
            dateTime={message.createdAt}
            className="shrink-0 font-bn text-xs text-faint"
            title={bnDateShort(message.createdAt)}
          >
            {relativeDayBn(message.createdAt)}
          </time>
        )}
      </div>

      <blockquote className="mt-4">
        <p className="quote text-pretty">“{message.message}”</p>
      </blockquote>

      <p className="mt-5 font-bn text-sm text-muted">
        <span className="text-faint">— </span>
        {who}
      </p>
    </article>
  );
}
