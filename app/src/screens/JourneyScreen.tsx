import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import * as api from '../services/api';
import { Screen, Card, T, Button, LockBadge } from '../components/ui';

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const bnDate = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

const FILTERS = [
  { id: '', label: 'সব', emoji: '🌸' },
  { id: 'journal', label: 'জার্নাল', emoji: '✍️' },
  { id: 'victory', label: 'জয়', emoji: '🌱' },
  { id: 'visitor', label: 'মানুষ', emoji: '🫂' },
  { id: 'memory', label: 'স্মৃতি', emoji: '💫' },
  { id: 'voice', label: 'ভয়েস', emoji: '🎙️' },
  { id: 'photo', label: 'ছবি', emoji: '📷' },
  { id: 'treatment', label: 'চিকিৎসা', emoji: '🏥' },
];

/**
 * APP SCREEN 14 — My Journey
 * Everything in one timeline. Years from now, this is the single most
 * valuable thing in the whole system.
 */
export default function JourneyScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<api.JourneyItem[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setItems(await api.journeyTimeline()); } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shown = filter ? items.filter((i) => i.kind === filter) : items;
  const groups: { date: string; items: api.JourneyItem[] }[] = [];
  for (const it of shown) {
    let g = groups.find((x) => x.date === it.date);
    if (!g) { g = { date: it.date, items: [] }; groups.push(g); }
    g.items.push(it);
  }

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🌸 আমার journey</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>{items.length} টি মুহূর্ত, এক সুতোয় গাঁথা।</T>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => (
          <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[styles.chip, filter === f.id && styles.chipOn]}>
            <T variant="tiny" style={{ color: filter === f.id ? colors.sage700 : colors.muted }}>
              {f.emoji} {f.label}
            </T>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ marginTop: 20 }}>
        {groups.map((g) => (
          <View key={g.date} style={styles.group}>
            <View style={styles.rail}>
              <View style={styles.node} />
              <View style={styles.line} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="tiny" style={{ color: colors.sage700, fontWeight: '600' }}>{bnDate(g.date)}</T>
              {g.items.map((it) => (
                <Card key={it.id} style={{ marginTop: 8, marginBottom: 0, padding: 14 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <T variant="small">{it.emoji}</T>
                    <View style={{ flex: 1 }}>
                      <T variant="body" style={{ fontWeight: '600', fontSize: 14 }}>{it.title}</T>
                      {!!it.detail && <T variant="small" style={{ marginTop: 4 }} numberOfLines={3}>{it.detail}</T>}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ))}
        {groups.length === 0 && <Card tone="cream"><T variant="small">এখনো কিছু লেখা হয়নি। আজ থেকে শুরু করলে এক বছর পরে এই পাতাটা ভরে উঠবে।</T></Card>}
      </View>

      <Card tone="cream" style={{ marginTop: 16, alignItems: 'center' }}>
        <T variant="small" style={{ textAlign: 'center' }}>পুরো journey-টা একটা বই বানাতে চান?</T>
        <Button label="📖 Create My Journey Book" style={{ marginTop: 12, marginBottom: 0 }} onPress={() => navigation.navigate('Book')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 13, paddingVertical: 8 },
  chipOn: { borderColor: colors.sage400, backgroundColor: colors.sage50 },
  group: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  rail: { alignItems: 'center', width: 16 },
  node: { height: 13, width: 13, borderRadius: 7, borderWidth: 2, borderColor: colors.sage300, backgroundColor: colors.paper, marginTop: 3 },
  line: { flex: 1, width: 1, backgroundColor: colors.sage200, marginVertical: 4 },
});
