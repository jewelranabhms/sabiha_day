import { db } from '@/lib/db';
import { fundSummary } from '@/lib/queries';
import { currency } from '@/lib/site';
import { bnDateTime, toBnNum } from '@/lib/format';
import { Badge, EmptyState, PageHeader, Panel, StatCard, SubmitButton } from '@/components/admin-ui';
import { deleteDonation, setFundGoal, verifyDonation } from '../../actions';
import type { Donation } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export default async function AdminDonations() {
  const [rows, fund] = await Promise.all([db().all('donations'), fundSummary()]);
  const sorted = [...rows].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const verified = sorted.filter((d) => d.verified);
  const unverified = sorted.filter((d) => !d.verified);

  return (
    <>
      <PageHeader
        title="Donations"
        subtitle="সব donation ম্যানুয়ালি যাচাই করা হয়। যাচাই ছাড়া কোনো টাকা public মোট-এ যোগ হয় না।"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Received" value={currency(fund.received)} hint="verified" tone="sage" />
        <StatCard label="Target" value={currency(fund.target)} hint={`${toBnNum(fund.percent)}% পৌঁছেছে`} tone="honey" />
        <StatCard label="Unverified" value={toBnNum(unverified.length)} hint="যাচাই বাকি" tone={unverified.length ? 'blush' : 'neutral'} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {unverified.length > 0 && (
            <Panel title={`যাচাই বাকি (${toBnNum(unverified.length)})`}>
              <ul className="space-y-3">
                {unverified.map((d) => <DonationRow key={d.id} donation={d} />)}
              </ul>
            </Panel>
          )}

          <Panel title={`যাচাইকৃত (${toBnNum(verified.length)})`}>
            {verified.length === 0 ? (
              <EmptyState>এখনো কোনো যাচাইকৃত donation নেই।</EmptyState>
            ) : (
              <ul className="space-y-3">
                {verified.map((d) => <DonationRow key={d.id} donation={d} />)}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Fund target">
            <form action={setFundGoal} className="space-y-4">
              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Label</span>
                <input name="label" className="field mt-1.5" defaultValue={fund.label} maxLength={40} />
              </label>
              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Target (৳)</span>
                <input name="target" type="number" min="0" className="field mt-1.5" defaultValue={fund.target} required />
              </label>
              <SubmitButton className="w-full">সংরক্ষণ</SubmitButton>
            </form>
          </Panel>

          <Panel title="🔐 Security">
            <ul className="space-y-2.5">
              {[
                'Payment PIN, password বা OTP কখনো database-এ সংরক্ষণ করা হয় না।',
                'এই সিস্টেম কোনো payment gateway-এর সঙ্গে যুক্ত নয় — সব ম্যানুয়াল।',
                'Donor-এর নাম চাইলে প্রকাশ নাও করা হতে পারে।',
              ].map((t) => (
                <li key={t} className="flex gap-2.5 font-bn text-sm leading-relaxed text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function DonationRow({ donation: d }: { donation: Donation }) {
  return (
    <li className="rounded-3xl border border-line/70 bg-cream/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bn text-base font-semibold tabular-nums text-sage-800">{currency(d.amount)}</span>
        <Badge tone="neutral">{d.method}</Badge>
        <Badge tone={d.verified ? 'sage' : 'honey'}>{d.verified ? '✓ verified' : 'pending'}</Badge>
        <span className="ml-auto font-bn text-[11px] text-faint">{bnDateTime(d.createdAt)}</span>
      </div>

      <p className="mt-2 font-bn text-sm text-ink">{d.donorName || 'নাম প্রকাশে অনিচ্ছুক'}</p>
      {d.transactionReference && (
        <p className="mt-1 font-mono text-xs text-muted">TrxID: {d.transactionReference}</p>
      )}
      {d.note && <p className="mt-1 font-bn text-xs text-faint">{d.note}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <form action={verifyDonation}>
          <input type="hidden" name="id" value={d.id} />
          <SubmitButton variant={d.verified ? 'soft' : 'primary'}>
            {d.verified ? '↩ Unverify' : '✓ Verify'}
          </SubmitButton>
        </form>
        <form action={deleteDonation}>
          <input type="hidden" name="id" value={d.id} />
          <SubmitButton variant="soft" className="text-faint">🗑</SubmitButton>
        </form>
      </div>
    </li>
  );
}
