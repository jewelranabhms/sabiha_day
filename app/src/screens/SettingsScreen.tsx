import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { config, notifications as NOTIF } from '../services/config';
import { syncSchedule } from '../services/notifications';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge } from '../components/ui';

/**
 * APP SCREEN 15 — Settings
 * Profile · Notifications · Privacy · Journal Lock · Backup · Export · Delete
 */
export default function SettingsScreen({
  user, onSignOut,
}: { user: any; onSignOut: () => void }) {
  const navigation = useNavigation<any>();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [pinOn, setPinOn] = useState(false);

  const load = useCallback(async () => {
    const s = await api.getSettings().catch(() => null);
    setPrefs(s?.notifications ?? {});
    setPinOn(!!(await AsyncStorage.getItem('sabiha.pin')));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function toggle(key: string) {
    const next = prefs[key] !== false ? false : true;
    setPrefs((p) => ({ ...p, [key]: next }));
    try {
      await api.setSetting('notifications', key, next);
      const s = await api.getSettings();
      const treatment = (await api.listTreatment()).find((t) => t.status === 'scheduled');
      await syncSchedule(s?.notifications ?? {}, treatment ? { title: treatment.title, date: treatment.event_date } : null);
    } catch {}
  }

  async function togglePin() {
    if (pinOn) {
      await AsyncStorage.removeItem('sabiha.pin');
      setPinOn(false);
      Alert.alert('PIN সরানো হয়েছে');
      return;
    }
    Alert.prompt?.(
      'নতুন PIN',
      '৪ সংখ্যার PIN দিন (শুধু এই ফোনে সংরক্ষিত হবে)।',
      async (value?: string) => {
        if (!value || !/^\d{4,8}$/.test(value)) { Alert.alert('ভুল PIN', '৪–৮ সংখ্যা দিন।'); return; }
        await AsyncStorage.setItem('sabiha.pin', value);
        setPinOn(true);
      },
      'plain-text',
      undefined,
      'numeric',
    ) ?? Alert.alert('PIN সেট করুন', 'এই ডিভাইসে PIN সেট করা যায়নি।');
  }

  function deleteEverything() {
    Alert.alert(
      'সব মুছে ফেলবেন?',
      'আপনার জার্নাল, মুড, ছবি, ভয়েস আর স্মৃতি স্থায়ীভাবে মুছে যাবে। ফিরিয়ে আনা যাবে না।',
      [
        { text: 'থাক', style: 'cancel' },
        {
          text: 'মুছে ফেলুন',
          style: 'destructive',
          onPress: async () => {
            const tables = ['journal_entries','daily_checks','prayer_logs','dhikr_logs','favourite_duas','visitors','little_victories','memories','photos','voice_diaries','contacts'];
            for (const t of tables) {
              const rows: any[] = await (api as any)[
                t === 'journal_entries' ? 'listJournal'
                : t === 'daily_checks' ? 'getDailyCheck'
                : t === 'prayer_logs' ? 'getPrayerLog'
                : t === 'dhikr_logs' ? 'getDhikr'
                : t === 'favourite_duas' ? 'listFavouriteDuas'
                : t === 'visitors' ? 'listVisitors'
                : t === 'little_victories' ? 'listVictories'
                : t === 'memories' ? 'listMemories'
                : t === 'photos' ? 'listPhotos'
                : t === 'voice_diaries' ? 'listVoice'
                : 'listContacts'
              ]();
              const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
              for (const r of list) await api.deleteFrom(t, r.id).catch(() => {});
            }
            Alert.alert('মুছে ফেলা হয়েছে', 'আপনার ব্যক্তিগত ডেটা আর নেই।');
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <T variant="h1">⚙️ Settings</T>
      <T variant="small" style={{ marginTop: 6 }}>সব নিয়ন্ত্রণ আপনার হাতে।</T>

      <View style={{ marginTop: 20 }}>
        <SectionTitle>Profile</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatar}>
              <T variant="h2">{(user?.email?.[0] || 'সা').toUpperCase()}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T variant="body" style={{ fontWeight: '600' }}>{user?.user_metadata?.name || user?.email}</T>
              <T variant="tiny">{user?.email}</T>
            </View>
            <LockBadge label="sabiha" />
          </View>
        </Card>
      </View>

      <SectionTitle>Notifications</SectionTitle>
      <Card style={{ paddingVertical: 6 }}>
        {NOTIF.map((n) => {
          const on = prefs[n.key] !== false;
          return (
            <Pressable key={n.key} style={styles.notifRow} onPress={() => toggle(n.key)} accessibilityRole="switch" accessibilityState={{ checked: on }}>
              <T variant="body">{n.emoji}</T>
              <View style={{ flex: 1 }}>
                <T variant="small">{n.text}</T>
                {n.key === 'treatment' && <T variant="tiny">শুধু অনুমোদিত treatment data থেকে</T>}
              </View>
              <View style={[styles.switch, on && styles.switchOn]}>
                <View style={[styles.knob, on && styles.knobOn]} />
              </View>
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>Privacy</SectionTitle>
      <Card>
        {[
          'আপনার জার্নাল, মুড আর ভয়েস ডায়েরি কারও পড়ার অনুমতি নেই — পরিবারেরও না।',
          'ওয়েবসাইটে শুধু অনুমোদিত বার্তা ও প্রকাশিত খবর যায়।',
          'ছবি ও অডিও আলাদা private storage bucket-এ থাকে।',
          'database-এ Row Level Security চালু — এটা অ্যাপের ওপর নির্ভর করে না।',
        ].map((t) => (
          <View key={t} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <T variant="small">🔒</T>
            <T variant="small" style={{ flex: 1 }}>{t}</T>
          </View>
        ))}
      </Card>

      <SectionTitle>Journal Lock</SectionTitle>
      <Card tone={pinOn ? 'sage' : 'cream'}>
        <T variant="body" style={{ fontWeight: '600' }}>{pinOn ? '🔒 PIN চালু আছে' : '🔓 PIN চালু নেই'}</T>
        <T variant="small" style={{ marginTop: 6 }}>অ্যাপ খোলার সময় PIN চাওয়া হবে।</T>
        <Button label={pinOn ? 'PIN সরান' : 'PIN সেট করুন'} variant="soft" style={{ marginTop: 12, marginBottom: 0 }} onPress={togglePin} />
      </Card>

      <SectionTitle>Backup & Export</SectionTitle>
      <Card>
        <T variant="body" style={{ fontWeight: '600' }}>☁️ Automatic cloud sync · চালু</T>
        <T variant="small" style={{ marginTop: 6 }}>
          প্রতিটি entry সাথে সাথেই Supabase-এ সংরক্ষিত হয়। ফোন বদলালেও কিছু হারাবে না।
        </T>
        <Button label="📖 Create My Journey Book" style={{ marginTop: 14 }} onPress={() => navigation.navigate('Book')} />
      </Card>

      <SectionTitle>Account</SectionTitle>
      <Button label="↩ Sign out" variant="soft" onPress={async () => { await api.signOut(); onSignOut(); }} />
      <Button label="Delete Account" variant="danger" onPress={deleteEverything} />

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 14 }}>
        🌱 {config.appName} · {config.tagline}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { height: 46, width: 46, borderRadius: 23, backgroundColor: colors.sage100, alignItems: 'center', justifyContent: 'center' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  switch: { height: 26, width: 46, borderRadius: 13, backgroundColor: colors.line, padding: 3 },
  switchOn: { backgroundColor: colors.sage500 },
  knob: { height: 20, width: 20, borderRadius: 10, backgroundColor: '#fff' },
  knobOn: { transform: [{ translateX: 20 }] },
});
