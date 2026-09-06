import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge, Empty } from '../components/ui';

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const bnDate = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * APP SCREEN 12 — Voice Diary
 * "Say what you feel." For the days when writing is too much.
 */
export default function VoiceScreen({ userId }: { userId?: string }) {
  const [rows, setRows] = useState<api.VoiceRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api.listVoice();
      setRows(list);
      const map: Record<string, string> = {};
      await Promise.all(list.map(async (v) => { map[v.id] = (await api.privateMediaUrl(v.audio_url)) ?? ''; }));
      setUrls(map);
    } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => () => { sound?.unloadAsync(); }, [sound]);

  async function start() {
    if (!userId) { Alert.alert('লগইন দরকার', 'রেকর্ড করতে সাইন ইন করুন।'); return; }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) { Alert.alert('অনুমতি নেই', 'মাইক্রোফোন ব্যবহারের অনুমতি দিন।'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec); setSeconds(0); setLocalUri(null);
      const t = setInterval(() => setSeconds((s) => {
        if (s >= 120) { clearInterval(t); stop(rec, s + 1); }
        return s + 1;
      }), 1000);
      (rec as any).__timer = t;
    } catch (e: any) {
      Alert.alert('রেকর্ড করা যায়নি', e?.message || 'আবার চেষ্টা করুন।');
    }
  }

  async function stop(rec = recording, secs = seconds) {
    if (!rec) return;
    clearInterval((rec as any).__timer);
    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      setLocalUri(rec.getURI());
    } catch {}
    setRecording(null);
    setSeconds(secs);
  }

  async function save() {
    if (!localUri || !userId) return;
    setBusy(true);
    try {
      const path = await api.uploadPrivateMedia(userId, 'voice', localUri, 'audio/m4a');
      await api.saveVoiceDiary(path, seconds, transcript.trim() || undefined);
      setLocalUri(null); setTranscript(''); setSeconds(0);
      await load();
    } catch (e: any) {
      Alert.alert('সংরক্ষণ হয়নি', e?.message || 'আবার চেষ্টা করুন।');
    } finally { setBusy(false); }
  }

  async function play(uri: string) {
    try {
      await sound?.unloadAsync();
      const { sound: s } = await Audio.Sound.createAsync({ uri });
      setSound(s); await s.playAsync();
    } catch {}
  }

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🎙️ যা অনুভব করছেন, বলুন</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>লিখতে ইচ্ছে না করলে — শুধু বলুন।</T>

      <Card style={{ marginTop: 20, alignItems: 'center' }}>
        <View style={[styles.meter, recording && { borderColor: colors.blush300, backgroundColor: colors.blush50 }]}>
          <View style={[styles.recDot, recording && styles.recDotOn]} />
          <T variant="h1" style={{ fontFamily: 'monospace' }}>{mmss(seconds)}</T>
        </View>

        {!recording ? (
          <Button label="🎙️ রেকর্ড শুরু করুন" onPress={start} style={{ width: '100%', marginTop: 16 }} />
        ) : (
          <Button label="⏹ থামান" variant="blush" onPress={() => stop()} style={{ width: '100%', marginTop: 16 }} />
        )}

        {localUri && !recording && (
          <View style={{ width: '100%', marginTop: 8 }}>
            <Button label="▶ শুনুন" variant="soft" onPress={() => play(localUri)} />
            <TextInput
              style={[styles.input, { minHeight: 74, textAlignVertical: 'top', marginTop: 6 }]}
              value={transcript} onChangeText={setTranscript} multiline maxLength={4000}
              placeholder="চাইলে যা বলেছেন তা লিখে রাখুন…" placeholderTextColor={colors.faint}
            />
            <Button label={busy ? 'সংরক্ষণ হচ্ছে…' : '💾 সংরক্ষণ করুন'} onPress={save} disabled={busy} />
          </View>
        )}
      </Card>

      <Card tone="sage">
        <T variant="small" style={{ color: colors.sage900, lineHeight: 24 }}>
          কখনো কখনো কথাগুলো লেখা যায় না, বলা যায়। তখন শুধু রেকর্ড করুন — কেউ শুনবে না, শুধু আপনি।
        </T>
        <T variant="tiny" style={{ marginTop: 8, color: colors.sage700 }}>
          ভবিষ্যতে চাইলে এই রেকর্ডিংগুলো থেকে transcript তৈরি করা যাবে।
        </T>
      </Card>

      <View style={{ marginTop: 8 }}>
        <SectionTitle right={<T variant="tiny">{rows.length}</T>}>আপনার রেকর্ডিং</SectionTitle>
        {rows.length === 0 ? (
          <Empty emoji="🎙️">এখনো কিছু রেকর্ড করা হয়নি।</Empty>
        ) : (
          rows.map((v) => (
            <Card key={v.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T variant="tiny" style={{ color: colors.sage700, fontWeight: '600' }}>{bnDate(v.v_date)}</T>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  {!!v.duration_s && <T variant="tiny">{mmss(v.duration_s)}</T>}
                  <Pressable hitSlop={10} onPress={async () => { await api.deleteFrom('voice_diaries', v.id); load(); }}>
                    <T variant="tiny">✕</T>
                  </Pressable>
                </View>
              </View>
              <Button label="▶ শুনুন" variant="soft" style={{ marginTop: 10, marginBottom: 0 }} onPress={() => urls[v.id] && play(urls[v.id])} />
              {!!v.transcript && <T variant="small" style={{ marginTop: 10 }}>{v.transcript}</T>}
            </Card>
          ))
        )}
      </View>

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 12 }}>🔒 ভয়েস ফাইল cloud-এ সংরক্ষিত, কারও পড়ার অনুমতি নেই।</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meter: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 18, backgroundColor: colors.cream },
  recDot: { height: 12, width: 12, borderRadius: 6, backgroundColor: colors.blush400, opacity: 0.3 },
  recDotOn: { opacity: 1 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: '#fff' },
});
