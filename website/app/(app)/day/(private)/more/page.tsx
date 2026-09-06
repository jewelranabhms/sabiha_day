import Link from 'next/link';
import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { AppScreen, AppHeader, LockBadge } from '@/components/app-ui';

export const dynamic = 'force-dynamic';

const LINKS: {
  href: string; emoji: string; title: string; desc: string; tone?: string;
}[] = [
  { href: '/day/prayer',    emoji: '🕌', title: 'নামাজ',            desc: 'আজকের নামাজ — কোনো streak নেই' },
  { href: '/day/treatment', emoji: '🏥', title: 'আমার চিকিৎসা',      desc: 'timeline, appointment, ডাক্তারের নোট' },
  { href: '/day/visitors',  emoji: '🫂', title: 'আজ কে এসেছিল?',    desc: 'যারা পাশে ছিলেন' },
  { href: '/day/victories', emoji: '🌱', title: 'ছোট্ট জয়',         desc: 'আজ যা ঠিকঠাক ছিল' },
  { href: '/day/people',    emoji: '💫', title: 'মানুষ ও স্মৃতি',     desc: 'Family · Friends · Teachers' },
  { href: '/day/photos',    emoji: '📷', title: 'আমার ছবি',           desc: 'ব্যক্তিগত অ্যালবাম' },
  { href: '/day/voice',     emoji: '🎙️', title: 'ভয়েস ডায়েরি',        desc: 'লিখতে ইচ্ছে না করলে বলুন' },
  { href: '/day/contacts',  emoji: '☎️', title: 'জরুরি যোগাযোগ',      desc: 'পরিবার · ডাক্তার · হাসপাতাল' },
  { href: '/day/journey',   emoji: '🌸', title: 'আমার journey',       desc: 'সব এক সুতোয়' },
  { href: '/day/book',      emoji: '📖', title: 'Journey Book',      desc: 'একটা বই বানান' },
  { href: '/day/settings',  emoji: '⚙️', title: 'Settings',          desc: 'profile · lock · backup' },
];

/** The "more" tab — every room in the app, in one quiet grid. */
export default async function MorePage() {
  const session = await getDaySession();
  if (!session) return null;

  const counts = await Promise.all([
    db().all('journal_entries'),
    db().all('little_victories'),
    db().all('visitors'),
    db().all('memories'),
    db().all('photos'),
    db().all('voice_diaries'),
  ]);
  const mine = (rows: { userId: string }[]) => rows.filter((r) => r.userId === session.userId).length;
  const badge: Record<string, number> = {
    '/day/victories': mine(counts[1]),
    '/day/visitors': mine(counts[2]),
    '/day/people': mine(counts[3]),
    '/day/photos': mine(counts[4]),
    '/day/voice': mine(counts[5]),
    '/day/journal': mine(counts[0]),
  };

  return (
    <AppScreen>
      <AppHeader
        title="⋯ সব ঘর"
        subtitle="যেখানে খুশি ঢুকুন। সবকিছু আপনার নিজের।"
        back="/day"
        right={<LockBadge />}
      />

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-start gap-3 rounded-3xl border border-line/70 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-sage-300 hover:shadow-lift"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cream text-lg" aria-hidden>
                {l.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-bn text-sm font-semibold text-ink">{l.title}</span>
                  {!!badge[l.href] && (
                    <span className="rounded-full bg-sage-100 px-1.5 py-0.5 font-bn text-[10px] text-sage-800">
                      {badge[l.href]}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block font-bn text-[11px] leading-snug text-faint">{l.desc}</span>
              </span>
              <span className="mt-1 shrink-0 text-faint" aria-hidden>›</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-3xl border border-sage-200 bg-sage-50 p-5">
        <p className="font-bn text-sm leading-relaxed text-sage-900/80">
          এই অ্যাপটা কোনো medical app নয়। এটা একটা <strong>সঙ্গী</strong> —
          একটা জার্নাল, একটা স্মৃতির খাতা, আর একটা জায়গা যেখানে আপনি রোগী নন,
          শুধুই আপনি।
        </p>
      </div>
    </AppScreen>
  );
}
