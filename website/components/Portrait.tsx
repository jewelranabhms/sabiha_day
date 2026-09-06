'use client';

import { cn } from './cn';

/**
 * Sabiha's portrait.
 *
 * ▸ Replace `website/public/sabiha.jpg` with her real photo and it appears
 *   everywhere on the site automatically.
 * ▸ If the file is missing or fails to load, a calm monogram is shown instead
 *   so the page never looks broken.
 */
export function Portrait({
  src = '/sabiha.jpg',
  alt = 'সাবিহা',
  className,
  size = 'lg',
}: {
  src?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'h-16 w-16 text-lg',
    md: 'h-32 w-32 text-3xl',
    lg: 'h-52 w-52 text-5xl sm:h-64 sm:w-64',
  };

  return (
    <div className={cn('relative', className)}>
      {/* soft halo */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-full bg-gradient-to-br from-sage-100 via-blush-50 to-honey-100 blur-xl opacity-80 animate-breathe"
      />
      <div
        className={cn(
          'relative overflow-hidden rounded-full border-4 border-white bg-cream shadow-lift',
          sizes[size],
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = 'none';
            const fallback = img.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-sage-100 to-blush-100 font-bn font-semibold text-sage-700"
          aria-hidden
        >
          সা
        </div>
      </div>
    </div>
  );
}
