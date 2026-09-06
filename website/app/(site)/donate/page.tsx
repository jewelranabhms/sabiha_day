import type { Metadata } from 'next';
import { Container, Eyebrow, Heading, Lead, Leaf } from '@/components/ui';
import { DonateStrip } from '@/components/DonateStrip';
import { fundSummary } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'পাশে থাকুন · Help Sabiha',
  description: 'সাবিহার চিকিৎসায় পাশে থাকুন। bKash, Nagad, Rocket — এবং সম্পূর্ণ স্বচ্ছ হিসাব।',
};

export const dynamic = 'force-dynamic';

export default async function DonatePage() {
  const fund = await fundSummary();

  return (
    <div className="py-14 sm:py-8">
      <Container className="max-w-2xl text-center">
        <Eyebrow>Help Sabiha</Eyebrow>
        <Heading as="h1" className="mt-3">আপনার সহযোগিতা, তার সাহস</Heading>
        <Lead className="mx-auto mt-3 max-w-lg">
          চিকিৎসা দীর্ঘ হতে পারে। কিন্তু কেউ একা হলে সেটা আরও কঠিন হয়ে যায়।
        </Lead>
        <Leaf className="mt-8" />
      </Container>

      <div className="-mt-4">
        <DonateStrip fund={fund} />
      </div>

      <Container className="max-w-2xl py-14">
        <div className="rounded-3xl border border-line/70 bg-white p-6 shadow-soft">
          <h2 className="font-bn text-base font-semibold text-ink">Donation transparency</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              'প্রতিটি donation পরিবার ম্যানুয়ালি যাচাই করে।',
              'যাচাই না হওয়া কোনো টাকা মোট হিসাবে যোগ হয় না।',
              'এই ওয়েবসাইট কখনো আপনার PIN, password বা OTP চাইবে না।',
              'সরাসরি টাকা না পাঠাতে চাইলে শুধু একটি ভালো কথা লিখলেও যথেষ্ট।',
            ].map((t) => (
              <li key={t} className="flex gap-2.5 font-bn text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
}
