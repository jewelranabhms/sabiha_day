import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from './cn';

/** Screen wrapper for one app page. */
export function AppScreen({
  children,
  className,
  scroll = true,
}: {
  children: ReactNode;
  className?: string;
  scroll?: boolean;
}) {
  return (
    <div className={cn('flex-1 px-4 py-5 sm:px-5', scroll && 'animate-fade-up', className)}>
      {children}
    </div>
  );
}

export function AppHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {back && (
          <Link
            href={back}
            className="mb-1 inline-flex items-center gap-1 font-bn text-xs text-faint transition-colors hover:text-sage-700"
          >
            ← ফিরে যান
          </Link>
        )}
        <h1 className="font-bn text-xl font-semibold leading-snug text-ink sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 font-bn text-sm leading-relaxed text-muted">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0 pt-1">{right}</div>}
    </div>
  );
}

export function AppCard({
  children,
  className,
  tone = 'white',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'white' | 'cream' | 'sage' | 'blush';
}) {
  const tones = {
    white: 'border-line/80 bg-white',
    cream: 'border-line/70 bg-cream',
    sage: 'border-sage-200 bg-sage-50',
    blush: 'border-blush-200 bg-blush-50',
  };
  return (
    <div className={cn('rounded-3xl border p-5 shadow-soft', tones[tone], className)}>
      {children}
    </div>
  );
}

export function AppSectionTitle({
  children,
  href,
  hrefLabel,
  className,
}: {
  children: ReactNode;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="font-bn text-sm font-semibold uppercase tracking-[0.12em] text-faint">
        {children}
      </h2>
      {href && (
        <Link href={href} className="shrink-0 font-bn text-xs font-medium text-sage-700 hover:underline">
          {hrefLabel || 'সব দেখুন'} →
        </Link>
      )}
    </div>
  );
}

export function SoftDivider() {
  return <div className="my-5 h-px w-full bg-line/70" />;
}

export function LockBadge({ label = 'Private' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blush-50 px-2.5 py-1 font-bn text-[11px] font-medium text-blush-600">
      🔒 {label}
    </span>
  );
}
