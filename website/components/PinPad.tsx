'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from './cn';

/**
 * Journal lock — a calm numeric pad.
 * The PIN never leaves the device as plain text; it is verified server-side
 * against a scrypt hash.
 */
export function PinPad({
  onSubmit,
  error,
  label = 'আপনার PIN দিন',
  length = 4,
}: {
  onSubmit: (pin: string) => Promise<void> | void;
  error?: boolean;
  label?: string;
  length?: number;
}) {
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(value: string) {
    if (busy || value.length < length) return;
    setBusy(true);
    try {
      await onSubmit(value);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function press(d: string) {
    setPin((p) => {
      if (p.length >= 8) return p;
      const next = p + d;
      if (next.length === length) void submit(next);
      return next;
    });
  }

  function back() {
    setPin((p) => p.slice(0, -1));
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div>
      <p className="text-center font-bn text-sm text-muted">{label}</p>

      <div className="mt-5 flex justify-center gap-3">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              'h-3.5 w-3.5 rounded-full border-2 transition-all duration-200',
              error ? 'border-blush-400 bg-blush-100' : 'border-sage-300',
              i < pin.length && (error ? 'bg-blush-400' : 'scale-110 bg-sage-500'),
            )}
          />
        ))}
      </div>

      <div className="mx-auto mt-8 grid max-w-[16rem] grid-cols-3 gap-3">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            disabled={busy}
            className="flex h-16 items-center justify-center rounded-3xl border border-line bg-white font-bn text-xl font-medium text-ink shadow-soft transition-all hover:border-sage-300 active:scale-95 disabled:opacity-50"
          >
            {k}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => press('0')}
          disabled={busy}
          className="flex h-16 items-center justify-center rounded-3xl border border-line bg-white font-bn text-xl font-medium text-ink shadow-soft transition-all hover:border-sage-300 active:scale-95 disabled:opacity-50"
        >
          0
        </button>
        <button
          type="button"
          onClick={back}
          disabled={busy || !pin.length}
          aria-label="মুছুন"
          className="flex h-16 items-center justify-center rounded-3xl border border-line bg-cream font-bn text-lg text-muted shadow-soft transition-all active:scale-95 disabled:opacity-40"
        >
          ⌫
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {busy ? 'যাচাই করা হচ্ছে' : ''}
      </p>
    </div>
  );
}
