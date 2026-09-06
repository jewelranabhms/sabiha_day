import Link from 'next/link';
import { db } from '@/lib/db';
import { categoryMeta, site } from '@/lib/site';
import { bnDateTime, toBnNum } from '@/lib/format';
import { Badge, EmptyState, PageHeader, Panel, SubmitButton } from '@/components/admin-ui';
import { approveMessage, deleteMessage, rejectMessage, unapproveMessage } from '../../actions';
import type { Message, MessageStatus } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const TABS: { id: MessageStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export default async function AdminMessages({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = (['pending', 'approved', 'rejected'] as const).includes(tab as any)
    ? (tab as MessageStatus)
    : 'pending';

  const all = await db().all('messages');
  const counts = {
    pending: all.filter((m) => m.status === 'pending').length,
    approved: all.filter((m) => m.status === 'approved').length,
    rejected: all.filter((m) => m.status === 'rejected').length,
  };
  const rows = all
    .filter((m) => m.status === active)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <>
      <PageHeader
        title="Message moderation"
        subtitle="কোনো public comment system নেই — প্রতিটি বার্তা এখানে মানুষ পড়ে অনুমোদন করে।"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/messages?tab=${t.id}`}
            className={'chip ' + (active === t.id ? 'chip-active' : '')}
          >
            {t.label}
            <span className="rounded-full bg-white/70 px-1.5 text-[11px] tabular-nums">{toBnNum(counts[t.id])}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState>এই তালিকায় কিছু নেই। 🌿</EmptyState>
      ) : (
        <div className="space-y-4">
          {rows.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </div>
      )}

      <Panel className="mt-8" title="যাচাইয়ের সময় খেয়াল রাখুন">
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            'চিকিৎসা সংক্রান্ত পরামর্শ বা অনুমান থাকলে অনুমোদন করবেন না।',
            'লিংক, ফোন নম্বর বা ঠিকানা থাকলে reject করুন।',
            'অপ্রয়োজনীয়ভাবে কঠিন/ভয় দেখানো কথা এড়িয়ে চলুন।',
            'প্রয়োজনে Approve করার আগে বার্তাটি সামান্য সম্পাদনা করতে পারেন।',
          ].map((t) => (
            <li key={t} className="flex gap-2.5 font-bn text-sm leading-relaxed text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

function MessageRow({ message: m }: { message: Message }) {
  const cat = categoryMeta(m.category);

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="sage">{cat.emoji} {cat.label}</Badge>
        <Badge tone={m.status === 'approved' ? 'sage' : m.status === 'rejected' ? 'blush' : 'honey'}>
          {m.status}
        </Badge>
        <Badge tone={m.anonymous ? 'neutral' : 'honey'}>
          {m.anonymous ? 'Anonymous' : (m.name || '—')}
        </Badge>
        <span className="ml-auto font-bn text-[11px] text-faint">{bnDateTime(m.createdAt)}</span>
      </div>

      <form action={approveMessage} className="mt-4">
        <input type="hidden" name="id" value={m.id} />
        <textarea
          name="message"
          defaultValue={m.message}
          rows={Math.min(6, Math.max(2, Math.ceil(m.message.length / 60)))}
          className="field-area"
          maxLength={600}
        />

        {m.moderatorNote && (
          <p className="mt-2 rounded-xl border border-honey-300 bg-honey-100/50 px-3 py-2 font-bn text-xs text-ink/70">
            ⚠ {m.moderatorNote}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {m.status !== 'approved' && (
            <SubmitButton>✓ Approve</SubmitButton>
          )}
          {m.status !== 'rejected' && (
            <SubmitButton formAction={rejectMessage} variant="danger">
              ✕ Reject
            </SubmitButton>
          )}
          {m.status === 'approved' && (
            <SubmitButton formAction={unapproveMessage} variant="soft">
              ↩ Back to pending
            </SubmitButton>
          )}
          <SubmitButton formAction={deleteMessage} variant="soft" className="ml-auto text-faint">
            🗑 Delete
          </SubmitButton>
        </div>
      </form>

      <p className="mt-3 font-bn text-[11px] text-faint">
        প্রকাশিত হবে: <span className="text-sage-700">ওয়েবসাইটের Message Wall</span> +{' '}
        <span className="text-sage-700">{site.brand.day} অ্যাপের “Messages for You”</span>
      </p>
    </Panel>
  );
}
