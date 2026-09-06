/**
 * Shared UI atoms for the public site.
 * Design language: minimal + warm + dignified. No sensational imagery.
 */
import type { ReactNode } from 'react';
import { cn } from './cn';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-3xl px-5 sm:px-8', className)}>{children}</div>;
}

export function WideContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
  tone = 'paper',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'paper' | 'cream' | 'white' | 'sage';
}) {
  const tones = {
    paper: 'bg-paper',
    cream: 'bg-cream',
    white: 'bg-white',
    sage: 'bg-sage-50',
  };
  return (
    <section id={id} className={cn('py-16 sm:py-24', tones[tone], className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'font-bn text-xs font-semibold uppercase tracking-[0.22em] text-sage-600',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Heading({
  children,
  className,
  as: Tag = 'h2',
}: {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <Tag
      className={cn(
        'font-bn text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-bn text-base leading-relaxed text-muted sm:text-lg', className)}>
      {children}
    </p>
  );
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'blush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function Button({
  children, href, variant = 'primary', size = 'md', className, ...rest
}: ButtonProps) {
  const variants = {
    primary: 'bg-sage-600 text-white hover:bg-sage-700 shadow-soft',
    blush: 'bg-blush-500 text-white hover:bg-blush-600 shadow-soft',
    secondary: 'bg-white text-ink border border-line hover:border-sage-300 hover:bg-sage-50',
    ghost: 'text-sage-700 hover:bg-sage-50',
  };
  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-bn font-medium',
    'transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500',
    variants[variant], sizes[size], className,
  );
  if (href) {
    return <a href={href} className={cls}>{children}</a>;
  }
  return <button className={cls} {...rest}>{children}</button>;
}

export function Card({
  children, className, tone = 'white',
}: { children: ReactNode; className?: string; tone?: 'white' | 'cream' }) {
  return (
    <div
      className={cn(
        'rounded-4xl border border-line/70 p-6 shadow-soft sm:p-8',
        tone === 'white' ? 'bg-white' : 'bg-cream',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-line', className)} />;
}

/** A soft, hand-drawn feeling separator — used instead of harsh rules. */
export function Leaf({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 text-sage-300', className)}>
      <span className="h-px w-10 bg-current opacity-50" />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21c0-6 3-10 8-12-1 7-4 10-8 12Zm0 0c0-6-3-10-8-12 1 7 4 10 8 12Z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
        />
      </svg>
      <span className="h-px w-10 bg-current opacity-50" />
    </div>
  );
}
