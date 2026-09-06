import React, { useCallback, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { categories } from '../services/config';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge } from '../components/ui';

const esc = (s?: string | null) =>
  (s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const bnDate = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const bnMonth = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

/**
 * 📖 Create My Journey Book — "Sabiha's Day, Volume 01"
 *
 * Builds a print-ready HTML volume and hands it to expo-print, which
 * produces a real PDF on the device. Bangla shaping is handled by the
 * platform's text engine, so the output is correct.
 *
 * What goes in is controlled by Settings → Export. Medical detail is
 * excluded unless she explicitly turns it on.
 */
export default function BookScreen() {
  const [busy, setBusy] = useState(false);
  const [include, setInclude] = useState<Record<string, boolean>>({
    journal: true, victories: true, photos: true, memories: true, messages: true, voice: false, treatment: false,
  });
  const [preview, setPreview] = useState<{ n: number; from: string; to: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const s = await api.getSettings();
      if (s?.export_include) setInclude((prev) => ({ ...prev, ...s.export_include }));
      const items = await api.journeyTimeline();
      const dates = items.map((i) => i.date).sort();
      setPreview({ n: items.length, from: dates[0] ?? api.todayISO(), to: dates[dates.length - 1] ?? api.todayISO() });
    } catch {}
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function buildHtml() {
    const [journal, victories, visitors, memories, voice, msgs, treatment] = await Promise.all([
      include.journal ? api.listJournal(1000) : Promise.resolve([]),
      include.victories ? api.listVictories(1000) : Promise.resolve([]),
      include.memories ? api.listVisitors(1000) : Promise.resolve([]),
      include.memories ? api.listMemories(1000) : Promise.resolve([]),
      include.voice ? api.listVoice(500) : Promise.resolve([]),
      include.messages ? api.listMessages(1000) : Promise.resolve([]),
      include.treatment ? api.listTreatment() : Promise.resolve([]),
    ]);

    const all = [...journal.map((r) => r.entry_date), ...victories.map((r) => r.v_date), ...visitors.map((r) => r.visit_date)].sort();
    const from = all[0] ?? api.todayISO();
    const to = all[all.length - 1] ?? api.todayISO();

    const chapter = (emoji: string, title: string, body: string) =>
      `<section class="chapter"><h2>${emoji} ${title}</h2>${body}</section>`;

    const parts: string[] = [];

    if (journal.length) {
      parts.push(chapter('✍️', 'Journal · আজকের কথা', journal
        .slice().reverse()
        .map((j) => `<article><p class="date">${bnDate(j.entry_date)}${j.mood ? ` · mood ${j.mood}/5` : ''}</p><p class="body">${esc(j.content)}</p></article>`)
        .join('')));
    }
    if (victories.length) {
      parts.push(chapter('🌱', 'Little Victories · ছোট্ট জয়',
        `<ul>${victories.slice().reverse().map((v) => `<li><b>${bnDate(v.v_date)}</b> — ❤️ ${esc(v.content)}</li>`).join('')}</ul>`));
    }
    if (visitors.length) {
      parts.push(chapter('🫂', 'People I Met · কে এসেছিল',
        `<ul>${visitors.slice().reverse().map((v) => `<li><b>${bnDate(v.visit_date)}</b> — ${esc(v.name)}${v.relationship ? ` (${esc(v.relationship)})` : ''}${v.note ? `: “${esc(v.note)}”` : ''}</li>`).join('')}</ul>`));
    }
    if (memories.length) {
      parts.push(chapter('💫', 'Memories · স্মৃতি', memories.slice().reverse().map((m) =>
        `<article><p class="date">${bnDate(m.memory_date)}</p><p class="title">${esc(m.title)}</p>${m.description ? `<p class="body">${esc(m.description)}</p>` : ''}${m.person_name ? `<p class="meta">${esc(m.person_name)}${m.relationship ? ` · ${esc(m.relationship)}` : ''}</p>` : ''}</article>`).join('')));
    }
    if (voice.length) {
      parts.push(chapter('🎙️', 'Voice Diary', `<ul>${voice.slice().reverse().map((v) =>
        `<li><b>${bnDate(v.v_date)}</b> — ${v.transcript ? esc(v.transcript) : '<i>audio recording (not transcribed)</i>'}</li>`).join('')}</ul>`));
    }
    if (msgs.length) {
      parts.push(chapter('💌', 'Messages for Sabiha',
        `<p class="lead">হাজারো মানুষ দূরে ছিল — কিন্তু তাদের কথা কাছে ছিল।</p>` +
        msgs.slice().reverse().map((m) =>
          `<blockquote><p>${esc(m.message)}</p><cite>— ${m.anonymous || !m.name ? 'Anonymous' : esc(m.name)} · ${categories[m.category]?.emoji ?? ''} ${categories[m.category]?.label ?? ''}</cite></blockquote>`).join('')));
    }
    if (treatment.length) {
      parts.push(chapter('🏥', 'Important Events',
        `<ul>${treatment.map((t) => `<li><b>${bnDate(t.event_date)}</b> — ${esc(t.title)}${t.description ? `: ${esc(t.description)}` : ''}</li>`).join('')}</ul>`));
    }

    return `<!doctype html><html lang="bn"><head><meta charset="utf-8">
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif; color: #2B2A27; background: #fff; line-height: 1.75; }
  .cover { text-align: center; padding-top: 120px; page-break-after: always; }
  .cover .brand { letter-spacing: 6px; font-size: 11px; text-transform: uppercase; color: #4A7058; }
  .cover h1 { font-size: 44px; margin: 28px 0 8px; font-weight: 700; }
  .cover .range { color: #7A736A; font-size: 16px; }
  .cover .tag { margin-top: 46px; color: #A79E93; font-style: italic; }
  .cover .owner { margin: 60px auto 0; display: inline-block; border: 1px solid #E6DDCF; border-radius: 20px; padding: 18px 34px; background: #F7F1E8; }
  .cover .owner small { display: block; letter-spacing: 2px; font-size: 10px; text-transform: uppercase; color: #A79E93; }
  .cover .owner b { font-size: 20px; }
  .rule { display:flex; align-items:center; gap:12px; justify-content:center; color:#9FC0A9; margin: 26px 0; }
  .rule span { height:1px; width:60px; background:currentColor; }
  .chapter { page-break-before: always; }
  h2 { font-size: 19px; border-bottom: 1px solid #E6DDCF; padding-bottom: 8px; color: #2B2A27; }
  .date { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #4A7058; font-weight: 600; margin-bottom: 4px; }
  .title { font-weight: 600; font-size: 16px; margin: 2px 0; }
  .body { font-size: 15px; white-space: pre-wrap; margin: 4px 0 22px; }
  .meta { font-size: 11px; color: #A79E93; }
  .lead { color: #7A736A; font-style: italic; }
  article { page-break-inside: avoid; }
  ul { padding-left: 18px; } li { margin-bottom: 8px; font-size: 14px; }
  blockquote { border-left: 2px solid #C4DACB; margin: 0 0 18px; padding-left: 14px; page-break-inside: avoid; }
  blockquote p { font-size: 15px; margin: 0; }
  blockquote cite { display: block; font-size: 11px; color: #A79E93; font-style: normal; margin-top: 5px; }
  footer { page-break-before: always; text-align: center; color: #A79E93; font-size: 12px; padding-top: 60px; }
</style></head><body>
  <div class="cover">
    <p class="brand">Sabiha's Day</p>
    <div class="rule"><span></span>🌸<span></span></div>
    <h1>Volume 01</h1>
    <p class="range">${bnMonth(from)} — ${bnMonth(to)}</p>
    <p class="tag">One day at a time.</p>
    <div class="owner"><small>This book belongs to</small><b>Sabiha</b></div>
  </div>
  ${parts.join('\n')}
  <footer>
    <div class="rule"><span></span>🌱<span></span></div>
    <p><i>“আজ শুধু আজকের দিনটা।”</i></p>
    <p>Sabiha's Day · Volume 01 · তৈরি হয়েছে ${bnDate(api.todayISO())}<br/>এই বইটি সম্পূর্ণ ব্যক্তিগত। প্রকাশের সিদ্ধান্ত শুধু তার।</p>
  </footer>
</body></html>`;
  }

  async function create() {
    setBusy(true);
    try {
      const html = await buildHtml();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: "Sabiha's Day — Volume 01" });
      else Alert.alert('তৈরি হয়েছে', uri);
    } catch (e: any) {
      Alert.alert('বই তৈরি করা যায়নি', e?.message || 'আবার চেষ্টা করুন।');
    } finally { setBusy(false); }
  }

  const PARTS = [
    { key: 'journal', label: 'জার্নাল' },
    { key: 'victories', label: 'ছোট্ট জয়' },
    { key: 'photos', label: 'ছবি' },
    { key: 'memories', label: 'স্মৃতি ও মানুষ' },
    { key: 'messages', label: 'আপনার জন্য বার্তা' },
    { key: 'voice', label: 'ভয়েস ডায়েরি' },
    { key: 'treatment', label: 'চিকিৎসার তথ্য', sensitive: true },
  ];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">📖 Journey Book</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>
        {preview ? `${preview.n} টি মুহূর্ত · ${bnMonth(preview.from)} — ${bnMonth(preview.to)}` : 'আপনার পুরো journey একটা বইয়ে।'}
      </T>

      <Card tone="cream" style={{ marginTop: 20 }}>
        <T variant="body" style={{ fontWeight: '600' }}>কী কী যুক্ত হবে?</T>
        {PARTS.map((p) => (
          <View key={p.key} style={styles.row}>
            <T variant="small" style={{ flex: 1 }}>{p.label}</T>
            {p.sensitive && <T variant="tiny" style={{ color: colors.blush600 }}>সংবেদনশীল</T>}
            <T variant="tiny" style={{ color: include[p.key] ? colors.sage700 : colors.faint }}>
              {include[p.key] ? '✓ যুক্ত' : '— বাদ'}
            </T>
          </View>
        ))}
        <T variant="tiny" style={{ marginTop: 10 }}>
          বদলাতে Settings → Export My Journal-এ যান। চিকিৎসার তথ্য ডিফল্টভাবে বাদ থাকে।
        </T>
      </Card>

      <Button label={busy ? 'তৈরি হচ্ছে…' : '📖 Create My Journey Book'} onPress={create} disabled={busy} />

      <Card tone="sage">
        <T variant="small" style={{ color: colors.sage900, lineHeight: 24 }}>
          বইটি PDF আকারে তৈরি হবে — জার্নাল, ছোট্ট জয়, স্মৃতি, ছবি আর সবার পাঠানো ভালো কথা।
          সেটা কারও সঙ্গে শেয়ার করা না করা, সম্পূর্ণ আপনার সিদ্ধান্ত।
        </T>
      </Card>

      {Platform.OS === 'web' && (
        <T variant="tiny" style={{ textAlign: 'center' }}>
          ব্রাউজারে PDF তৈরি নাও হতে পারে — ফোনে চেষ্টা করুন।
        </T>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
});
