import Link from 'next/link';
import { db, isLocal } from '@/lib/db';
import { getProfile } from '@/lib/queries';
import { site } from '@/lib/site';
import { Badge, PageHeader, Panel, SubmitButton } from '@/components/admin-ui';
import { saveProfile } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AdminSettings() {
  const [profile, messages, updates, events, donations, journal] = await Promise.all([
    getProfile(),
    db().all('messages'),
    db().all('updates'),
    db().all('treatment_events'),
    db().all('donations'),
    db().all('journal_entries'),
  ]);

  return (
    <>
      <PageHeader title="Settings" subtitle="প্রোফাইল, সিস্টেমের অবস্থা আর ব্যাকআপ।" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Public profile" description="এই তথ্যই ওয়েবসাইটে দেখা যায়। মেডিকেল বিস্তারিত এখানে লিখবেন না।">
          <form action={saveProfile} className="space-y-4">
            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Name</span>
              <input name="name" className="field mt-1.5" defaultValue={profile?.name ?? site.profile.name} maxLength={60} />
            </label>

            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Photo URL</span>
              <input
                name="photoUrl"
                className="field mt-1.5 font-mono text-sm"
                defaultValue={profile?.photoUrl ?? site.profile.photo}
                placeholder="/sabiha.jpg"
              />
              <span className="mt-1 block font-bn text-xs text-faint">
                সহজ উপায়: ছবিটি <code className="font-mono">website/public/sabiha.jpg</code> নামে রেখে দিন।
              </span>
            </label>

            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Headline</span>
              <textarea name="headline" className="field-area mt-1.5 min-h-20" defaultValue={profile?.headline ?? site.profile.headline} maxLength={300} />
            </label>

            <label className="block">
              <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Bio</span>
              <textarea name="bio" className="field-area mt-1.5 min-h-24" defaultValue={profile?.bio ?? site.profile.bio} maxLength={800} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">College</span>
                <input name="college" className="field mt-1.5" defaultValue={profile?.college ?? ''} maxLength={140} />
              </label>
              <label className="block">
                <span className="font-bn text-xs font-semibold uppercase tracking-[0.14em] text-faint">Batch</span>
                <input name="batch" className="field mt-1.5" defaultValue={profile?.batch ?? ''} maxLength={20} />
              </label>
            </div>

            <SubmitButton className="w-full">সংরক্ষণ করুন</SubmitButton>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="System status">
            <dl className="space-y-3">
              <Row k="Data source" v={<Badge tone={isLocal() ? 'honey' : 'sage'}>{isLocal() ? 'local (JSON file)' : 'Supabase / Postgres'}</Badge>} />
              <Row k="Environment" v={<Badge tone="neutral">{process.env.NODE_ENV}</Badge>} />
              <Row k="Messages" v={<span className="font-bn text-sm tabular-nums">{messages.length}</span>} />
              <Row k="Updates" v={<span className="font-bn text-sm tabular-nums">{updates.length}</span>} />
              <Row k="Treatment events" v={<span className="font-bn text-sm tabular-nums">{events.length}</span>} />
              <Row k="Donation reports" v={<span className="font-bn text-sm tabular-nums">{donations.length}</span>} />
              <Row k="Journal entries" v={<span className="font-bn text-sm tabular-nums">{journal.length}</span>} />
            </dl>

            {isLocal() && (
              <p className="mt-5 rounded-2xl border border-honey-300 bg-honey-100/50 px-4 py-3 font-bn text-xs leading-relaxed text-ink/70">
                এখন <strong>local demo mode</strong>-এ চলছে — ডেটা <code className="font-mono">website/data/db.json</code> ফাইলে থাকে।
                production-এ যেতে <code className="font-mono">database/schema.sql</code> ও{' '}
                <code className="font-mono">policies.sql</code> Supabase-এ চালিয়ে{' '}
                <code className="font-mono">DATA_SOURCE=supabase</code> সেট করুন। কোড বদলাতে হবে না।
              </p>
            )}
          </Panel>

          <Panel title="Donation numbers" description="website/lib/site.ts ফাইলে আছে।">
            <ul className="space-y-2">
              {site.donation.channels.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-2xl border border-line/70 bg-cream/40 px-4 py-2.5">
                  <span className="font-bn text-sm text-ink">{c.label}</span>
                  <span className="font-mono text-sm text-sage-800">{c.number}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-bn text-xs leading-relaxed text-faint">
              আসল নম্বর বসাতে <code className="font-mono">website/lib/site.ts</code> →{' '}
              <code className="font-mono">donation.channels</code> সম্পাদনা করুন। PIN/password কোথাও লিখবেন না।
            </p>
          </Panel>

          <Panel title="Links">
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="chip">🌸 Website</Link>
              <Link href="/day" className="chip">🌱 Sabiha&apos;s Day</Link>
              <Link href="/privacy" className="chip">🔒 Privacy</Link>
              <Link href="/database" className="chip">🗄 Data</Link>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/50 pb-2.5 last:border-0 last:pb-0">
      <dt className="font-bn text-sm text-muted">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
