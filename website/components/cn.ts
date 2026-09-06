/** Tiny class-name joiner (no runtime dependency). */
export type ClassValue = string | number | null | undefined | false | Record<string, unknown>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
    } else if (typeof input === 'object') {
      for (const [k, v] of Object.entries(input)) {
        if (v) out.push(k);
      }
    }
  }
  return out.join(' ');
}
