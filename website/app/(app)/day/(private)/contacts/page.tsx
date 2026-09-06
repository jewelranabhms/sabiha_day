import { db } from '@/lib/db';
import { getDaySession } from '@/lib/auth';
import { toBnNum } from '@/lib/format';
import { AppScreen, AppCard, AppHeader, LockBadge } from '@/components/app-ui';
import { addContact, removeRow } from '../../actions';

export const dynamic = 'force-dynamic';

const GROUP_EMOJI: Record<string, string> = {
  family: '👨‍👩‍👧', doctor: '👨‍⚕️', hospital: '🏥', 'trusted person': '🤝',
};

/**
 * APP SCREEN 13 — Important Contacts
 *
 * One-tap calling. Deliberately NOT an emergency medical advice screen:
 * if it is an emergency, she should call — not read.
 */
export default async function ContactsPage() {
  const session = await getDaySession();
  if (!session) return null;

  const rows = (await db().all('contacts'))
    .filter((c) => c.userId === session.userId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AppScreen>
      <AppHeader
        title="☎️ জরুরি যোগাযোগ"
        subtitle="এক ট্যাপে কল করার জন্য।"
        back="/day/more"
        right={<LockBadge />}
      />

      {rows.length === 0 ? (
        <AppCard tone="cream" className="mb-7">
          <p className="font-bn text-sm leading-relaxed text-muted">
            এখনো কোনো নম্বর যোগ করা হয়নি।
          </p>
        </AppCard>
      ) : (
        <ul className="mb-7 space-y-2.5">
          {rows.map((c) => {
            const emoji = GROUP_EMOJI[(c.relationship || '').toLowerCase()] ?? '📞';
            return (
              <li key={c.id}>
                <AppCard className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-lg" aria-hidden>
                      {emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bn text-[15px] font-semibold text-ink">{c.name}</p>
                      <p className="font-bn text-xs text-faint">
                        {c.relationship || '—'}
                        {c.phone && <span className="ml-2 font-mono">{toBnNum(c.phone)}</span>}
                      </p>
                    </div>

                    {c.phone ? (
                      <a
                        href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}
                        className="shrink-0 rounded-2xl bg-sage-600 px-4 py-2.5 font-bn text-sm font-medium text-white transition-all active:scale-95"
                      >
                        Call
                      </a>
                    ) : (
                      <span className="shrink-0 font-bn text-xs text-faint">নম্বর নেই</span>
                    )}

                    <form action={removeRow}>
                      <input type="hidden" name="table" value="contacts" />
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" aria-label="মুছুন" className="ml-1 font-bn text-xs text-faint hover:text-blush-600">
                        ✕
                      </button>
                    </form>
                  </div>
                </AppCard>
              </li>
            );
          })}
        </ul>
      )}

      <AppCard tone="cream" className="mb-7">
        <form action={addContact} className="space-y-3">
          <p className="font-bn text-sm font-semibold text-ink">নতুন নম্বর যোগ করুন</p>
          <input name="name" className="field" required maxLength={60} placeholder="নাম" />
          <div className="grid grid-cols-2 gap-3">
            <select name="relationship" className="field" defaultValue="Family">
              {['Family', 'Doctor', 'Hospital', 'Trusted person'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <input name="phone" className="field font-mono" maxLength={24} placeholder="01XXXXXXXXX" />
          </div>
          <button type="submit" className="app-btn w-full">+ যোগ করুন</button>
        </form>
      </AppCard>

      <div className="rounded-3xl border border-honey-300 bg-honey-100/50 p-5">
        <p className="font-bn text-sm font-semibold text-ink">⚠️ একটি কথা</p>
        <p className="mt-2 font-bn text-sm leading-relaxed text-muted">
          এই পাতাটি কোনো emergency medical advice দেয় না। শারীরিক অবস্থা হঠাৎ খারাপ হলে
          দেরি না করে সরাসরি ডাক্তার বা হাসপাতালে কল করুন — অথবা জরুরি সেবা নম্বরে
          (<span className="font-mono">৯৯৯</span>) যোগাযোগ করুন।
        </p>
      </div>

      <p className="mt-8 pb-4 text-center font-bn text-[11px] text-faint">🔒 Private</p>
    </AppScreen>
  );
}
