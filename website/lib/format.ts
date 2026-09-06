/**
 * Date / text helpers. Everything user-facing is rendered in Bangla.
 */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBnNum = (input: string | number) =>
  String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

export function parseDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  // 'yyyy-mm-dd' must not shift by timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(input);
}

const bnFmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('bn-BD', { ...opts, numberingSystem: 'beng' });

export const bnDateLong = (input: string | Date) =>
  bnFmt({ day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(input));

export const bnDateShort = (input: string | Date) =>
  bnFmt({ day: 'numeric', month: 'short' }).format(parseDate(input));

export const bnDateWithWeekday = (input: string | Date) =>
  bnFmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(parseDate(input));

export const bnMonthYear = (input: string | Date) =>
  bnFmt({ month: 'long', year: 'numeric' }).format(parseDate(input));

export const bnTime = (input: string | Date) =>
  bnFmt({ hour: 'numeric', minute: '2-digit', hour12: true }).format(parseDate(input));

export const bnDateTime = (input: string | Date) =>
  `${bnDateShort(input)}, ${bnTime(input)}`;

export const enDateShort = (input: string | Date) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    parseDate(input),
  );

export function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function relativeDayBn(input: string | Date) {
  const d = parseDate(input);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return 'আজ';
  if (diff === -1) return 'গতকাল';
  if (diff === 1) return 'আগামীকাল';
  if (diff > 1) return `${toBnNum(diff)} দিন পরে`;
  return `${toBnNum(Math.abs(diff))} দিন আগে`;
}

export function greetingBn(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'শুভ রাত';
  if (h < 12) return 'সুপ্রভাত';
  if (h < 16) return 'শুভ দুপুর';
  if (h < 19) return 'শুভ বিকাল';
  return 'শুভ সন্ধ্যা';
}

export function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n).trimEnd() + '…';
}

/** Groups rows by yyyy-mm and returns [monthKey, rows][], newest first. */
export function groupByMonth<T>(rows: T[], dateOf: (r: T) => string) {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const d = parseDate(dateOf(r));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}
