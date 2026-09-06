import type { Metadata } from 'next';
import { Container, Button, Eyebrow, Heading, Lead, Leaf } from '@/components/ui';
import { Timeline } from '@/components/Timeline';
import { UpdateCard } from '@/components/UpdateCard';
import { publishedUpdates, publicTreatmentEvents } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Journey & Updates',
  description: 'সাবিহার চিকিৎসা journey এবং সর্বশেষ খবর — পরিবারের অনুমোদন নিয়ে প্রকাশিত।',
};

export const dynamic = 'force-dynamic';

export default async function JourneyPage() {
  const [updates, events] = await Promise.all([publishedUpdates(50), publicTreatmentEvents()]);
  const [latest, ...rest] = updates;

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <div className="text-center">
          <Eyebrow>🌱 Treatment Journey</Eyebrow>
          <Heading as="h1" className="mt-3">Sabiha&apos;s Treatment Journey</Heading>
          <Lead className="mx-auto mt-3 max-w-xl">
            প্রতিটি ধাপ পরিবার ও চিকিৎসকদের অনুমতি নিয়ে প্রকাশিত হয়। এখানে কোনো
            medical speculation থাকবে না।
          </Lead>
        </div>

        <Leaf className="my-10" />

        {/* ── today's update ── */}
        {latest && (
          <section>
            <h2 className="font-bn text-xs font-semibold uppercase tracking-[0.18em] text-faint">
              Today&apos;s Update
            </h2>
            <div className="mt-4">
              <UpdateCard update={latest} featured />
            </div>
          </section>
        )}

        {/* ── timeline ── */}
        <section className="mt-14">
          <h2 className="font-bn text-xl font-semibold text-ink">Timeline</h2>
          <div className="mt-6">
            <Timeline events={events} />
          </div>
        </section>

        {/* ── earlier updates ── */}
        {rest.length > 0 && (
          <section className="mt-14">
            <h2 className="font-bn text-xl font-semibold text-ink">আগের খবরগুলো</h2>
            <div className="mt-6 space-y-4">
              {rest.map((u) => (
                <UpdateCard key={u.id} update={u} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 flex flex-col items-center gap-4 rounded-4xl border border-line/70 bg-cream p-8 text-center">
          <p className="max-w-md font-bn text-sm leading-relaxed text-muted">
            সাবিহার জন্য একটি ভালো কথা লিখতে চান? সেটা তার নিজের অ্যাপে, তার নিজের দিনে
            পৌঁছে যাবে।
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/write" variant="blush">❤️ লিখুন</Button>
            <Button href="/messages" variant="secondary">বার্তাগুলো পড়ুন</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
