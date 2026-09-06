'use client';

import type { ReactNode } from 'react';

/**
 * Phone chrome for the browser preview of Sabiha's Day.
 *
 * On a real phone (`sm:` breakpoint and below) the chrome disappears and the
 * app fills the screen — the exact same markup ships to Expo, so what you see
 * here is what she will see in the APK.
 */
export function DayFrame({ children }: { children: ReactNode }) {
  return (
    <div data-print-flatten className="flex min-h-dvh w-full items-stretch justify-center bg-cream sm:items-center sm:bg-shell sm:p-6">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-paper sm:h-[min(880px,92dvh)] sm:rounded-[2.75rem] sm:border-[9px] sm:border-[#1f1e1c] sm:shadow-lift print:!h-auto print:!max-h-none print:!rounded-none print:!border-0">
        {/* notch — decorative, desktop only */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 z-40 hidden h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#1f1e1c] sm:block"
        />

        {/* scrollable content */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden print:!overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}
