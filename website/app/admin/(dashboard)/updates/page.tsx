import { db } from '@/lib/db';
import { bnDateTime, toBnNum } from '@/lib/format';
import { Badge, EmptyState, PageHeader, Panel, SubmitButton } from '@/components/admin-ui';
import { deleteUpdate, saveUpdate, toggleUpdatePublished } from '../../actions';
import type { Update } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const TYPES = [
  { id: 'general', label: 'সাধারণ' },
  { id: 'health', label: 'স্বাস্থ্য' },
  { id: 'treatment', label: 'চিকিৎসা' },
  { id: 'chemotherapy', label: 'Chemotherapy' },
  { id: 'important', label: 'গুরুত্বপূর্ণ' },
];

export default async function AdminUpdates() {
  const rows = (await db().all('updates')).sort((a, b) =>
    ((a.publishedAt ?? a.createdAt) < (b.publishedAt ?? b.createdAt) ? 1 : -1),
  );

  return (
    <>
      <PageHeader
        title="Updates"
        subtitle="এখানে একবার লিখলেই — website-এর “Latest Update”, অ্যাপের timeline, আর (চাইলে) notification।"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="নতুন update" description="medical speculation নয় — শুধু যা পরিবার প্রকাশ করতে চায়।">
          <form action={saveUpdate} className="space-y-4">
            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Title</span>
              <input name="title" className="field mt-1.5" required maxLength={80} placeholder="Today's Update" />
            </label>

            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Content</span>
              <textarea
                name="content"
                className="field-area mt-1.5 min-h-28"
                required
                maxLength={1200}
                placeholder="আজ সাবিহার শারীরিক অবস্থা মোটামুটি স্থিতিশীল…"
              />
            </label>

            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Type</span>
              <select name="updateType" className="field mt-1.5" defaultValue="general">
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-line bg-cream/40 px-4 py-3">
              <input type="checkbox" name="notifyApp" value="true" className="h-4 w-4 accent-sage-600" />
              <span className="font-bn text-sm text-muted">অ্যাপে notification পাঠান</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-line bg-cream/40 px-4 py-3">
              <input type="checkbox" name="published" value="true" defaultChecked className="h-4 w-4 accent-sage-600" />
              <span className="font-bn text-sm text-muted">এখনই প্রকাশ করুন</span>
            </label>

            <SubmitButton className="w-full">প্রকাশ করুন</SubmitButton>
          </form>
        </Panel>

        <div>
          <h2 className="mb-4 font-bn text-base font-semibold text-ink">
            প্রকাশিত ও খসড়া ({toBnNum(rows.length)})
          </h2>
          {rows.length === 0 ? (
            <EmptyState>এখনো কোনো update নেই।</EmptyState>
          ) : (
            <div className="space-y-4">
              {rows.map((u) => (
                <UpdateRow key={u.id} update={u} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function UpdateRow({ update: u }: { update: Update }) {
  const type = TYPES.find((t) => t.id === u.updateType)?.label ?? u.updateType;
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="sage">{type}</Badge>
        <Badge tone={u.published ? 'sage' : 'honey'}>{u.published ? 'published' : 'draft'}</Badge>
        {u.notifyApp && <Badge tone="blush">🔔 notify</Badge>}
        <span className="ml-auto font-bn text-[11px] text-faint">
          {bnDateTime(u.publishedAt ?? u.createdAt)}
        </span>
      </div>

      <h3 className="mt-3 font-bn text-base font-semibold text-ink">{u.title}</h3>
      <p className="mt-1.5 font-bn text-sm leading-relaxed text-muted">{u.content}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={toggleUpdatePublished} className="contents">
          <input type="hidden" name="id" value={u.id} />
          <SubmitButton variant="soft">{u.published ? '↧ Unpublish' : '↥ Publish'}</SubmitButton>
        </form>
        <form action={deleteUpdate} className="contents">
          <input type="hidden" name="id" value={u.id} />
          <SubmitButton variant="soft" className="text-faint">🗑 Delete</SubmitButton>
        </form>
      </div>
    </Panel>
  );
}
