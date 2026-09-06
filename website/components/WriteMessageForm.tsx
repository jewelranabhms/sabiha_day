'use client';

import { useState } from 'react';
import { site } from '@/lib/site';
import { cn } from './cn';
import { Button } from './ui';

type State = 'idle' | 'sending' | 'sent' | 'error';

/**
 * "সাবিহাকে ভালো কিছু বলুন" — the website's primary CTA.
 *
 * Every submission lands as `status = 'pending'`. Nothing appears on the
 * message wall or in Sabiha's app until an admin approves it.
 */
export function WriteMessageForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string>('dua');
  const [anonymous, setAnonymous] = useState(false);
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);

  const remaining = 600 - message.length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setError(null);

    if (!message.trim() || message.trim().length < 3) {
      setError('অনুগ্রহ করে অন্তত কয়েকটি শব্দ লিখুন।');
      setState('error');
      return;
    }

    setState('sending');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: anonymous ? null : name.trim() || null,
          message: message.trim(),
          category,
          anonymous,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'বার্তা পাঠানো যায়নি।');
      }
      setState('sent');
      setMessage('');
      setName('');
      setAnonymous(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div
        className="rounded-4xl border border-sage-200 bg-sage-50 p-8 text-center shadow-soft sm:p-10"
        role="status"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-soft">
          🌸
        </div>
        <h3 className="mt-5 font-bn text-xl font-semibold text-sage-800">
          ধন্যবাদ। আপনার বার্তা পৌঁছে গেছে।
        </h3>
        <p className="mx-auto mt-2 max-w-md font-bn text-sm leading-relaxed text-sage-700/80">
          বার্তাটি একটু যাচাইয়ের পর সাবিহার কাছে পৌঁছে দেওয়া হবে। আপনার এই ছোট্ট কথাটা
          হয়তো কোনো একদিন তার সবচেয়ে দরকারি কথা হয়ে উঠবে।
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => setState('idle')} type="button">
            আরেকটা বার্তা লিখুন
          </Button>
          <Button href="/messages" variant="ghost" type="button">
            অন্যদের বার্তা পড়ুন →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'rounded-4xl border border-line/70 bg-white shadow-soft',
        compact ? 'p-6 sm:p-7' : 'p-7 sm:p-10',
      )}
    >
      {!compact && (
        <div className="mb-7 text-center">
          <h2 className="font-bn text-2xl font-semibold text-ink sm:text-3xl">
            ❤️ সাবিহাকে লিখুন
          </h2>
          <p className="mx-auto mt-2 max-w-md font-bn text-sm leading-relaxed text-muted">
            আপনার একটি ছোট্ট কথাও হয়তো তার দিনটা বদলে দিতে পারে।
          </p>
        </div>
      )}

      {/* Category */}
      <fieldset>
        <legend className="font-bn text-xs font-semibold uppercase tracking-[0.16em] text-faint">
          কেমন কথা বলতে চান?
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {site.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={cn('chip', category === c.id && 'chip-active')}
            >
              <span aria-hidden>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Name */}
      <div className="mt-6">
        <label htmlFor="msg-name" className="font-bn text-xs font-semibold uppercase tracking-[0.16em] text-faint">
          আপনার নাম <span className="normal-case tracking-normal text-faint/70">(ঐচ্ছিক)</span>
        </label>
        <input
          id="msg-name"
          className="field mt-2"
          placeholder="আপনার নাম"
          value={name}
          maxLength={60}
          disabled={anonymous}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Message */}
      <div className="mt-5">
        <label htmlFor="msg-body" className="font-bn text-xs font-semibold uppercase tracking-[0.16em] text-faint">
          আপনার বার্তা
        </label>
        <textarea
          id="msg-body"
          className="field-area mt-2 min-h-36"
          placeholder="আপনার বার্তা লিখুন…"
          value={message}
          maxLength={600}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <div className="mt-1.5 flex items-center justify-between">
          <p className="font-bn text-xs text-faint">
            উদাহরণ: “সাবিহা, তুমি একা নও… আমরা তোমার জন্য দোয়া করছি।”
          </p>
          <span
            className={cn(
              'shrink-0 font-bn text-xs tabular-nums',
              remaining < 40 ? 'text-blush-500' : 'text-faint',
            )}
          >
            {remaining}
          </span>
        </div>
      </div>

      {/* Anonymous */}
      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-cream/50 px-4 py-3">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-sage-600"
        />
        <span className="font-bn text-sm text-muted">আমার নাম দেখাবেন না</span>
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-blush-200 bg-blush-50 px-4 py-3 font-bn text-sm text-blush-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="hidden max-w-[16rem] font-bn text-xs leading-relaxed text-faint sm:block">
          প্রতিটি বার্তা পরিবারের অনুমোদনের পর প্রকাশিত হয়।
        </p>
        <Button
          type="submit"
          variant="blush"
          size="lg"
          disabled={state === 'sending'}
          className="w-full sm:w-auto"
        >
          {state === 'sending' ? 'পাঠানো হচ্ছে…' : 'বার্তা পাঠান ❤️'}
        </Button>
      </div>
    </form>
  );
}
