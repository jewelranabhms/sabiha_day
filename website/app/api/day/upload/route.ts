import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDaySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Private media upload for Sabiha's Day (photos + voice diary).
 *
 * Files are written OUTSIDE the public directory:
 *     website/data/uploads/            (gitignored)
 * and served back only through `/api/day/media/[name]`, which requires a
 * signed-in, unlocked app session.
 *
 * In production on Supabase this becomes an upload to the `private-media`
 * bucket at path `{userId}/...`, guarded by the storage policies in
 * `database/policies.sql`.
 */

const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/webm': '.webm',
  'audio/ogg': '.ogg',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/aac': '.aac',
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function uploadsDir() {
  const dir = path.join(process.cwd(), 'data', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function POST(req: Request) {
  const session = await getDaySession();
  if (!session || session.pinLocked) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no file' }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: `unsupported type: ${file.type || 'unknown'}` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file too large (max 8 MB)' }, { status: 413 });
  }

  const name = `${randomUUID()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsDir(), name), buf);

  return NextResponse.json(
    { url: `/api/day/media/${name}`, size: file.size, kind: file.type.startsWith('audio') ? 'audio' : 'image' },
    { status: 201 },
  );
}
