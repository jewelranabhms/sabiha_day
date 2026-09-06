import Link from 'next/link';
import { db, isLocal } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { site } from '@/lib/site';
import { toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, AppSectionTitle } from '@/components/app-ui';
import { toggleSetting, deleteMyPrivateData } from '../../actions';
import { lockNow, setPin, signOut } from '../../lock/actions';

export const dynamic = 'force-dynamic';

const NOTIFICATIONS = [
  { key: 'morning',    emoji: '🌸', text: 'আজকের দিনটা শুরু করি?' },
  { key: 'newMessage', emoji: '💌', text: 'আপনার জন্য নতুন একটি বার্তা এসেছে।' },
  { key: 'dua',        emoji: '🤲', text: 'আজকের দোয়া পড়েছেন?' },
  { key: 'victory',    emoji: '🌱', text: 'আজকের little victory লিখবেন?' },
  { key: 'treatment',  emoji: '🏥', text: 'Tomorrow — Chemotherapy', note: 'শুধু অনুমোদিত treatment data থেকে' },
];

const EXPORT_PARTS = [
  { key: 'journal',    label: 'জার্নাল' },
  { key: 'victories',  label: 'ছোট্ট জয়' },
  { key: 'photos',     label: 'ছবি' },
  { key: 'memories',   label: 'স্মৃতি' },
  { key: 'messages',   label: 'আপনার জন্য বার্তা' },
  { key: 'voice',      label: 'ভয়েস ডায়েরি' },
  { key: 'treatment',  label: 'চিকিৎসার তথ্য', sensitive: true },
];

/** APP SCREEN 15 — Settings */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string }>;
}) {
  const session = await getDaySession();
  if (!session) return null;
  const sp = await searchParams;

  const [users, settingsRows, journal, photos, voice] = await Promise.all([
    db().all('app_users'),
    db().all('app_settings'),
    db().all('journal_entries'),
    db().all('photos'),
    db().all('voice_diaries'),
  ]);

  const user = users.find((u) => u.id === session.userId);
  const settings = settingsRows.find((s) => s.userId === session.userId);
  const notif = settings?.notifications ?? {};
  const exp = settings?.exportInclude ?? {};

  const counts = {
    journal: journal.filter((j) => j.userId === session.userId).length,
    photos: photos.filter((p) => p.userId === session.userId).length,
    voice: voice.filter((v) => v.userId === session.userId).length,
  };

  const pinMsg: Record<string, string> = {
    on: '✓ PIN সেট করা হয়েছে। এখন থেকে অ্যাপ খুলতে PIN লাগবে।',
    off: 'PIN সরানো হয়েছে।',
    bad: 'PIN টি ৪–৮ সংখ্যার হতে হবে।',
    mismatch: 'দুইবারের PIN মেলেনি।',
  };

  return (
    <AppScreen>
      <AppHeader title="⚙️ Settings" subtitle="সব নিয়ন্ত্রণ আপনার হাতে।" back="/day/more" />

      {sp.pin && pinMsg[sp.pin] && (
        <div className="mb-5 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 font-bn text-sm text-sage-800">
          {pinMsg[sp.pin]}
        </div>
      )}

      {/* ── profile ── */}
      <AppSectionTitle>Profile</AppSectionTitle>
      <AppCard className="mb-7 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 font-bn text-lg font-semibold text-sage-800">
            {(user?.displayName || 'সা').slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="font-bn text-[15px] font-semibold text-ink">{user?.displayName}</p>
            <p className="font-bn text-xs text-faint">{user?.email}</p>
          </div>
          <span className="ml-auto rounded-full bg-cream px-2.5 py-1 font-bn text-[11px] text-muted">
            {user?.role}
          </span>
        </div>
      </AppCard>

      {/* ── notifications ── */}
      <AppSectionTitle>Notifications</AppSectionTitle>
      <AppCard className="mb-7 p-2">
        <ul className="divide-y divide-line/60">
          {NOTIFICATIONS.map((n) => {
            const on = notif[n.key] !== false; // default on
            return (
              <li key={n.key}>
                <form action={toggleSetting} className="flex items-center gap-3 px-3 py-3">
                  <input type="hidden" name="group" value="notifications" />
                  <input type="hidden" name="key" value={n.key} />
                  <input type="hidden" name="value" value={on ? 'false' : 'true'} />
                  <span aria-hidden className="text-base">{n.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bn text-sm text-ink">{n.text}</span>
                    {n.note && <span className="block font-bn text-[11px] text-faint">{n.note}</span>}
                  </span>
                  <button
                    type="submit"
                    role="switch"
                    aria-checked={on}
                    aria-label={n.text}
                    className={
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
                      (on ? 'bg-sage-500' : 'bg-line')
                    }
                  >
                    <span
                      className={
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ' +
                        (on ? 'left-[22px]' : 'left-0.5')
                      }
                    />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </AppCard>

      {/* ── privacy ── */}
      <AppSectionTitle>Privacy</AppSectionTitle>
      <AppCard className="mb-7">
        <ul className="space-y-2.5">
          {[
            'আপনার জার্নাল, মুড আর ভয়েস ডায়েরি কারও পড়ার অনুমতি নেই — পরিবারেরও না।',
            'ওয়েবসাইটে শুধু অনুমোদিত বার্তা ও প্রকাশিত খবর যায়।',
            'ছবি ও অডিও আলাদা private storage-এ থাকে।',
            'database-এ Row Level Security চালু আছে — এটা অ্যাপের ওপর নির্ভর করে না।',
          ].map((t) => (
            <li key={t} className="flex gap-2.5 font-bn text-sm leading-relaxed text-muted">
              <span aria-hidden className="mt-0.5">🔒</span>
              {t}
            </li>
          ))}
        </ul>
        <Link href="/privacy" className="mt-4 inline-block font-bn text-xs font-medium text-sage-700 underline-offset-4 hover:underline">
          বিস্তারিত privacy নীতি →
        </Link>
      </AppCard>

      {/* ── journal lock ── */}
      <AppSectionTitle>Journal Lock</AppSectionTitle>
      <AppCard className="mb-7" tone={user?.pinHash ? 'sage' : 'cream'}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-bn text-sm font-semibold text-ink">
              {user?.pinHash ? '🔒 PIN চালু আছে' : '🔓 PIN চালু নেই'}
            </p>
            <p className="mt-1 font-bn text-xs leading-relaxed text-muted">
              অ্যাপ খোলার সময় PIN চাওয়া হবে।
            </p>
          </div>
          {user?.pinHash && (
            <form action={lockNow}>
              <button type="submit" className="app-btn-soft">এখনই লক করুন</button>
            </form>
          )}
        </div>

        <form action={setPin} className="mt-4 space-y-3 border-t border-line/70 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <input name="pin" type="password" inputMode="numeric" pattern="\d{4,8}" maxLength={8} className="field font-mono" placeholder="নতুন PIN" />
            <input name="confirm" type="password" inputMode="numeric" pattern="\d{4,8}" maxLength={8} className="field font-mono" placeholder="আবার লিখুন" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="app-btn flex-1">সেট করুন</button>
            {user?.pinHash && (
              <button type="submit" name="remove" value="1" className="app-btn-soft">
                সরান
              </button>
            )}
          </div>
        </form>
      </AppCard>

      {/* ── backup ── */}
      <AppSectionTitle>Backup</AppSectionTitle>
      <AppCard className="mb-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg" aria-hidden>☁️</span>
          <div className="flex-1">
            <p className="font-bn text-sm font-semibold text-ink">
              Automatic cloud sync <span className="text-sage-600">· চালু</span>
            </p>
            <p className="mt-1 font-bn text-xs leading-relaxed text-muted">
              প্রতিটি entry সাথে সাথেই সংরক্ষিত হয়। ফোন বদলালেও কিছু হারাবে না।
            </p>
            <ul className="mt-3 space-y-1.5">
              {[
                ['জার্নাল এন্ট্রি', counts.journal],
                ['ছবি', counts.photos],
                ['ভয়েস ডায়েরি', counts.voice],
              ].map(([label, n]) => (
                <li key={label as string} className="flex items-center justify-between font-bn text-xs text-muted">
                  <span>{label}</span>
                  <span className="tabular-nums text-sage-700">{toBnNum(n as number)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-xl bg-cream px-3 py-2 font-bn text-[11px] text-faint">
              Storage: {isLocal() ? 'local demo store' : 'Supabase (encrypted Postgres + private bucket)'}
            </p>
          </div>
        </div>
      </AppCard>

      {/* ── export ── */}
      <AppSectionTitle>Export My Journal</AppSectionTitle>
      <AppCard className="mb-7" tone="cream">
        <p className="font-bn text-sm leading-relaxed text-muted">
          কোন কোন অংশ বইয়ে যুক্ত হবে, বেছে নিন।
        </p>
        <div className="mt-4 space-y-1">
          {EXPORT_PARTS.map((p) => {
            const on = p.key === 'treatment' || p.key === 'voice' ? exp[p.key] === true : exp[p.key] !== false;
            return (
              <form key={p.key} action={toggleSetting} className="flex items-center gap-3 rounded-2xl px-2 py-2">
                <input type="hidden" name="group" value="exportInclude" />
                <input type="hidden" name="key" value={p.key} />
                <input type="hidden" name="value" value={on ? 'false' : 'true'} />
                <button type="submit" role="switch" aria-checked={on} aria-label={p.label}
                  className={'relative h-5 w-9 shrink-0 rounded-full transition-colors ' + (on ? 'bg-sage-500' : 'bg-line')}>
                  <span className={'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ' + (on ? 'left-[18px]' : 'left-0.5')} />
                </button>
                <span className="flex-1 font-bn text-sm text-ink">{p.label}</span>
                {p.sensitive && (
                  <span className="rounded-full bg-blush-50 px-2 py-0.5 font-bn text-[10px] text-blush-600">
                    সংবেদনশীল
                  </span>
                )}
              </form>
            );
          })}
        </div>

        <div className="mt-5 grid gap-2 border-t border-line/70 pt-4">
          <Link href="/day/book" className="app-btn w-full">📖 Create My Journey Book</Link>
          <Link href="/api/day/export?format=json" className="app-btn-soft w-full">
            ⬇️ Download raw data (JSON)
          </Link>
          <Link href="/api/day/export?format=markdown" className="app-btn-soft w-full">
            ⬇️ Download as Markdown
          </Link>
        </div>
        <p className="mt-3 font-bn text-[11px] leading-relaxed text-faint">
          চিকিৎসার তথ্য ডিফল্টভাবে বইয়ে যুক্ত হয় না — আপনি না চাইলে।
        </p>
      </AppCard>

      {/* ── account ── */}
      <AppSectionTitle>Account</AppSectionTitle>
      <div className="space-y-2.5">
        <form action={signOut}>
          <button type="submit" className="app-btn-soft w-full">↩ Sign out</button>
        </form>

        <details className="rounded-3xl border border-blush-200 bg-blush-50/50 p-4">
          <summary className="cursor-pointer font-bn text-sm font-semibold text-blush-600">
            Delete Account
          </summary>
          <p className="mt-3 font-bn text-xs leading-relaxed text-muted">
            এটি আপনার জার্নাল, মুড, ছবি, ভয়েস আর স্মৃতি — সব মুছে দেবে।
            ফিরিয়ে আনা যাবে না। ওয়েবসাইটের প্রকাশ্য অংশ (বার্তা, খবর) থেকে যাবে।
          </p>
          <form action={deleteMyPrivateData} className="mt-3 space-y-2">
            <input
              name="confirm"
              className="field font-mono text-sm"
              placeholder='নিশ্চিত করতে "DELETE" লিখুন'
              required
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-blush-500 px-4 py-3 font-bn text-sm font-medium text-white transition-colors hover:bg-blush-600"
            >
              স্থায়ীভাবে মুছে ফেলুন
            </button>
          </form>
        </details>
      </div>

      <p className="mt-9 pb-4 text-center font-bn text-[11px] leading-relaxed text-faint">
        🌱 {site.brand.day} · {site.brand.appTagline}
      </p>
    </AppScreen>
  );
}
