'use client';

import { useState } from 'react';
import type { Message } from '@/lib/db/types';
import { site } from '@/lib/site';

/**
 * The Easter egg — and the emotional centre of the app.
 *
 * When a journal entry sounds like a hard day, the app deliberately does NOT
 * respond with advice, statistics or anything medical. It says one gentle
 * thing, and then — only if she asks — shows a kind word somebody else sent.
 */
export function ComfortCard({ message }: { message: Message | null }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-blush-200 bg-blush-50/70 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl" aria-hidden>🤍</span>
        <div>
          <p className="font-bn text-[15px] leading-relaxed text-ink">
            {site.hardDayResponse.message}
          </p>
          <p className="mt-1 font-bn text-xs leading-relaxed text-muted">
            {site.hardDayResponse.messageEn}
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-4">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full rounded-2xl bg-white px-4 py-3 font-bn text-sm font-medium text-blush-600 shadow-soft transition-all hover:bg-blush-100/60 active:scale-[0.98]"
            >
              ✨ {site.hardDayResponse.cta}
            </button>
          ) : (
            <div className="animate-fade-up rounded-2xl bg-white p-4 shadow-soft">
              <p className="font-bn text-[15px] leading-relaxed text-ink">
                “{message.message}”
              </p>
              <p className="mt-2.5 font-bn text-xs text-faint">
                — {message.anonymous || !message.name ? 'Anonymous' : message.name}
                <span className="mx-1.5 opacity-50">·</span>
                কারও পাঠানো ভালোবাসা
              </p>
            </div>
          )}
        </div>
      )}

      <p className="mt-4 font-bn text-[11px] leading-relaxed text-faint">
        এই অ্যাপ কোনো চিকিৎসা পরামর্শ দেয় না। শারীরিক কষ্ট বাড়লে পরিবার বা চিকিৎসকের
        সঙ্গে কথা বলুন।
      </p>
    </div>
  );
}
