import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await destroyAdminSession();
  const url = new URL(req.url);
  return NextResponse.redirect(`${url.origin}/admin/login`, { status: 303 });
}
