import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { prayers } from '../services/config';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, LockBadge } from '../components/ui';

const bn = (n: number) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

/**
 * APP SCREEN 06 — Prayer
 * Two rules we will not break: no guilt-inducing streaks, and
 * "missed" is never shown as failure.
 */
export default function PrayerScreen() {
  const [log, setLog] = useState<api.PrayerRow | null>(null);
  const [week, setWeek] = useState<api.PrayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setLog(await api.getPrayerLog()); setWeek(await api.weekPrayers()); }
    catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const done = prayers.filter((p) => log && (log as any)[p.id]).length;

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🕌 নামাজ</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>আজকের দিনটা — যেটুকু পেরেছেন, সেটুকুই যথেষ্ট।</T>

      <Card style={{ marginTop: 20, paddingVertical: 6 }}>
        {prayers.map((p) => {
          const on = !!(log && (log as any)[p.id]);
          return (
            <Pressable
              key={p.id}
              style={styles.row}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={async () => { await api.togglePrayer(p.id as any); load(); }}
            >
              <View style={[styles.dot, on && styles.dotOn]}>{on && <T variant="tiny" style={{ color: '#fff', fontWeight: '700' }}>✓</T>}</View>
              <View style={{ flex: 1 }}>
                <T variant="body" style={{ color: on ? colors.sage900 : colors.ink }}>{p.bn}</T>
                <T variant="tiny">{p.en}</T>
              </View>
            </Pressable>
          );
        })}
        <View style={styles.total}>
          <T variant="small">আজ</T>
          <T variant="body" style={{ color: colors.sage700, fontWeight: '700' }}>{bn(done)} / {bn(prayers.length)}</T>
        </View>
      </Card>

      <View style={{ marginTop: 12 }}>
        <SectionTitle>গত সাত দিন</SectionTitle>
        <Card tone="cream">
          <View style={styles.week}>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (6 - i));
              const iso = d.toISOString().slice(0, 10);
              const row = week.find((w) => w.log_date === iso);
              const c = row ? prayers.filter((p) => (row as any)[p.id]).length : 0;
              const shade = c === 0 ? colors.line : c < 3 ? colors.sage200 : c < 5 ? colors.sage300 : colors.sage500;
              return (
                <View key={iso} style={styles.weekCol}>
                  <View style={[styles.bar, { height: 14 + c * 11, backgroundColor: shade }]} />
                  <T variant="tiny">{bn(d.getDate())}</T>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      <Card tone="sage">
        <T variant="body" style={{ color: colors.sage900, lineHeight: 26 }}>
          এখানে কোনো streak নেই, কোনো লাল দাগ নেই।
        </T>
        <T variant="body" style={{ fontWeight: '700', color: colors.sage900, marginTop: 6 }}>
          “বাদ পড়া” মানে “ব্যর্থতা” নয়।
        </T>
        <T variant="tiny" style={{ marginTop: 8, color: colors.sage700 }}>
          শরীর যখন ক্লান্ত, তখন বিশ্রামও একটা ইবাদত।
        </T>
      </Card>

      <T variant="tiny" style={{ textAlign: 'center' }}>🔒 Private</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  dot: { height: 26, width: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotOn: { borderColor: colors.sage500, backgroundColor: colors.sage500 },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.cream, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginTop: 12 },
  week: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  weekCol: { alignItems: 'center', gap: 6 },
  bar: { width: 20, borderRadius: 10 },
});
