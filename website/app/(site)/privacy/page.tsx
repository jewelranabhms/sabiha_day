import type { Metadata } from 'next';
import { Container, Eyebrow, Heading, Lead, Leaf } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'কী প্রকাশ্য, কী ব্যক্তিগত — সাবিহার তথ্যের সম্পূর্ণ নিয়ন্ত্রণ।',
};

const PUBLIC = [
  'নাম',
  'ছবি',
  'সংক্ষিপ্ত পরিচয়',
  'অনুমোদিত বার্তা (approved messages)',
  'অনুমোদিত খবর (approved updates)',
  'যাচাইকৃত donation তথ্য',
];

const PRIVATE = [
  'জার্নাল (আজকের কথা)',
  'মুড / কেমন অনুভব করছে',
  'ভয়েস ডায়েরি',
  'ব্যক্তিগত স্মৃতি',
  'ব্যক্তিগত ছবি',
  'ডাক্তারের নোট',
  'বিস্তারিত মেডিকেল রেকর্ড',
  'নামাজ ও যিকিরের ট্র্যাকার',
  'আজ কে এসেছিল',
];

export default function PrivacyPage() {
  return (
    <div className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <div className="text-center">
          <Eyebrow>🔒 Privacy</Eyebrow>
          <Heading as="h1" className="mt-3">কী প্রকাশ্য, কী তার নিজের</Heading>
          <Lead className="mx-auto mt-3 max-w-lg">
            এই সিস্টেমের সবচেয়ে গুরুত্বপূর্ণ অংশ ডিজাইন নয় — সাবিহার তথ্যের ওপর তার
            নিজের নিয়ন্ত্রণ।
          </Lead>
        </div>

        <Leaf className="my-10" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-4xl border border-sage-200 bg-sage-50 p-6">
            <h2 className="font-bn text-sm font-semibold uppercase tracking-[0.14em] text-sage-700">
              ✅ Public website
            </h2>
            <ul className="mt-4 space-y-2.5">
              {PUBLIC.map((t) => (
                <li key={t} className="flex gap-2.5 font-bn text-sm text-sage-900/80">
                  <span aria-hidden>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-4xl border border-blush-200 bg-blush-50 p-6">
            <h2 className="font-bn text-sm font-semibold uppercase tracking-[0.14em] text-blush-600">
              🔒 Private — শুধু সাবিহার অ্যাপে
            </h2>
            <ul className="mt-4 space-y-2.5">
              {PRIVATE.map((t) => (
                <li key={t} className="flex gap-2.5 font-bn text-sm text-ink/80">
                  <span aria-hidden>🔒</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-4xl border border-line/70 bg-white p-7 shadow-soft">
          <p className="text-center font-bn text-lg font-semibold text-ink">
            PUBLIC WEBSITE <span className="mx-2 text-faint">≠</span> SABIHA&apos;S PRIVATE LIFE
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <section className="rounded-3xl border border-line/70 bg-cream/60 p-6">
            <h2 className="font-bn text-base font-semibold text-ink">তিন ধরনের access</h2>
            <ul className="mt-4 space-y-3">
              {[
                { r: 'Sabiha', d: 'জার্নাল, মুড, দোয়া, যিকির, নামাজ, স্মৃতি, বার্তা — সবকিছু।' },
                { r: 'Admin', d: 'ওয়েবসাইট, বার্তা অনুমোদন, খবর প্রকাশ, donation, treatment timeline।' },
                { r: 'Family / Medical Admin', d: 'শুধু treatment, health update আর appointment।' },
              ].map((x) => (
                <li key={x.r} className="rounded-2xl border border-line/60 bg-white p-4">
                  <p className="font-bn text-sm font-semibold text-sage-700">{x.r}</p>
                  <p className="mt-1 font-bn text-sm leading-relaxed text-muted">{x.d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-bn text-sm leading-relaxed text-blush-600">
              ⚠️ Family / Medical Admin-এর জার্নাল access <strong>ডিফল্টভাবে নেই</strong>।
              সেটা কখনোই দেওয়া হবে না — যদি না সাবিহা নিজে চায়।
            </p>
          </section>

          <section className="rounded-3xl border border-line/70 bg-cream/60 p-6">
            <h2 className="font-bn text-base font-semibold text-ink">কীভাবে সুরক্ষিত</h2>
            <ul className="mt-4 space-y-2.5">
              {[
                'Database-এ Row Level Security চালু — প্রতিটি ব্যক্তিগত টেবিল শুধু তার মালিক পড়তে পারে।',
                'ব্যক্তিগত ছবি ও ভয়েস আলাদা private storage bucket-এ, মালিকের ID দিয়ে সংরক্ষিত।',
                'প্রতিটি public বার্তা মানুষ যাচাই করে অনুমোদন করে — কোনো automated প্রকাশ নেই।',
                'Payment PIN, password বা OTP কখনো সংরক্ষণ করা হয় না।',
                'জার্নাল export করার সম্পূর্ণ নিয়ন্ত্রণ সাবিহার হাতে।',
              ].map((t) => (
                <li key={t} className="flex gap-2.5 font-bn text-sm leading-relaxed text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-400" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-line/70 bg-cream/60 p-6">
            <h2 className="font-bn text-base font-semibold text-ink">Backup</h2>
            <p className="mt-3 font-bn text-sm leading-relaxed text-muted">
              প্রতিটি entry স্বয়ংক্রিয়ভাবে cloud-এ sync হয়। চাইলে এক ক্লিকে পুরো journey
              একটি বই আকারে (PDF) নামানো যায় — “Sabiha&apos;s Day, Volume 01”।
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
