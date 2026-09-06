'use client';

import { useState } from 'react';
import type { Message } from '@/lib/db/types';
import { categoryMeta } from '@/lib/site';

/**
 * ✨ "আজ আমাকে একটা ভালো কথা বলো"
 *
 * Pulls one random approved message from the database — the bridge between
 * thousands of people far away and one person having a quiet day.
 */
export function RandomKindWord() {
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function ask() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/messages?random=1${message ? `&exclude=${message.id}` : ''}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setMessage(data.message ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-sage-200 bg-gradient-to-br from-sage-50 to-blush-50/50 p-5 shadow-soft">
      <button
        type="button"
        onClick={ask}
        disabled={loading}
        className="w-full rounded-2xl bg-white px-4 py-3.5 font-bn text-sm font-medium text-sage-800 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? 'খুঁজছি…' : message ? '✨ আরেকটা ভালো কথা বলো' : '✨ আজ আমাকে একটা ভালো কথা বলো'}
      </button>

      {error && (
        <p className="mt-3 text-center font-bn text-xs text-blush-600">
          এখন আনা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।
        </p>
      )}

      {message && !loading && (
        <div key={message.id} className="mt-4 animate-fade-up rounded-2xl bg-white p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <span aria-hidden>{categoryMeta(message.category).emoji}</span>
            <span className="font-bn text-[11px] uppercase tracking-[0.14em] text-faint">
              {categoryMeta(message.category).label}
            </span>
          </div>
          <p className="mt-2 font-bn text-[15px] leading-relaxed text-ink">
            “{message.message}”
          </p>
          <p className="mt-2.5 font-bn text-xs text-faint">
            — {message.anonymous || !message.name ? 'Anonymous' : message.name}
          </p>
        </div>
      )}
    </div>
  );
}
