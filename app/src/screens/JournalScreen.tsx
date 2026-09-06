import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { moods, detectHardDay, hardDay } from '../services/config';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, MoodPicker, Button, LockBadge, Empty } from '../components/ui';

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const bnDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * APP SCREEN 03 — "আজকের কথা" (Today's Journal)
 *
 * Private. One entry per day, editable any time. Each entry keeps
 * date · time · mood · text · optional photo · optional voice note.
 */
export default function JournalScreen() {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [entry, setEntry] = useState<api.JournalRow | null>(null);
  const [all, setAll] = useState<api.JournalRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [comfort, setComfort] = useState<api.MessageRow | null>(null);
  const [showComfort, setShowComfort] = useState(false);

  const load = useCallback(async () => {
    try {
      const [today, list] = await Promise.all([api.getJournalFor(api.todayISO()), api.listJournal(60)]);
      setEntry(today); setAll(list);
      setText(today?.content ?? ''); setMood(today?.mood ?? null);
      if (today && detectHardDay(today.content)) setComfort(await api.randomMessage());
      else setComfort(null);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function save() {
    if (!text.trim()) { Alert.alert('খালি', 'কিছু একটা লিখুন — এক লাইনও যথেষ্ট।'); return; }
    setBusy(true);
    try {
      await api.saveJournal(api.todayISO(), text.trim(), mood);
      await load();
      if (detectHardDay(text)) setComfort(await api.randomMessage());
    } catch (e: any) {
      Alert.alert('সংরক্ষণ হয়নি', e?.message || 'আবার চেষ্টা করুন।');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!entry) return;
    Alert.alert('মুছে ফেলবেন?', 'এই দিনের লেখাটি স্থায়ীভাবে মুছে যাবে।', [
      { text: 'থাক', style: 'cancel' },
      { text: 'মুছুন', style: 'destructive', onPress: async () => { await api.deleteJournal(entry.id); await load(); } },
    ]);
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">✍️ আজকের কথা</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>{bnDate(api.todayISO())}</T>

      <Card style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
        <TextInput
          style={styles.editor}
          value={text}
          onChangeText={setText}
          placeholder="আজ আমার মনে যা আছে…"
          placeholderTextColor={colors.faint}
          multiline
          textAlignVertical="top"
          maxLength={20000}
        />

        <View style={styles.footer}>
          <T variant="label">MOOD</T>
          <View style={{ marginTop: 10 }}>
            <MoodPicker moods={moods as any} value={mood} onChange={setMood} />
          </View>
          <Button
            label={busy ? 'সংরক্ষণ হচ্ছে…' : entry ? 'সংরক্ষণ করুন ✓' : 'Save'}
            onPress={save}
            disabled={busy}
            style={{ marginTop: 16 }}
          />
          <T variant="tiny" style={{ textAlign: 'center' }}>🔒 Private — শুধু আপনার</T>
        </View>
      </Card>

      {/* the Easter egg — never medical advice, always one gentle line */}
      {comfort && (
        <Card tone="blush">
          <T variant="body" style={{ lineHeight: 26 }}>{hardDay.message}</T>
          {!showComfort ? (
            <Button label={hardDay.cta} variant="soft" onPress={() => setShowComfort(true)} style={{ marginTop: 14 }} />
          ) : (
            <Card style={{ marginTop: 14, marginBottom: 0 }}>
              <T variant="body">“{comfort.message}”</T>
              <T variant="tiny" style={{ marginTop: 8 }}>
                — {comfort.anonymous || !comfort.name ? 'Anonymous' : comfort.name}
              </T>
            </Card>
          )}
          <T variant="tiny" style={{ marginTop: 12 }}>
            এই অ্যাপ কোনো চিকিৎসা পরামর্শ দেয় না। শারীরিক কষ্ট বাড়লে পরিবার বা চিকিৎসকের সঙ্গে কথা বলুন।
          </T>
        </Card>
      )}

      <View style={{ marginTop: 16 }}>
        <SectionTitle right={<T variant="tiny">{all.length}</T>}>আগের দিনগুলো</SectionTitle>
        {all.length === 0 ? (
          <Empty emoji="✍️">এখনো কিছু লেখা হয়নি। প্রথম লাইনটা সবচেয়ে কঠিন — তারপর সহজ হয়ে যায়।</Empty>
        ) : (
          all.map((e) => (
            <Card key={e.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T variant="tiny" style={{ color: colors.sage700, fontWeight: '600' }}>{bnDate(e.entry_date)}</T>
                <T variant="small">{moods.find((m) => m.value === e.mood)?.emoji ?? ''}</T>
              </View>
              <T variant="small" style={{ marginTop: 8 }} numberOfLines={3}>{e.content}</T>
            </Card>
          ))
        )}
      </View>

      {entry && <Button label="এই দিনের লেখাটি মুছে ফেলুন" variant="danger" onPress={remove} style={{ marginTop: 8 }} />}

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 16 }}>
        🔒 জার্নাল কখনো ওয়েবসাইটে যায় না। পরিবার বা ডাক্তার — কেউ এটা পড়তে পারেন না।
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  editor: { minHeight: 190, padding: 18, fontSize: 16, lineHeight: 30, color: colors.ink },
  footer: { borderTopWidth: 1, borderTopColor: colors.line, padding: 16, backgroundColor: '#fff' },
});
