'use client';

import { useState } from 'react';
import { site, currency } from '@/lib/site';
import { toBnNum } from '@/lib/format';
import { cn } from './cn';
import { Button, Container, Eyebrow, Heading, Lead } from './ui';

type Fund = { received: number; target: number; label: string; donors: number; percent: number };

/** Copies a number to the clipboard with a gentle confirmation. */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard blocked — fall back to selecting the text
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 font-bn text-xs font-medium transition-all active:scale-95',
        copied
          ? 'bg-sage-600 text-white'
          : 'border border-line bg-white text-sage-700 hover:border-sage-300',
      )}
      aria-live="polite"
    >
      {copied ? '✓ কপি হয়েছে' : 'Copy Number'}
    </button>
  );
}

/** Reports a donation so the family can verify it manually. */
function DonationReportForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    donorName: '', amount: '', method: 'bKash', transactionReference: '', note: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState('sending');
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount || 0) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'জমা দেওয়া যায়নি।');
      }
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে।');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-3xl border border-sage-200 bg-sage-50 p-6 text-center">
        <p className="font-bn text-base font-semibold text-sage-800">ধন্যবাদ 🌸</p>
        <p className="mt-2 font-bn text-sm leading-relaxed text-sage-700/80">
          আপনার তথ্য জমা হয়েছে। পরিবার যাচাই করার পর তালিকাভুক্ত করা হবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-line/70 bg-white p-6 shadow-soft">
      <p className="font-bn text-sm font-semibold text-ink">পাঠানোর পর জানান</p>
      <p className="mt-1 font-bn text-xs leading-relaxed text-faint">
        যাতে পরিবার যাচাই করে তালিকাভুক্ত করতে পারে।
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="d-name" className="font-bn text-xs text-muted">আপনার নাম</label>
          <input id="d-name" className="field mt-1.5" value={form.donorName} onChange={set('donorName')} maxLength={60} placeholder="নাম (ঐচ্ছিক)" />
        </div>
        <div>
          <label htmlFor="d-amount" className="font-bn text-xs text-muted">পরিমাণ (৳)</label>
          <input id="d-amount" type="number" min="1" required className="field mt-1.5" value={form.amount} onChange={set('amount')} placeholder="1000" />
        </div>
        <div>
          <label htmlFor="d-method" className="font-bn text-xs text-muted">মাধ্যম</label>
          <select id="d-method" className="field mt-1.5" value={form.method} onChange={set('method')}>
            {site.donation.channels.map((c) => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
            <option value="Bank">Bank</option>
          </select>
        </div>
        <div>
          <label htmlFor="d-trx" className="font-bn text-xs text-muted">Transaction ID</label>
          <input id="d-trx" className="field mt-1.5" value={form.transactionReference} onChange={set('transactionReference')} maxLength={40} placeholder="যেমন: BK7H2X9P1Q" />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-blush-200 bg-blush-50 px-4 py-2.5 font-bn text-sm text-blush-600">
          {error}
        </p>
      )}

      <div className="mt-5">
        <Button type="submit" disabled={state === 'sending'} className="w-full sm:w-auto">
          {state === 'sending' ? 'জমা হচ্ছে…' : 'জমা দিন'}
        </Button>
      </div>
    </form>
  );
}

export function DonateStrip({ fund, preview = false }: { fund: Fund; preview?: boolean }) {
  const [showHow, setShowHow] = useState(false);

  return (
    <section id="donate" className={cn('border-y border-line/60 bg-cream', preview ? 'py-16 sm:py-20' : 'py-16 sm:py-24')}>
      <Container>
        <div className="text-center">
          <span className="text-2xl" aria-hidden>❤️</span>
          <Heading className="mt-3">পাশে থাকুন</Heading>
          <Lead className="mx-auto mt-3 max-w-xl">{site.donation.intro}</Lead>
        </div>

        {/* channels */}
        <ul className="mx-auto mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
          {site.donation.channels.map((c) => (
            <li key={c.id} className="rounded-3xl border border-line/70 bg-white p-5 text-center shadow-soft">
              <p className="font-bn text-sm font-semibold text-ink">{c.label}</p>
              <p className="mt-0.5 font-bn text-[11px] uppercase tracking-[0.14em] text-faint">{c.type}</p>
              <p className="mt-3 font-mono text-lg tracking-tight text-sage-800 tabular-nums">
                {toBnNum(c.number)}
              </p>
              <div className="mt-3 flex justify-center">
                <CopyButton value={c.number} />
              </div>
            </li>
          ))}
        </ul>

        {/* fund transparency */}
        <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-line/70 bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-bn text-sm font-semibold text-ink">{fund.label}</p>
            <p className="font-bn text-xs text-faint">{toBnNum(fund.donors)} জন যাচাইকৃত দাতা</p>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-cream">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-600 transition-all duration-700"
              style={{ width: `${Math.max(2, fund.percent)}%` }}
              role="progressbar"
              aria-valuenow={fund.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="mt-3 flex justify-between font-bn text-sm">
            <span className="text-muted">
              Received: <strong className="text-sage-700">{currency(fund.received)}</strong>
            </span>
            <span className="text-muted">
              Target: <strong className="text-ink">{currency(fund.target)}</strong>
            </span>
          </div>
          <p className="mt-3 font-bn text-[11px] leading-relaxed text-faint">
            সব donation ম্যানুয়ালি যাচাই করা হয়। যাচাইয়ের পরই মোট যোগ করা হয়।
          </p>
        </div>

        {!preview && (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="secondary" size="sm" type="button" onClick={() => setShowHow((v) => !v)}>
                {showHow ? 'How to Donate লুকান' : 'How to Donate'}
              </Button>
            </div>

            {showHow && (
              <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-sage-200 bg-sage-50 p-6">
                <Eyebrow>How to Donate</Eyebrow>
                <ol className="mt-4 space-y-2.5">
                  {site.donation.howTo.map((step, i) => (
                    <li key={i} className="flex gap-3 font-bn text-sm leading-relaxed text-sage-900/80">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white font-bn text-[11px] font-semibold text-sage-700">
                        {toBnNum(i + 1)}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="mt-5 rounded-2xl border border-honey-300 bg-honey-100/60 px-4 py-3 font-bn text-xs leading-relaxed text-ink/80">
                  ⚠️ {site.donation.disclaimer}
                </p>
              </div>
            )}

            <div className="mx-auto mt-8 max-w-2xl">
              <DonationReportForm />
            </div>
          </>
        )}

        {preview && (
          <div className="mt-8 flex justify-center">
            <Button href="/donate" variant="secondary">
              বিস্তারিত দেখুন →
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
