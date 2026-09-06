import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge, Empty } from '../components/ui';

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const monthOf = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

/**
 * APP SCREEN 11 — My Memories (photos).
 * Stored in Supabase's `private-media` bucket, never on the public site.
 */
export default function PhotosScreen({ userId }: { userId?: string }) {
  const [rows, setRows] = useState<api.PhotoRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await api.listPhotos();
      setRows(list);
      const map: Record<string, string> = {};
      await Promise.all(list.map(async (p) => { map[p.id] = (await api.privateMediaUrl(p.photo_url)) ?? ''; }));
      setUrls(map);
    } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function pick() {
    if (!userId) { Alert.alert('লগইন দরকার', 'ছবি যোগ করতে সাইন ইন করুন।'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: false,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setBusy(true);
    try {
      const asset = res.assets[0];
      const path = await api.uploadPrivateMedia(userId, 'photos', asset.uri, asset.mimeType || 'image/jpeg');
      await api.savePhoto(path, caption.trim() || undefined);
      setCaption('');
      await load();
    } catch (e: any) {
      Alert.alert('যোগ করা যায়নি', e?.message || 'আবার চেষ্টা করুন।');
    } finally { setBusy(false); }
  }

  const months = [...new Set(rows.map((r) => monthOf(r.photo_date)))];

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">📷 আমার স্মৃতি</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>ছবিগুলো শুধু এখানে — কখনো ওয়েবসাইটে নয়।</T>

      <Card tone="cream" style={{ marginTop: 20 }}>
        <TextInput style={styles.input} value={caption} onChangeText={setCaption} placeholder="এক লাইনে লিখুন (ঐচ্ছিক)…" placeholderTextColor={colors.faint} maxLength={300} />
        <Button label={busy ? 'যোগ হচ্ছে…' : '📷 ছবি যোগ করুন'} onPress={pick} disabled={busy} style={{ marginTop: 12, marginBottom: 0 }} />
      </Card>

      {rows.length === 0 ? (
        <Empty emoji="📷">এখনো কোনো ছবি যোগ করা হয়নি। আজকের একটা সাধারণ মুহূর্তও বছর পরে অমূল্য হয়ে ওঠে।</Empty>
      ) : (
        months.map((m) => (
          <View key={m} style={{ marginTop: 10 }}>
            <SectionTitle>{m}</SectionTitle>
            <View style={styles.grid}>
              {rows.filter((r) => monthOf(r.photo_date) === m).map((p) => (
                <View key={p.id} style={styles.cell}>
                  {urls[p.id] ? <Image source={{ uri: urls[p.id] }} style={styles.img} /> : <View style={[styles.img, { backgroundColor: colors.shell }]} />}
                  {!!p.caption && <T variant="tiny" style={{ marginTop: 6 }} numberOfLines={2}>{p.caption}</T>}
                  <Pressable
                    hitSlop={8}
                    style={styles.remove}
                    onPress={async () => { await api.deleteFrom('photos', p.id); load(); }}
                  >
                    <T variant="tiny" style={{ color: '#fff' }}>✕</T>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 16 }}>🔒 private storage bucket</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '47%', marginBottom: 4 },
  img: { width: '100%', aspectRatio: 1, borderRadius: 18, backgroundColor: colors.cream },
  remove: { position: 'absolute', top: 6, right: 6, height: 24, width: 24, borderRadius: 12, backgroundColor: 'rgba(43,42,39,0.55)', alignItems: 'center', justifyContent: 'center' },
});
