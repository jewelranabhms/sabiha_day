import { PinPad } from '@/components/PinPad';
import { unlockWithPin } from './actions';

export const dynamic = 'force-dynamic';

async function unlock(pin: string) {
  'use server';
  const fd = new FormData();
  fd.set('pin', pin);
  await unlockWithPin(fd);
}

/** APP SCREEN 15b — Journal Lock. */
export default async function LockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-12">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-50 text-2xl">
          🔒
        </div>
        <h1 className="mt-5 font-bn text-xl font-semibold text-ink">আপনার দিনটি বন্ধ</h1>
        <p className="mt-1.5 font-bn text-sm leading-relaxed text-muted">
          খুলতে PIN দিন। এটা শুধু আপনার জন্য।
        </p>
      </div>

      <div className="mt-8">
        <PinPad onSubmit={unlock} error={!!error} label={error ? 'PIN টি মেলেনি — আবার চেষ্টা করুন' : 'আপনার PIN দিন'} />
      </div>
    </div>
  );
}
