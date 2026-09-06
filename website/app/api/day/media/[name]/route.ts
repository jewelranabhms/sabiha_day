import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDaySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.webm': 'audio/webm',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
};

/**
 * Serves private media. Requires a signed-in, unlocked Sabiha's Day session —
 * the file names are random UUIDs but that is defence-in-depth, not the
 * actual security boundary.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const session = await getDaySession();
  if (!session || session.pinLocked) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { name } = await params;
  // Never allow path traversal.
  if (!/^[\w.-]+$/.test(name) || name.includes('..')) {
    return NextResponse.json({ error: 'bad name' }, { status: 400 });
  }

  const file = path.join(process.cwd(), 'data', 'uploads', name);
  if (!fs.existsSync(file)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const ext = path.extname(name).toLowerCase();
  const body = fs.readFileSync(file);

  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Content-Length': String(body.length),
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
