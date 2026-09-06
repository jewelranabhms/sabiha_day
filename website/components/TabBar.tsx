'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from './cn';

const TABS = [
  { href: '/day', label: 'আজ', icon: '🌱', exact: true },
  { href: '/day/journal', label: 'জার্নাল', icon: '✍️' },
  { href: '/day/messages', label: 'বার্তা', icon: '💌' },
  { href: '/day/dua', label: 'দোয়া', icon: '🤲' },
  { href: '/day/more', label: 'আরও', icon: '⋯' },
];

/**
 * The bottom tab bar of Sabiha's Day.
 * Note what is NOT here: treatment. The app never opens on illness.
 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sabiha's Day"
      className="sticky bottom-0 z-30 mt-auto border-t border-line/70 bg-paper/95 backdrop-blur-md safe-bottom"
    >
      <ul className="flex items-stretch justify-around px-1 py-1.5">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname?.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2 transition-all',
                  active ? 'bg-sage-100/80 text-sage-800' : 'text-faint hover:text-muted',
                )}
              >
                <span className={cn('text-lg leading-none transition-transform', active && 'scale-110')} aria-hidden>
                  {t.icon}
                </span>
                <span className={cn('font-bn text-[11px]', active ? 'font-semibold' : 'font-normal')}>
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
