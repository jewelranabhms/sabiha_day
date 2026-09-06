import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge, Empty } from '../components/ui';

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const bnDate = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${BN_MONTHS[d.getMonth()]}`; };

/**
 * APP SCREEN 08 — "আজ কে এসেছিল?"
 * Over time this quietly becomes a memory timeline: everyone who showed up.
 */
export default function VisitorsScreen() {
  const [rows, setRows] = useState<api.VisitorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ open: false, name: '', relationship: '', note: '' });

  const load = useCallback(async () => {
    try { setRows(await api.listVisitors()); } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = rows.filter((r) => r.visit_date === api.todayISO());

  async function add() {
    if (!form.name.trim()) { Alert.alert('নাম দরকার', 'কে এসেছিলেন, নামটা লিখুন।'); return; }
    await api.addVisitor({
      name: form.name.trim(),
      relationship: form.relationship.trim() || undefined,
      note: form.note.trim() || undefined,
    });
    setForm({ open: false, name: '', relationship: '', note: '' });
    load();
  }

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🫂 আজ কে এসেছিল?</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>যারা আপনার পাশে ছিলেন — তাদের একটু মনে রাখা।</T>

      <Button label={form.open ? 'ফর্ম বন্ধ করুন' : '+ Add person'} variant={form.open ? 'soft' : 'primary'} style={{ marginTop: 20 }} onPress={() => setForm((f) => ({ ...f, open: !f.open }))} />

      {form.open && (
        <Card tone="cream">
          <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="নাম — যেমন: আম্মু, নুসরাত" placeholderTextColor={colors.faint} maxLength={60} />
          <TextInput style={[styles.input, styles.gap]} value={form.relationship} onChangeText={(t) => setForm({ ...form, relationship: t })} placeholder="সম্পর্ক — Mom, Friend, Doctor" placeholderTextColor={colors.faint} maxLength={40} />
          <TextInput style={[styles.input, styles.gap, { minHeight: 74, textAlignVertical: 'top' }]} value={form.note} onChangeText={(t) => setForm({ ...form, note: t })} placeholder="একটু লিখুন — “ফুল নিয়ে এসেছিল।”" placeholderTextColor={colors.faint} multiline maxLength={500} />
          <Button label="যোগ করুন" onPress={add} style={{ marginTop: 12, marginBottom: 0 }} />
        </Card>
      )}

      <View style={{ marginTop: 10 }}>
        <SectionTitle right={<T variant="tiny">{today.length}</T>}>আজ</SectionTitle>
        {today.length === 0 ? (
          <Empty emoji="🫂">আজ কেউ এলে লিখে রাখুন। ছোট্ট একটা লাইনও বছর পরে অনেক বড় হয়ে ওঠে।</Empty>
        ) : (
          today.map((v) => <Row key={v.id} v={v} onDelete={async () => { await api.deleteFrom('visitors', v.id); load(); }} />)
        )}
      </View>

      {rows.some((r) => r.visit_date !== api.todayISO()) && (
        <View style={{ marginTop: 10 }}>
          <SectionTitle right={<T variant="tiny">{rows.length}</T>}>আগের দিনগুলো</SectionTitle>
          {rows.filter((r) => r.visit_date !== api.todayISO()).map((v) => (
            <Row key={v.id} v={v} onDelete={async () => { await api.deleteFrom('visitors', v.id); load(); }} />
          ))}
        </View>
      )}

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 16 }}>
        এটাই একদিন হয়ে উঠবে আপনার memory timeline।
      </T>
    </Screen>
  );
}

function Row({ v, onDelete }: { v: api.VisitorRow; onDelete: () => void }) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={styles.avatar}><T variant="body">🫂</T></View>
        <View style={{ flex: 1 }}>
          <T variant="body" style={{ fontWeight: '600' }}>{v.name}</T>
          {!!v.relationship && <T variant="tiny">{v.relationship} · {bnDate(v.visit_date)}</T>}
          {!!v.note && <T variant="small" style={{ marginTop: 6 }}>“{v.note}”</T>}
        </View>
        <Pressable onPress={onDelete} hitSlop={10}><T variant="tiny">✕</T></Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: '#fff' },
  gap: { marginTop: 10 },
  avatar: { height: 40, width: 40, borderRadius: 20, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
});
