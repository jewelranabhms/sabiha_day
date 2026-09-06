import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Button, Eyebrow, Heading, Lead, Leaf } from '@/components/ui';
import { MessageCard } from '@/components/MessageCard';
import { approvedMessages, messageCount } from '@/lib/queries';
import { toBnNum } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Messages for Sabiha',
  description: 'সাবিহার জন্য পাঠানো ভালো কথাগুলো — যাচাইয়ের পর প্রকাশিত।',
};

const PER_PAGE = 12;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; cat?: string }>;
}) {
  const { page, cat } = await searchParams;
  const pageNum = Math.max(1, Number(page || 1));

  const [all, total] = await Promise.all([approvedMessages(10000), messageCount()]);
  const filtered = cat ? all.filter((m) => m.category === cat) : all;
  const shown = filtered.slice(0, pageNum * PER_PAGE);
  const hasMore = shown.length < filtered.length;

  const cats = [
    { id: '', label: 'সব' },
    ...[
      { id: 'dua', label: '🤲 দোয়া' },
      { id: 'love', label: '❤️ ভালোবাসা' },
      { id: 'courage', label: '🌱 সাহস' },
      { id: 'hope', label: '🌈 আশার কথা' },
      { id: 'support', label: '🫂 পাশে থাকার কথা' },
      { id: 'personal', label: '💌 ব্যক্তিগত' },
    ],
  ];

  return (
    <div className="py-14 sm:py-20">
      <Container>
        <div className="text-center">
          <Eyebrow>💌 The Wall</Eyebrow>
          <Heading as="h1" className="mt-3">Messages for Sabiha</Heading>
          <Lead className="mx-auto mt-3 max-w-xl">
            হাজারো মানুষ দূরে থাকতে পারে — কিন্তু তাদের কথা কাছে থাকতে পারে।
          </Lead>
          <p className="mt-4 font-bn text-xs text-faint">
            মোট <span className="font-semibold text-sage-700">{toBnNum(total)}</span> টি অনুমোদিত বার্তা
          </p>
        </div>

        {/* category filter — plain links, no JS needed */}
        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
          {cats.map((c) => {
            const active = (cat || '') === c.id;
            return (
              <Link
                key={c.id || 'all'}
                href={c.id ? `/messages?cat=${c.id}` : '/messages'}
                className={
                  'chip shrink-0 ' + (active ? 'chip-active' : '')
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        <Leaf className="my-10" />

        {shown.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-line bg-white/60 p-12 text-center">
            <p className="font-bn text-sm text-muted">এই বিভাগে এখনো কোনো বার্তা নেই।</p>
            <div className="mt-5">
              <Button href="/write" variant="blush">প্রথম বার্তাটা আপনি লিখুন ❤️</Button>
            </div>
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {shown.map((m) => (
              <MessageCard key={m.id} message={m} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Button
              href={`/messages?page=${pageNum + 1}${cat ? `&cat=${cat}` : ''}`}
              variant="secondary"
              size="lg"
            >
              আরও দেখুন
            </Button>
          </div>
        )}

        <div className="mt-14 rounded-4xl border border-line/70 bg-cream p-8 text-center">
          <p className="font-bn text-base leading-relaxed text-muted">
            আপনিও কি সাবিহার জন্য কিছু লিখতে চান?
          </p>
          <div className="mt-5">
            <Button href="/write" variant="blush" size="lg">✍️ লিখুন</Button>
          </div>
          <p className="mt-4 font-bn text-xs text-faint">
            কোনো public comment system নেই — প্রতিটি বার্তা আগে যাচাই হয়।
          </p>
        </div>
      </Container>
    </div>
  );
}
