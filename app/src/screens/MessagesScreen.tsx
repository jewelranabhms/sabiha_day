import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { categories } from '../services/config';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, Empty } from '../components/ui';

function groupLabel(iso: string) {
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return 'আজ';
  if (diff === -1) return 'গতকাল';
  const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  return `${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * APP SCREEN 04 — My Messages
 * Approved messages from the website arrive here, plus the app's most loved
 * feature: ✨ "আজ আমাকে একটা ভালো কথা বলো".
 */
export default function MessagesScreen() {
  const [msgs, setMsgs] = useState<api.MessageRow[]>([]);
  const [random, setRandom] = useState<api.MessageRow | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setMsgs(await api.listMessages(200)); } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const groups: { label: string; items: api.MessageRow[] }[] = [];
  for (const m of msgs) {
    const label = groupLabel(m.created_at);
    let g = groups.find((x) => x.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(m);
  }

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <T variant="h1">💌 আপনার জন্য বার্তা</T>
      <T variant="small" style={{ marginTop: 6 }}>
        {msgs.length} জন মানুষ দূর থেকে ভালোবাসা পাঠিয়েছে।
      </T>

      <Card tone="sage" style={{ marginTop: 20 }}>
        <Button
          label={random ? '✨ আরেকটা ভালো কথা বলো' : '✨ আজ আমাকে একটা ভালো কথা বলো'}
          variant="soft"
          onPress={async () => setRandom(await api.randomMessage(random?.id))}
        />
        {random && (
          <Card style={{ marginBottom: 0, marginTop: 4 }}>
            <T variant="small">{categories[random.category]?.emoji} {categories[random.category]?.label}</T>
            <T variant="body" style={{ marginTop: 8 }}>“{random.message}”</T>
            <T variant="tiny" style={{ marginTop: 8 }}>
              — {random.anonymous || !random.name ? 'Anonymous' : random.name}
            </T>
          </Card>
        )}
      </Card>

      {msgs.length === 0 ? (
        <Empty emoji="💌">এখনো কোনো বার্তা অনুমোদিত হয়নি। হলে এখানে চলে আসবে।</Empty>
      ) : (
        groups.map((g) => (
          <View key={g.label} style={{ marginTop: 14 }}>
            <SectionTitle right={<T variant="tiny">{g.items.length}</T>}>{g.label}</SectionTitle>
            {g.items.map((m) => (
              <Card key={m.id}>
                <T variant="small">{categories[m.category]?.emoji} {categories[m.category]?.label}</T>
                <T variant="body" style={{ marginTop: 8 }}>“{m.message}”</T>
                <T variant="tiny" style={{ marginTop: 8 }}>
                  — {m.anonymous || !m.name ? 'Anonymous' : m.name}
                </T>
              </Card>
            ))}
          </View>
        ))
      )}

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 16 }}>
        প্রতিটি বার্তা মানুষ পড়ে অনুমোদন করার পর এখানে আসে। 🔒
      </T>
    </Screen>
  );
}
