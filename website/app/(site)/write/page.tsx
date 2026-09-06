import type { Metadata } from 'next';
import { Container, Eyebrow, Heading, Lead, Leaf } from '@/components/ui';
import { WriteMessageForm } from '@/components/WriteMessageForm';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'সাবিহাকে ভালো কিছু বলুন',
  description: 'আপনার একটি ছোট্ট কথাও হয়তো তার দিনটা বদলে দিতে পারে।',
};

export default function WritePage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <div className="text-center">
          <Eyebrow>Messages for Sabiha</Eyebrow>
          <Heading as="h1" className="mt-3">
            ❤️ সাবিহাকে লিখুন
          </Heading>
          <Lead className="mx-auto mt-3 max-w-md">
            আপনার একটি ছোট্ট কথাও হয়তো তার দিনটা বদলে দিতে পারে।
          </Lead>
        </div>

        <Leaf className="my-9" />

        <WriteMessageForm />

        <div className="mt-8 rounded-3xl border border-line/70 bg-cream/60 p-6">
          <p className="font-bn text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            লেখার আগে একটু
          </p>
          <ul className="mt-3 space-y-2">
            {[
              'ছোট ও আন্তরিক লিখুন — দুই-তিন লাইনই যথেষ্ট।',
              'চিকিৎসা সম্পর্কে পরামর্শ বা ধারণা লেখা থেকে বিরত থাকুন।',
              'লিংক, ফোন নম্বর বা ব্যক্তিগত তথ্য পাঠাবেন না।',
              'প্রতিটি বার্তা পরিবারের অনুমোদনের পর প্রকাশিত হয়।',
            ].map((t) => (
              <li key={t} className="flex gap-2.5 font-bn text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-300" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-center font-bn text-xs leading-relaxed text-faint">
          🌱 অনুমোদিত বার্তাগুলো ওয়েবসাইটে এবং {site.brand.day} অ্যাপে — দুই জায়গাতেই পৌঁছে যায়।
        </p>
      </Container>
    </div>
  );
}
