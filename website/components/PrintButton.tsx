'use client';

/** Opens the browser print dialog — used by "Create My Journey Book". */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        'rounded-full bg-sage-600 px-4 py-2 font-bn text-xs font-medium text-white shadow-soft transition-colors hover:bg-sage-700'
      }
    >
      🖨 Print / Save as PDF
    </button>
  );
}
