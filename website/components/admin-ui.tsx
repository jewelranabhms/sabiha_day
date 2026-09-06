import type { ReactNode } from 'react';
import { cn } from './cn';

/** Shared atoms for the admin dashboard — utilitarian but still warm. */

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-bn text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 font-bn text-sm leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'sage',
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'sage' | 'blush' | 'honey' | 'neutral';
}) {
  const tones = {
    sage: 'border-sage-200 bg-sage-50',
    blush: 'border-blush-200 bg-blush-50',
    honey: 'border-honey-300 bg-honey-100/50',
    neutral: 'border-line/70 bg-white',
  };
  return (
    <div className={cn('rounded-3xl border p-5', tones[tone])}>
      <p className="font-bn text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-bn text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 font-bn text-xs text-faint">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn('rounded-4xl border border-line/70 bg-white p-6 shadow-soft sm:p-7', className)}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-bn text-base font-semibold text-ink">{title}</h2>}
            {description && (
              <p className="mt-1 font-bn text-sm leading-relaxed text-muted">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  name,
  children,
  hint,
  className,
}: {
  label: string;
  name?: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block font-bn text-xs text-faint">{hint}</span>}
      {name && <span className="hidden">{name}</span>}
    </label>
  );
}

export function SubmitButton({
  children,
  variant = 'primary',
  className,
  type = 'submit',
  ...rest
}: {
  children: ReactNode;
  variant?: 'primary' | 'soft' | 'danger';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'app-btn',
    soft: 'app-btn-soft',
    danger:
      'inline-flex items-center justify-center gap-2 rounded-2xl border border-blush-200 bg-blush-50 px-4 py-2.5 font-bn text-sm font-medium text-blush-600 transition-all hover:bg-blush-100 active:scale-[0.98]',
  };
  return (
    <button type={type} className={cn(variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'sage' | 'blush' | 'honey';
}) {
  const tones = {
    neutral: 'bg-cream text-muted',
    sage: 'bg-sage-100 text-sage-800',
    blush: 'bg-blush-100 text-blush-600',
    honey: 'bg-honey-100 text-ink/70',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bn text-[11px] font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-cream/40 p-10 text-center">
      <p className="font-bn text-sm text-muted">{children}</p>
    </div>
  );
}
