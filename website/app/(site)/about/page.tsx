import type { Metadata } from 'next';
import { Container, Button, Eyebrow, Heading, Lead, Leaf } from '@/components/ui';
import { Portrait } from '@/components/Portrait';
import { getProfile } from '@/lib/queries';
import { site } from '@/lib/site';
import { toBnNum } from '@/lib/format';

export const metadata: Metadata = {
  title: 'About Sabiha',
  description: 'সাবিহা কে — সংক্ষেপে।',
};

export const dynamic = 'force-dynamic';

/**
 * Deliberately short.
 * No unnecessary medical detail belongs on this page — she is a student,
 * a friend, a daughter. Not a diagnosis.
 */
export default async function AboutPage() {
  const profile = await getProfile();
  const photo = profile?.photoUrl || site.profile.photo;

  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <div className="text-center">
          <Eyebrow>About</Eyebrow>
          <Heading as="h1" className="mt-3">সাবিহা কে?</Heading>
        </div>

        <div className="mt-10 flex justify-center">
          <Portrait src={photo} size="lg" />
        </div>

        <blockquote className="mt-10 rounded-4xl border border-line/70 bg-white p-7 text-center shadow-soft sm:p-9">
          <p className="quote text-balance">
            {profile?.headline || site.profile.headline}
          </p>
        </blockquote>

        <Leaf className="my-10" />

        <div className="space-y-5">
          <p className="font-bn text-base leading-loose text-muted text-pretty">
            {profile?.bio || site.profile.bio}
          </p>
          <p className="font-bn text-base leading-loose text-muted text-pretty">
            {site.profile.bioEn}
          </p>
        </div>

        <dl className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { k: 'College', v: profile?.college || site.profile.collegeBn },
            { k: 'Location', v: site.profile.location },
            { k: 'Batch', v: toBnNum(profile?.batch || site.profile.batch) },
          ].map((item) => (
            <div key={item.k} className="rounded-3xl border border-line/70 bg-cream/60 p-5">
              <dt className="font-bn text-[11px] uppercase tracking-[0.14em] text-faint">{item.k}</dt>
              <dd className="mt-1.5 font-bn text-sm leading-snug text-ink">{item.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 rounded-3xl border border-line/70 bg-white p-6">
          <p className="font-bn text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            🔒 এই পেজে যা নেই
          </p>
          <p className="mt-3 font-bn text-sm leading-relaxed text-muted">
            সাবিহার চিকিৎসার বিস্তারিত, তার ব্যক্তিগত অনুভূতি, তার জার্নাল বা তার ছবি —
            কিছুই এখানে নেই, এবং থাকবে না। ওগুলো শুধু তার নিজের।
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/write" variant="blush" size="lg">❤️ সাবিহাকে লিখুন</Button>
          <Button href="/journey" variant="secondary" size="lg">Journey দেখুন</Button>
        </div>
      </Container>
    </div>
  );
}
