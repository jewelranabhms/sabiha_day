import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { AdminNav } from '@/components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect('/admin/login');

  const messages = await db().all('messages');
  const pending = messages.filter((m) => m.status === 'pending').length;

  return (
    <div className="flex min-h-dvh bg-paper bg-grain">
      <AdminNav pendingCount={pending} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
