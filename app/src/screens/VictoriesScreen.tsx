import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge, Empty } from '../components/ui';

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const bnDate = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

/**
 * APP SCREEN 09 — Little Victories
 * The emotional centre of the app. Not progress against illness —
 * simply the small things that went right.
 */
export default function VictoriesScreen() {
  const [rows, setRows] = useState<api.VictoryRow[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setRows(await api.listVictories()); } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function add() {
    if (!text.trim()) { Alert.alert('খালি', 'আজকের ছোট্ট জয়টা লিখুন — বড় হতে হবে না।'); return; }
    await api.addVictory(text.trim());
    setText(''); load();
  }

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🌱 ছোট্ট জয়</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>যে ছোট জিনিসগুলো আজ ঠিকঠাক ছিল।</T>

      <Card tone="sage" style={{ marginTop: 20 }}>
        <T variant="body" style={{ fontWeight: '600', color: colors.sage900 }}>+ আজকের ছোট্ট জয় যোগ করুন</T>
        <TextInput
          style={[styles.input, { minHeight: 84, textAlignVertical: 'top', marginTop: 12 }]}
          value={text} onChangeText={setText} multiline maxLength={500}
          placeholder="যেমন: আজ কঠিন একটা দিন পার করেছি।" placeholderTextColor={colors.faint}
        />
        <Button label="❤️ সংরক্ষণ করুন" onPress={add} style={{ marginTop: 12, marginBottom: 0 }} />
        <T variant="tiny" style={{ marginTop: 10, color: colors.sage700 }}>
          খুব ছোট কিছুও লেখা যায় — “আজ এক গ্লাস পানি খেয়েছি”, “আজ জানালা খুলেছি”। জয়ের কোনো আকার নেই।
        </T>
      </Card>

      <View style={{ marginTop: 10 }}>
        <SectionTitle right={<T variant="tiny">{rows.length}</T>}>সব মিলিয়ে</SectionTitle>
        {rows.length === 0 ? (
          <Empty>এখনো কিছু লেখা হয়নি। আজকের প্রথম ছোট্ট জয়টা লিখুন।</Empty>
        ) : (
          rows.map((v) => (
            <Card key={v.id}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <T variant="body">❤️</T>
                <View style={{ flex: 1 }}>
                  <T variant="body">{v.content}</T>
                  <T variant="tiny" style={{ marginTop: 6 }}>{bnDate(v.v_date)}</T>
                </View>
                <Pressable hitSlop={10} onPress={async () => { await api.deleteFrom('little_victories', v.id); load(); }}>
                  <T variant="tiny">✕</T>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </View>

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 12 }}>🔒 শুধু আপনার জন্য</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: '#fff', lineHeight: 24 },
});
