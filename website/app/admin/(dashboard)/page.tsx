import Link from 'next/link';
import { adminStats, pendingMessages } from '@/lib/queries';
import { categoryMeta, currency } from '@/lib/site';
import { bnDateTime, toBnNum } from '@/lib/format';
import { Badge, EmptyState, Panel, PageHeader, StatCard } from '@/components/admin-ui';
import { approveMessage, rejectMessage } from '../actions';
import type { Message } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [stats, pending] = await Promise.all([adminStats(), pendingMessages()]);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="এক নজরে পুরো সিস্টেমের অবস্থা।">
        <Link href="/" className="chip">🌸 ওয়েবসাইট দেখুন</Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Messages" value={toBnNum(stats.messages)} hint="approved" tone="sage" />
        <StatCard
          label="Pending"
          value={toBnNum(stats.pending)}
          hint={stats.pending > 0 ? 'যাচাই বাকি' : 'সব যাচাই শেষ'}
          tone={stats.pending > 0 ? 'blush' : 'neutral'}
        />
        <StatCard label="Updates" value={toBnNum(stats.updates)} hint="published" tone="neutral" />
        <StatCard label="Donations" value={currency(stats.donations)} hint="verified only" tone="honey" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Moderation queue"
          description="অনুমোদন করলে বার্তাটি সাথে সাথেই ওয়েবসাইট এবং সাবিহার অ্যাপ — দুই জায়গাতেই চলে যাবে।"
          action={<Link href="/admin/messages" className="chip">সব দেখুন →</Link>}
        >
          {pending.length === 0 ? (
            <EmptyState>কোনো বার্তা অপেক্ষমাণ নেই। 🌿</EmptyState>
          ) : (
            <ul className="space-y-4">
              {pending.slice(0, 4).map((m) => (
                <PendingRow key={m.id} message={m} />
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Quick actions">
            <div className="flex flex-col gap-2">
              {[
                { href: '/admin/messages', label: '💌 বার্তা যাচাই করুন', hint: `${toBnNum(stats.pending)} pending` },
                { href: '/admin/updates', label: '🌿 নতুন update প্রকাশ করুন', hint: 'website + app' },
                { href: '/admin/treatment', label: '🌱 treatment timeline', hint: `${toBnNum(stats.events)} events` },
                { href: '/admin/donations', label: '❤️ donation যাচাই', hint: `${toBnNum(stats.unverifiedDonations)} unverified` },
                { href: '/admin/settings', label: '⚙ প্রোফাইল ও fund target', hint: '' },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-cream/40 px-4 py-3 transition-colors hover:border-sage-300 hover:bg-sage-50"
                >
                  <span className="font-bn text-sm text-ink">{a.label}</span>
                  {a.hint && <span className="shrink-0 font-bn text-[11px] text-faint">{a.hint}</span>}
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="🔒 Privacy reminder">
            <p className="font-bn text-sm leading-relaxed text-muted">
              এই dashboard থেকে সাবিহার জার্নাল, মুড, ভয়েস ডায়েরি বা ব্যক্তিগত ছবি
              <strong className="text-ink"> পড়া যায় না</strong> — ইচ্ছাকৃতভাবে। সেগুলো শুধু তার নিজের অ্যাপে থাকে।
            </p>
            <Link
              href="/admin/journal"
              className="mt-4 inline-block font-bn text-sm font-medium text-sage-700 underline-offset-4 hover:underline"
            >
              কেন? →
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}

function PendingRow({ message: m }: { message: Message }) {
  const cat = categoryMeta(m.category);
  return (
    <li className="rounded-3xl border border-line/70 bg-cream/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="sage">{cat.emoji} {cat.label}</Badge>
        <Badge tone={m.anonymous ? 'neutral' : 'honey'}>
          {m.anonymous ? 'Anonymous' : (m.name || '—')}
        </Badge>
        <span className="ml-auto font-bn text-[11px] text-faint">{bnDateTime(m.createdAt)}</span>
      </div>

      <p className="mt-3 font-bn text-sm leading-relaxed text-ink">“{m.message}”</p>

      {m.moderatorNote && (
        <p className="mt-2 rounded-xl border border-honey-300 bg-honey-100/50 px-3 py-2 font-bn text-xs text-ink/70">
          ⚠ {m.moderatorNote}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={approveMessage}>
          <input type="hidden" name="id" value={m.id} />
          <button
            type="submit"
            className="rounded-full bg-sage-600 px-4 py-1.5 font-bn text-xs font-medium text-white transition-colors hover:bg-sage-700"
          >
            Approve
          </button>
        </form>
        <form action={rejectMessage}>
          <input type="hidden" name="id" value={m.id} />
          <button
            type="submit"
            className="rounded-full border border-blush-200 bg-blush-50 px-4 py-1.5 font-bn text-xs font-medium text-blush-600 transition-colors hover:bg-blush-100"
          >
            Reject
          </button>
        </form>
      </div>
    </li>
  );
}
