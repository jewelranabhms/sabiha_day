import { db } from '@/lib/db';
import { enDateShort, toBnNum } from '@/lib/format';
import { Badge, EmptyState, PageHeader, Panel, SubmitButton } from '@/components/admin-ui';
import { deleteTreatmentEvent, saveTreatmentEvent } from '../../actions';
import { Timeline } from '@/components/Timeline';
import type { TreatmentEvent } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const TYPES = ['general', 'health', 'treatment', 'chemotherapy', 'important'];
const STATUSES = [
  { id: 'scheduled', label: 'Scheduled · নির্ধারিত' },
  { id: 'ongoing', label: 'Ongoing · চলমান' },
  { id: 'completed', label: 'Completed · সম্পন্ন' },
  { id: 'cancelled', label: 'Cancelled · বাতিল' },
];
const VISIBILITY = [
  { id: 'public', label: 'Public — ওয়েবসাইট + অ্যাপ' },
  { id: 'family', label: 'Family — শুধু পরিবার' },
  { id: 'private', label: 'Private — শুধু সাবিহার অ্যাপ' },
];

export default async function AdminTreatment() {
  const rows = (await db().all('treatment_events')).sort((a, b) =>
    a.eventDate < b.eventDate ? -1 : 1,
  );

  return (
    <>
      <PageHeader
        title="Treatment timeline"
        subtitle="তারিখ ও তথ্য শুধু পরিবার / অনুমোদিত ব্যক্তিই প্রকাশ করবেন।"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Panel title="নতুন event">
          <form action={saveTreatmentEvent} className="space-y-4">
            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Title</span>
              <input name="title" className="field mt-1.5" required maxLength={120} placeholder="First Chemotherapy" />
            </label>

            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Description</span>
              <textarea
                name="description"
                className="field-area mt-1.5 min-h-24"
                maxLength={1200}
                placeholder="আজ সাবিহার প্রথম chemotherapy দেওয়ার সিদ্ধান্ত নেওয়া হয়েছে।"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Date</span>
                <input name="eventDate" type="date" className="field mt-1.5" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </label>

              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Type</span>
                <select name="eventType" className="field mt-1.5" defaultValue="treatment">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Status</span>
                <select name="status" className="field mt-1.5" defaultValue="scheduled">
                  {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Visibility</span>
                <select name="visibility" className="field mt-1.5" defaultValue="public">
                  {VISIBILITY.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </label>
            </div>

            <p className="rounded-2xl border border-honey-300 bg-honey-100/50 px-4 py-3 font-bn text-xs leading-relaxed text-ink/70">
              ⚠️ অ্যাপ নিজে কোনো medical recommendation দেয় না। ডাক্তারের নির্দেশনা থাকলে সেটা
              <strong> private</strong> visibility দিয়ে যোগ করুন — তা শুধু সাবিহার অ্যাপে দেখা যাবে।
            </p>

            <SubmitButton className="w-full">যোগ করুন</SubmitButton>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="Preview — public timeline" description="ওয়েবসাইটে ঠিক এভাবেই দেখাবে।">
            <Timeline events={rows.filter((e) => e.visibility === 'public')} compact />
            {!rows.some((e) => e.visibility === 'public') && <EmptyState>কোনো public event নেই।</EmptyState>}
          </Panel>

          <Panel title={`সব event (${toBnNum(rows.length)})`}>
            {rows.length === 0 ? (
              <EmptyState>এখনো কোনো event নেই।</EmptyState>
            ) : (
              <ul className="space-y-3">
                {rows.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function EventRow({ event: e }: { event: TreatmentEvent }) {
  return (
    <li className="rounded-3xl border border-line/70 bg-cream/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{enDateShort(e.eventDate)}</Badge>
        <Badge tone="sage">{e.eventType}</Badge>
        <Badge tone={e.status === 'completed' ? 'sage' : 'honey'}>{e.status}</Badge>
        <Badge tone={e.visibility === 'public' ? 'sage' : 'blush'}>🔒 {e.visibility}</Badge>
      </div>
      <p className="mt-2.5 font-bn text-sm font-semibold text-ink">{e.title}</p>
      {e.description && <p className="mt-1 font-bn text-sm leading-relaxed text-muted">{e.description}</p>}

      <form action={deleteTreatmentEvent} className="mt-3">
        <input type="hidden" name="id" value={e.id} />
        <SubmitButton variant="soft" className="text-faint">🗑 Delete</SubmitButton>
      </form>
    </li>
  );
}
