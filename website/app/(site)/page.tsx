import Link from 'next/link';
import { Container, WideContainer, Button, Eyebrow, Heading, Lead, Leaf } from '@/components/ui';
import { Portrait } from '@/components/Portrait';
import { MessageCard } from '@/components/MessageCard';
import { Timeline } from '@/components/Timeline';
import { UpdateCard } from '@/components/UpdateCard';
import { DonateStrip } from '@/components/DonateStrip';
import {
  approvedMessages, getProfile, latestUpdate, messageCount,
  publicTreatmentEvents, fundSummary,
} from '@/lib/queries';
import { site, currency } from '@/lib/site';
import { toBnNum } from '@/lib/format';

export const dynamic = 'force-dynamic';

/**
 * Screen 01 — Landing / Home
 *
 * Order matters, and it is intentional:
 *   1. Journey (who she is)        2. "সাবিহাকে ভালো কিছু বলুন"  ← the emotional core
 *   3. Latest update               4. Messages
 *   5. Treatment journey           6. পাশে থাকুন
 *   7. About                       8. Footer
 *
 * This page is a story, not a fundraiser. The ask comes second — after the
 * visitor has met her.
 */
export default async function HomePage() {
  const [profile, update, messages, total, events, fund] = await Promise.all([
    getProfile(),
    latestUpdate(),
    approvedMessages(3),
    messageCount(),
    publicTreatmentEvents(),
    fundSummary(),
  ]);

  const photo = profile?.photoUrl || site.profile.photo;

  return (
    <>
      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-gradient-to-b from-sage-50 via-paper to-paper"
        />
        <Container className="text-center">
          <Eyebrow className="animate-fade-up">{site.brand.journey}</Eyebrow>

          <h1 className="mt-5 font-bn text-4xl leading-[1.15] font-semibold tracking-tight text-ink text-balance animate-fade-up sm:text-6xl">
            সাহস, আশা আর
            <br className="hidden sm:block" /> সুস্থ হয়ে ওঠার গল্প
          </h1>

          <p className="mx-auto mt-5 max-w-lg font-bn text-base leading-relaxed text-muted text-pretty animate-fade-up sm:text-lg">
            {site.brand.tagline}
          </p>

          <div className="mt-10 flex justify-center animate-fade-up">
            <Portrait src={photo} size="lg" />
          </div>

          <p className="mx-auto mt-8 max-w-md font-bn text-sm leading-relaxed text-muted text-pretty">
            {profile?.headline || site.profile.headline}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/write" variant="blush" size="lg">
              ❤️ সাবিহাকে ভালো কিছু বলুন
            </Button>
            <Button href="/journey" variant="secondary" size="lg">
              Journey দেখুন
            </Button>
          </div>

          <p className="mt-6 font-bn text-xs text-faint">
            এখন পর্যন্ত <span className="font-semibold text-sage-700">{toBnNum(total)}</span> টি
            ভালো কথা পৌঁছেছে
          </p>
        </Container>
      </section>

      {/* ══════════ 2 · WRITE TO SABIHA (primary CTA) ══════════ */}
      <section className="border-y border-line/60 bg-cream py-16 sm:py-20">
        <Container className="text-center">
          <span className="text-3xl" aria-hidden>❤️</span>
          <Heading className="mt-4">সাবিহাকে ভালো কিছু বলুন</Heading>
          <Lead className="mx-auto mt-3 max-w-md">
            “আপনার একটি ছোট্ট কথাও তার দিনটা বদলে দিতে পারে।”
          </Lead>
          <p className="mx-auto mt-4 max-w-lg font-bn text-sm leading-relaxed text-faint text-pretty">
            হাজারো মানুষ দূরে থাকতে পারে — কিন্তু তাদের কথা কাছে থাকতে পারে। আপনার লেখা
            প্রতিটি বার্তা সাবিহার নিজের অ্যাপে, তার নিজের দিনে পৌঁছে যায়।
          </p>
          <div className="mt-8">
            <Button href="/write" variant="blush" size="lg">
              ✍️ লিখুন
            </Button>
          </div>
        </Container>
      </section>

      {/* ══════════ 3 · LATEST UPDATE ══════════ */}
      {update && (
        <section className="py-16 sm:py-20">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow>Latest Update</Eyebrow>
                <Heading className="mt-2 text-2xl sm:text-3xl">সর্বশেষ খবর</Heading>
              </div>
              <Link
                href="/journey"
                className="shrink-0 font-bn text-sm font-medium text-sage-700 underline-offset-4 hover:underline"
              >
                সব দেখুন →
              </Link>
            </div>
            <div className="mt-6">
              <UpdateCard update={update} featured />
            </div>
          </Container>
        </section>
      )}

      {/* ══════════ 4 · MESSAGES ══════════ */}
      <section className="border-y border-line/60 bg-sage-50/60 py-16 sm:py-20">
        <WideContainer>
          <div className="text-center">
            <span className="text-2xl" aria-hidden>💌</span>
            <Heading className="mt-3">Messages for Sabiha</Heading>
            <Lead className="mx-auto mt-3 max-w-lg">
              যারা দূরে আছেন, তাদের ভালোবাসা এখানে লেখা থাকে।
            </Lead>
          </div>

          {messages.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {messages.map((m) => (
                <MessageCard key={m.id} message={m} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center font-bn text-sm text-faint">
              এখনো কোনো বার্তা প্রকাশিত হয়নি। প্রথম বার্তাটা আপনি লিখতে পারেন।
            </p>
          )}

          <div className="mt-10 flex justify-center">
            <Button href="/messages" variant="secondary" size="lg">
              আরও ভালো কথা পড়ুন
            </Button>
          </div>
        </WideContainer>
      </section>

      {/* ══════════ 5 · TREATMENT JOURNEY ══════════ */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="text-center">
            <span className="text-2xl" aria-hidden>🌱</span>
            <Heading className="mt-3">Treatment Journey</Heading>
            <Lead className="mx-auto mt-3 max-w-lg">
              প্রতিটি ধাপ — পরিবার ও চিকিৎসকদের অনুমতি নিয়ে প্রকাশিত।
            </Lead>
          </div>

          <div className="mt-10">
            <Timeline events={events} />
          </div>

          <div className="mt-10 flex justify-center">
            <Button href="/journey" variant="secondary">
              বিস্তারিত Journey দেখুন →
            </Button>
          </div>
        </Container>
      </section>

      {/* ══════════ 6 · HELP SABIHA ══════════ */}
      <DonateStrip fund={fund} preview />

      {/* ══════════ 7 · ABOUT ══════════ */}
      <section className="py-16 sm:py-24">
        <Container>
          <Leaf className="mb-10" />
          <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
            <Portrait src={photo} size="md" className="mx-auto" />
            <div>
              <Eyebrow>About Sabiha</Eyebrow>
              <Heading className="mt-2 text-2xl">সাবিহা কে?</Heading>
              <p className="mt-4 font-bn text-base leading-relaxed text-muted text-pretty">
                {profile?.bio || site.profile.bio}
              </p>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                  <dt className="font-bn text-[11px] uppercase tracking-[0.14em] text-faint">College</dt>
                  <dd className="mt-1 font-bn text-sm text-ink">{profile?.college || site.profile.college}</dd>
                </div>
                <div className="rounded-2xl border border-line/70 bg-white px-4 py-3">
                  <dt className="font-bn text-[11px] uppercase tracking-[0.14em] text-faint">Batch</dt>
                  <dd className="mt-1 font-bn text-sm text-ink">{toBnNum(profile?.batch || site.profile.batch)}</dd>
                </div>
              </dl>
              <div className="mt-6">
                <Link
                  href="/about"
                  className="font-bn text-sm font-medium text-sage-700 underline-offset-4 hover:underline"
                >
                  আরও জানুন →
                </Link>
              </div>
            </div>
          </div>
          <Leaf className="mt-12" />
        </Container>
      </section>

      {/* ══════════ closing note ══════════ */}
      <section className="border-t border-line/60 bg-cream py-14">
        <Container className="text-center">
          <p className="mx-auto max-w-xl font-bn text-base leading-relaxed text-muted text-pretty">
            “এই ওয়েবসাইটটি ভালোবাসা বহন করে। সাবিহার দিনগুলো বহন করে তার নিজের অ্যাপ —
            <span className="text-sage-700"> একদিন একদিন করে।</span>”
          </p>
          <p className="mt-4 font-bn text-xs uppercase tracking-[0.2em] text-faint">
            🌱 {site.brand.day} · {site.brand.appTagline}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href="/day" variant="secondary" size="sm">
              🌱 Sabiha&apos;s Day দেখুন
            </Button>
            <Button href="/privacy" variant="ghost" size="sm">
              🔒 Privacy
            </Button>
          </div>
          <p className="mx-auto mt-6 max-w-md font-bn text-xs leading-relaxed text-faint">
            সাবিহার জার্নাল, মুড আর ব্যক্তিগত ছবি কখনো এই ওয়েবসাইটে আসে না।
            মোট সংগ্রহ: {currency(fund.received)}
          </p>
        </Container>
      </section>
    </>
  );
}
