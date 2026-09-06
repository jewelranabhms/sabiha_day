import { redirect } from 'next/navigation';
import { getDaySession } from '@/lib/auth';
import { TabBar } from '@/components/TabBar';

export const dynamic = 'force-dynamic';

/**
 * Everything inside this group is Sabiha's private area.
 * Two gates: signed in, and unlocked (if she has set a journal PIN).
 */
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getDaySession();
  if (!session) redirect('/day/login');
  if (session.pinLocked) redirect('/day/lock');

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      <TabBar />
    </>
  );
}
