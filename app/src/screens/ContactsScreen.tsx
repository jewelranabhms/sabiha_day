import React, { useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import * as api from '../services/api';
import { Screen, Card, T, Button, LockBadge, Empty } from '../components/ui';

const EMOJI: Record<string, string> = {
  family: '👨‍👩‍👧', doctor: '👨‍⚕️', hospital: '🏥', 'trusted person': '🤝',
};

/**
 * APP SCREEN 13 — Important Contacts
 * One-tap calling. Deliberately NOT an emergency medical advice screen.
 */
export default function ContactsScreen() {
  const [rows, setRows] = useState<api.ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ open: false, name: '', relationship: 'Family', phone: '' });

  const load = useCallback(async () => {
    try { setRows(await api.listContacts()); } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">☎️ জরুরি যোগাযোগ</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>এক ট্যাপে কল করার জন্য।</T>

      <View style={{ marginTop: 20 }}>
        {rows.length === 0 ? (
          <Empty emoji="☎️">এখনো কোনো নম্বর যোগ করা হয়নি।</Empty>
        ) : (
          rows.map((c) => (
            <Card key={c.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.avatar}><T variant="body">{EMOJI[(c.relationship || '').toLowerCase()] ?? '📞'}</T></View>
                <View style={{ flex: 1 }}>
                  <T variant="body" style={{ fontWeight: '600' }}>{c.name}</T>
                  <T variant="tiny">{c.relationship || '—'}{c.phone ? ` · ${c.phone}` : ''}</T>
                </View>
                {!!c.phone && (
                  <Pressable style={styles.call} onPress={() => Linking.openURL(`tel:${c.phone!.replace(/[^\d+]/g, '')}`)}>
                    <T variant="tiny" style={{ color: '#fff', fontWeight: '600' }}>Call</T>
                  </Pressable>
                )}
                <Pressable hitSlop={10} onPress={async () => { await api.deleteFrom('contacts', c.id); load(); }}>
                  <T variant="tiny">✕</T>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </View>

      <Button label={form.open ? 'ফর্ম বন্ধ করুন' : '+ নতুন নম্বর যোগ করুন'} variant={form.open ? 'soft' : 'primary'} onPress={() => setForm((f) => ({ ...f, open: !f.open }))} />

      {form.open && (
        <Card tone="cream">
          <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="নাম" placeholderTextColor={colors.faint} maxLength={60} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              {['Family', 'Doctor', 'Hospital', 'Trusted person'].map((r) => (
                <Pressable key={r} onPress={() => setForm({ ...form, relationship: r })} style={[styles.radio, form.relationship === r && styles.radioOn]}>
                  <T variant="tiny" style={{ color: form.relationship === r ? colors.sage700 : colors.muted }}>{r}</T>
                </Pressable>
              ))}
            </View>
            <TextInput style={[styles.input, { flex: 1 }]} value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} placeholder="01XXXXXXXXX" placeholderTextColor={colors.faint} keyboardType="phone-pad" maxLength={24} />
          </View>
          <Button
            label="যোগ করুন"
            style={{ marginTop: 12, marginBottom: 0 }}
            onPress={async () => {
              if (!form.name.trim()) return;
              await api.addContact({ name: form.name.trim(), relationship: form.relationship, phone: form.phone.trim() || undefined });
              setForm({ open: false, name: '', relationship: 'Family', phone: '' });
              load();
            }}
          />
        </Card>
      )}

      <Card tone="honey">
        <T variant="body" style={{ fontWeight: '600' }}>⚠️ একটি কথা</T>
        <T variant="small" style={{ marginTop: 8 }}>
          এই পাতাটি কোনো emergency medical advice দেয় না। শারীরিক অবস্থা হঠাৎ খারাপ হলে
          দেরি না করে সরাসরি ডাক্তার বা হাসপাতালে কল করুন — অথবা জরুরি সেবা নম্বরে (৯৯৯)।
        </T>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { height: 42, width: 42, borderRadius: 16, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  call: { backgroundColor: colors.sage600, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: '#fff' },
  radio: { borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 7, marginBottom: 6 },
  radioOn: { borderColor: colors.sage400, backgroundColor: colors.sage50 },
});
