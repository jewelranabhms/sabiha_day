import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { dayLogin } from './actions';
import { DEMO_APP_PASSWORD } from '@/lib/auth';

export const metadata: Metadata = {
  title: `${site.brand.day} · sign in`,
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DayLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const isDev = process.env.NODE_ENV !== 'production';
  const users = await db().all('app_users');
  const sabiha = users.find((u) => u.role === 'sabiha');

  return (
    <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-12">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-2xl">
          🌱
        </div>
        <h1 className="mt-5 font-bn text-2xl font-semibold tracking-tight text-ink">
          {site.brand.day}
        </h1>
        <p className="mt-1.5 font-bn text-sm text-muted">{site.brand.appTagline}</p>
      </div>

      <form action={dayLogin} className="mt-8 space-y-4">
        <label className="block">
          <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue={sabiha?.email ?? ''}
            className="field mt-1.5"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field mt-1.5"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-2xl border border-blush-200 bg-blush-50 px-4 py-2.5 font-bn text-sm text-blush-600">
            ঠিক পায়নি। আবার চেষ্টা করুন।
          </p>
        )}

        <button type="submit" className="app-btn w-full">
          ঢুকুন
        </button>
      </form>

      {isDev && (
        <p className="mt-5 rounded-2xl border border-honey-300 bg-honey-100/50 px-4 py-3 font-bn text-xs leading-relaxed text-ink/70">
          <strong>Development demo:</strong>
          <br />
          email <code className="font-mono">{sabiha?.email ?? 'sabiha@example.com'}</code>
          <br />
          password <code className="font-mono">{DEMO_APP_PASSWORD}</code>
        </p>
      )}

      <div className="mt-6 space-y-2 text-center">
        <p className="font-bn text-xs leading-relaxed text-faint">
          এই অ্যাপটি শুধু সাবিহার জন্য। এখানে কোনো signup নেই —
          অ্যাকাউন্ট পরিবারের তরফ থেকে তৈরি করা হয়।
        </p>
        <Link href="/" className="font-bn text-xs text-sage-700 underline-offset-4 hover:underline">
          ← ওয়েবসাইটে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
