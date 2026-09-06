'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPhoto, addVoiceDiary } from '@/app/(app)/day/actions';
import { cn } from './cn';

/**
 * Shared uploader: sends the file to `/api/day/upload` (private storage),
 * then saves the row through a server action.
 */
async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.set('file', file);
  const res = await fetch('/api/day/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'upload failed');
  }
  const data = await res.json();
  return data.url as string;
}

/* ── photos ───────────────────────────────────────────────────────────── */

export function PhotoUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await upload(file);
      const fd = new FormData();
      fd.set('photoUrl', url);
      fd.set('caption', caption);
      fd.set('photoDate', new Date().toISOString().slice(0, 10));
      await addPhoto(fd);
      setCaption('');
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ছবি যোগ করা যায়নি।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        name="caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={300}
        className="field"
        placeholder="এক লাইনে লিখুন (ঐচ্ছিক)…"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onFile}
        className="sr-only"
        id="photo-input"
      />
      <label
        htmlFor="photo-input"
        className={cn(
          'app-btn w-full cursor-pointer',
          busy && 'pointer-events-none opacity-60',
        )}
      >
        {busy ? 'যোগ হচ্ছে…' : '📷 ছবি যোগ করুন'}
      </label>
      {error && <p className="font-bn text-xs text-blush-600">{error}</p>}
    </div>
  );
}

/* ── voice diary ──────────────────────────────────────────────────────── */

export function VoiceRecorder() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
  }, []);

  async function start() {
    setError(null);
    setSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' });
        if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
        blobUrl.current = URL.createObjectURL(blob);
        (rec as any).__blob = blob;
      };
      rec.start();
      recorder.current = rec;
      setRecording(true);
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError('মাইক্রোফোন ব্যবহার করা যাচ্ছে না। ব্রাউজারের অনুমতি দেখুন।');
    }
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
    recorder.current?.stop();
    setRecording(false);
  }

  async function save() {
    const rec: any = recorder.current;
    const blob: Blob | undefined = rec?.__blob;
    if (!blob) return;
    setBusy(true);
    setError(null);
    try {
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type || 'audio/webm' });
      const url = await upload(file);
      const fd = new FormData();
      fd.set('audioUrl', url);
      fd.set('durationS', String(seconds));
      fd.set('transcript', transcript);
      fd.set('date', new Date().toISOString().slice(0, 10));
      await addVoiceDiary(fd);
      setTranscript('');
      setSeconds(0);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সংরক্ষণ করা যায়নি।');
    } finally {
      setBusy(false);
    }
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'flex items-center justify-center gap-4 rounded-3xl border p-6 transition-colors',
          recording ? 'border-blush-300 bg-blush-50' : 'border-line bg-cream/50',
        )}
      >
        <span
          className={cn(
            'h-3 w-3 rounded-full bg-blush-500',
            recording ? 'animate-breathe' : 'opacity-25',
          )}
          aria-hidden
        />
        <span className="font-mono text-3xl tabular-nums text-ink">{mmss}</span>
      </div>

      {!recording ? (
        <button type="button" onClick={start} className="app-btn w-full">
          🎙️ রেকর্ড শুরু করুন
        </button>
      ) : (
        <button type="button" onClick={stop} className="app-btn w-full bg-blush-500">
          ⏹ থামান
        </button>
      )}

      {blobUrl.current && !recording && (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={blobUrl.current} className="w-full" />

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={2}
            maxLength={4000}
            className="field-area"
            placeholder="চাইলে যা বলেছেন তা লিখে রাখুন (পরে transcription যোগ করা যাবে)…"
          />

          <button type="button" onClick={save} disabled={busy} className="app-btn w-full">
            {busy ? 'সংরক্ষণ হচ্ছে…' : '💾 সংরক্ষণ করুন'}
          </button>
        </>
      )}

      {saved && (
        <p className="rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-center font-bn text-sm text-sage-800">
          ✓ সংরক্ষিত হয়েছে — 🔒 শুধু আপনি শুনতে পারবেন।
        </p>
      )}

      {error && (
        <p className="rounded-2xl border border-blush-200 bg-blush-50 px-4 py-3 font-bn text-xs text-blush-600">
          {error}
        </p>
      )}
    </div>
  );
}
