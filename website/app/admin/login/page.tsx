import type { Metadata } from 'next';
import Link from 'next/link';
import { adminLogin } from './actions';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper bg-grain px-5 py-14">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-xl">
            ◈
          </span>
          <h1 className="mt-5 font-bn text-2xl font-semibold text-ink">Sabiha Admin</h1>
          <p className="mt-2 font-bn text-sm leading-relaxed text-muted">
            এই জায়গাটা শুধু অনুমোদিত টিমের জন্য।
          </p>
        </div>

        <form
          action={adminLogin}
          className="mt-8 rounded-4xl border border-line/70 bg-white p-6 shadow-soft sm:p-7"
        >
          <label htmlFor="pw" className="font-bn text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            Password
          </label>
          <input
            id="pw"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="field mt-2"
            placeholder="••••••••••"
          />

          {error && (
            <p role="alert" className="mt-4 rounded-2xl border border-blush-200 bg-blush-50 px-4 py-2.5 font-bn text-sm text-blush-600">
              ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।
            </p>
          )}

          <button type="submit" className="app-btn mt-5 w-full">
            Sign in
          </button>

          {isDev && (
            <p className="mt-4 rounded-2xl border border-honey-300 bg-honey-100/50 px-4 py-2.5 font-bn text-xs leading-relaxed text-ink/70">
              <strong>Development mode:</strong> পাসওয়ার্ড <code className="font-mono">sabiha-admin-2026</code>
              <br />
              Production-এ <code className="font-mono">ADMIN_PASSWORD</code> env variable অবশ্যই সেট করতে হবে।
            </p>
          )}
        </form>

        <p className="mt-6 text-center">
          <Link href="/" className="font-bn text-sm text-muted underline-offset-4 hover:text-sage-700 hover:underline">
            ← ওয়েবসাইটে ফিরে যান
          </Link>
        </p>
      </div>
    </div>
  );
}
