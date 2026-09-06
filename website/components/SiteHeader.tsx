'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { site } from '@/lib/site';
import { cn } from './cn';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isDay = pathname?.startsWith('/day');
  const isAdmin = pathname?.startsWith('/admin');

  if (isDay || isAdmin) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-base transition-transform group-hover:scale-105">
            🌸
          </span>
          <span className="font-bn text-[15px] font-semibold tracking-tight text-ink">
            {site.brand.journey}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-3.5 py-2 font-bn text-sm transition-colors',
                  active ? 'bg-sage-100 text-sage-800' : 'text-muted hover:bg-cream hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/write"
            className="ml-2 rounded-full bg-blush-500 px-4 py-2 font-bn text-sm font-medium text-white shadow-soft transition-all hover:bg-blush-600 active:scale-[0.98]"
          >
            ❤️ লিখুন
          </Link>
        </nav>

        <button
          type="button"
          aria-label="মেনু"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink md:hidden"
        >
          <span className="sr-only">মেনু</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line/60 bg-paper px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 font-bn text-sm text-ink hover:bg-cream"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/write"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-2xl bg-blush-500 px-4 py-3 text-center font-bn text-sm font-medium text-white"
            >
              ❤️ সাবিহাকে ভালো কিছু বলুন
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
