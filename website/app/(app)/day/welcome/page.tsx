import Link from 'next/link';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * APP SCREEN 01 — Welcome.
 *
 * The first thing she ever sees. Not a diagnosis, not a treatment plan.
 * Just: today, only today.
 */
export default function WelcomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 py-12 text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-sage-50 via-paper to-blush-50/40"
      />

      <p className="font-bn text-[11px] font-semibold uppercase tracking-[0.34em] text-sage-600">
        {site.brand.day}
      </p>

      <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-lift animate-breathe">
        🌱
      </div>

      <h1 className="mt-9 font-bn text-3xl font-semibold leading-tight tracking-tight text-ink">
        One day
        <br />
        at a time.
      </h1>

      <p className="mt-5 font-bn text-base leading-relaxed text-muted">
        আজ শুধু আজকের দিনটা।
      </p>

      <div className="mt-10 w-full max-w-xs space-y-3">
        <Link href="/day" className="app-btn w-full">
          শুরু করি
        </Link>
        <Link href="/day/login" className="app-btn-soft w-full text-muted">
          অন্য অ্যাকাউন্টে ঢুকুন
        </Link>
      </div>

      <p className="mt-10 max-w-[16rem] font-bn text-[11px] leading-relaxed text-faint">
        এখানে যা লিখবেন তা শুধু আপনার। কেউ পড়বে না — না পরিবার, না ডাক্তার, না এই ওয়েবসাইট।
      </p>
    </div>
  );
}
