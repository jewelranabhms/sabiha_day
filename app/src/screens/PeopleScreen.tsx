import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { relationships } from '../services/config';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge, Empty } from '../components/ui';

/** APP SCREEN 10 — People & Memories. */
export default function PeopleScreen() {
  const [rows, setRows] = useState<api.MemoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rel, setRel] = useState<string | null>(null);
  const [form, setForm] = useState({ open: false, title: '', description: '', person: '', relationship: '' });

  const load = useCallback(async () => {
    try { setRows(await api.listMemories()); } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shown = rel ? rows.filter((r) => (r.relationship || 'Others') === rel) : rows;

  async function add() {
    if (!form.title.trim()) { Alert.alert('শিরোনাম দরকার', 'স্মৃতিটার একটা নাম দিন।'); return; }
    await api.addMemory({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      person_name: form.person.trim() || undefined,
      relationship: form.relationship || undefined,
    });
    setForm({ open: false, title: '', description: '', person: '', relationship: '' });
    load();
  }

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🫂 আমার মানুষেরা</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>নাম, সম্পর্ক আর তাদের সঙ্গে জড়িয়ে থাকা স্মৃতি।</T>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 8 }}>
        <Chip active={!rel} onPress={() => setRel(null)} label={`সব (${rows.length})`} />
        {relationships.map((r) => (
          <Chip key={r} active={rel === r} onPress={() => setRel(r)} label={`${r} (${rows.filter((m) => (m.relationship || 'Others') === r).length})`} />
        ))}
      </ScrollView>

      <Button
        label={form.open ? 'ফর্ম বন্ধ করুন' : '+ নতুন স্মৃতি যোগ করুন'}
        variant={form.open ? 'soft' : 'primary'}
        style={{ marginTop: 16 }}
        onPress={() => setForm((f) => ({ ...f, open: !f.open }))}
      />

      {form.open && (
        <Card tone="cream">
          <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} placeholder="শিরোনাম — যেমন: বৃষ্টির দিন" placeholderTextColor={colors.faint} maxLength={120} />
          <TextInput style={[styles.input, styles.gap, { minHeight: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} placeholder="স্মৃতিটা লিখুন…" placeholderTextColor={colors.faint} multiline maxLength={1000} />
          <TextInput style={[styles.input, styles.gap]} value={form.person} onChangeText={(t) => setForm({ ...form, person: t })} placeholder="কার সঙ্গে?" placeholderTextColor={colors.faint} maxLength={60} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8 }}>
            {relationships.map((r) => (
              <Chip key={r} active={form.relationship === r} onPress={() => setForm({ ...form, relationship: r })} label={r} />
            ))}
          </ScrollView>
          <Button label="সংরক্ষণ করুন" onPress={add} style={{ marginTop: 14, marginBottom: 0 }} />
        </Card>
      )}

      <View style={{ marginTop: 10 }}>
        <SectionTitle>{rel || 'সব স্মৃতি'}</SectionTitle>
        {shown.length === 0 ? (
          <Empty emoji="💫">এই তালিকা এখন খালি। একটা পুরনো দিনের কথা লিখে শুরু করা যাক।</Empty>
        ) : (
          shown.map((m) => (
            <Card key={m.id}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <T variant="body" style={{ fontWeight: '600' }}>{m.title}</T>
                  {!!m.description && <T variant="small" style={{ marginTop: 6 }}>{m.description}</T>}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {!!m.person_name && <Pill>👤 {m.person_name}</Pill>}
                    {!!m.relationship && <Pill tone="sage">{m.relationship}</Pill>}
                    <Pill>{m.memory_date}</Pill>
                  </View>
                </View>
                <Pressable hitSlop={10} onPress={async () => { await api.deleteFrom('memories', m.id); load(); }}>
                  <T variant="tiny">✕</T>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </View>

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 12 }}>🔒 এগুলো কখনো public website-এ যায় না।</T>
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <T variant="tiny" style={{ color: active ? colors.sage700 : colors.muted, fontWeight: active ? '600' : '400' }}>{label}</T>
    </Pressable>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone?: 'sage' }) {
  return (
    <View style={[styles.pill, tone === 'sage' && { backgroundColor: colors.sage50 }]}>
      <T variant="tiny" style={{ color: tone === 'sage' ? colors.sage700 : colors.muted }}>{children}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: '#fff' },
  gap: { marginTop: 10 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 13, paddingVertical: 8 },
  chipOn: { borderColor: colors.sage400, backgroundColor: colors.sage50 },
  pill: { borderRadius: 999, backgroundColor: colors.cream, paddingHorizontal: 10, paddingVertical: 4 },
});
