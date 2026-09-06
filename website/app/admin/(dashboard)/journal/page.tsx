import Link from 'next/link';
import { PageHeader, Panel } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';

/**
 * This page exists to say "no".
 *
 * The admin dashboard deliberately has NO access to Sabiha's journal, mood,
 * voice diary, private photos or memories. Not because it is unfinished —
 * because it must never be finished. Row Level Security in
 * `database/policies.sql` enforces the same rule at the database level, so
 * even a leaked admin session cannot read her private life.
 */
export default function AdminJournal() {
  return (
    <>
      <PageHeader
        title="Sabiha's Journal"
        subtitle="এই জায়গাটা ইচ্ছাকৃতভাবে খালি।"
      />

      <Panel>
        <div className="mx-auto max-w-lg py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-50 text-2xl">
            🔒
          </div>
          <h2 className="mt-5 font-bn text-xl font-semibold text-ink">
            Admin-এর জার্নাল access নেই
          </h2>
          <p className="mt-3 font-bn text-sm leading-relaxed text-muted">
            সাবিহার জার্নাল, মুড, ভয়েস ডায়েরি, ব্যক্তিগত ছবি আর স্মৃতি — কোনোটাই এই
            dashboard থেকে পড়া যায় না। এটি কোনো অসম্পূর্ণ feature নয়; এটি সিস্টেমের
            সবচেয়ে গুরুত্বপূর্ণ নিয়ম।
          </p>

          <div className="mt-7 space-y-3 text-left">
            {[
              {
                t: 'Database-level সুরক্ষা',
                d: 'PostgreSQL Row Level Security নিশ্চিত করে যে journal_entries টেবিল শুধু তার মালিক পড়তে পারে — admin key দিয়েও নয়।',
              },
              {
                t: 'Family / Medical Admin',
                d: 'তারা শুধু treatment, health update আর appointment দেখতে ও লিখতে পারেন। জার্নাল ডিফল্টভাবে বন্ধ।',
              },
              {
                t: 'একমাত্র ব্যতিক্রম',
                d: 'সাবিহা নিজে চাইলে — তার নিজের হাতে, তার নিজের অ্যাপ থেকে — শেয়ার করতে পারেন।',
              },
            ].map((x) => (
              <div key={x.t} className="rounded-3xl border border-line/70 bg-cream/40 p-4">
                <p className="font-bn text-sm font-semibold text-sage-700">{x.t}</p>
                <p className="mt-1 font-bn text-sm leading-relaxed text-muted">{x.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/privacy" className="chip">🔒 Privacy architecture</Link>
            <Link href="/admin/settings" className="chip">⚙ Settings</Link>
          </div>
        </div>
      </Panel>
    </>
  );
}
