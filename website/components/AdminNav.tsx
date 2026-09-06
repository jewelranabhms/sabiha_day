'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from './cn';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '◈', exact: true },
  { href: '/admin/messages', label: 'Messages', icon: '💌' },
  { href: '/admin/updates', label: 'Updates', icon: '🌿' },
  { href: '/admin/treatment', label: 'Treatment', icon: '🌱' },
  { href: '/admin/donations', label: 'Donations', icon: '❤️' },
  { href: '/admin/journal', label: "Sabiha's Journal", icon: '🔒', locked: true },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
];

export function AdminNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const link = (item: (typeof NAV)[number]) => {
    const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          'group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-bn text-sm transition-colors',
          active ? 'bg-sage-100 text-sage-900' : 'text-muted hover:bg-cream hover:text-ink',
        )}
      >
        <span className="w-5 text-center text-base" aria-hidden>{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.href === '/admin/messages' && pendingCount > 0 && (
          <span className="rounded-full bg-blush-500 px-2 py-0.5 font-bn text-[11px] font-semibold text-white">
            {pendingCount}
          </span>
        )}
        {item.locked && <span className="text-[11px] text-faint" title="Read-only by design">🔒</span>}
      </Link>
    );
  };

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line/60 bg-paper/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-bn text-sm font-semibold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-100 text-xs">◈</span>
          Sabiha Admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open
              ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              : <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-b border-line/60 bg-paper px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">{NAV.map(link)}</nav>
        </div>
      )}

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line/60 bg-paper/70 px-4 py-6 lg:block">
        <Link href="/admin" className="mb-7 flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-sm">◈</span>
          <span>
            <span className="block font-bn text-sm font-semibold leading-tight text-ink">Sabiha Admin</span>
            <span className="block font-bn text-[11px] text-faint">authorized team only</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">{NAV.map(link)}</nav>

        <div className="mt-8 space-y-1 border-t border-line/60 pt-5">
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-bn text-sm text-muted transition-colors hover:bg-cream hover:text-ink">
            <span className="w-5 text-center" aria-hidden>🌸</span> View website
          </Link>
          <Link href="/day" className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 font-bn text-sm text-muted transition-colors hover:bg-cream hover:text-ink">
            <span className="w-5 text-center" aria-hidden>🌱</span> Sabiha&apos;s Day
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 font-bn text-sm text-muted transition-colors hover:bg-blush-50 hover:text-blush-600"
            >
              <span className="w-5 text-center" aria-hidden>↩</span> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
