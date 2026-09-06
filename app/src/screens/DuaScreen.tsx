import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { morningDhikr, DHIKR_TARGET } from '../services/config';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, Button, LockBadge, Empty } from '../components/ui';

const bn = (n: number) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

/**
 * APP SCREEN 05 — Dua & Dhikr
 * Not a generic Islamic app: small, simple, repeatable. Nothing to master,
 * nothing to fail at.
 */
export default function DuaScreen() {
  const [dhikr, setDhikr] = useState<api.DhikrRow[]>([]);
  const [duas, setDuas] = useState<api.DuaRow[]>([]);
  const [favs, setFavs] = useState<api.FavouriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [favTitle, setFavTitle] = useState('');
  const [favBody, setFavBody] = useState('');

  const load = useCallback(async () => {
    try {
      const [d, du, f] = await Promise.all([api.getDhikr(), api.listDuas('today'), api.listFavouriteDuas()]);
      setDhikr(d); setDuas(du); setFavs(f);
    } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const count = (name: string) => dhikr.find((d) => d.dhikr_name === name)?.count ?? 0;
  const duaRead = (title: string) => dhikr.find((d) => d.dhikr_name === `dua:${title}`)?.completed ?? false;

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🤲 দোয়া ও যিকির</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>ছোট, সহজ, প্রতিদিনের মতো।</T>

      <View style={{ marginTop: 22 }}>
        <SectionTitle>Morning</SectionTitle>
        <Card tone="cream">
          {morningDhikr.map((name) => {
            const c = count(name);
            const done = c >= DHIKR_TARGET;
            return (
              <View key={name} style={styles.dhikrRow}>
                <View style={[styles.dot, done && styles.dotDone]}>{done && <T variant="tiny" style={{ color: '#fff', fontWeight: '700' }}>✓</T>}</View>
                <T variant="body" style={{ flex: 1, color: done ? colors.sage800 : colors.ink }}>{name}</T>
                <T variant="tiny">{bn(c)}/{bn(DHIKR_TARGET)}</T>
                <Pressable style={styles.plus} onPress={async () => { await api.bumpDhikr(name, 1); load(); }}>
                  <T variant="body" style={{ color: colors.sage700 }}>+</T>
                </Pressable>
                <Pressable style={styles.plus10} onPress={async () => { await api.bumpDhikr(name, 10); load(); }}>
                  <T variant="tiny" style={{ color: colors.sage700 }}>+১০</T>
                </Pressable>
              </View>
            );
          })}
          <T variant="tiny" style={{ marginTop: 10 }}>
            সংখ্যা পূর্ণ না হলেও কোনো অসুবিধা নেই। এটা হিসাব নয়, অভ্যাস।
          </T>
        </Card>
      </View>

      <View style={{ marginTop: 16 }}>
        <SectionTitle>Today&apos;s Dua</SectionTitle>
        {duas.map((d) => (
          <Card key={d.id} tone={duaRead(d.title) ? 'sage' : 'white'}>
            <T variant="tiny" style={{ color: colors.sage700, fontWeight: '600' }}>{d.title}</T>
            {!!d.arabic && <T variant="h2" style={{ textAlign: 'right', marginTop: 12, lineHeight: 40 }}>{d.arabic}</T>}
            {!!d.transliteration && <T variant="tiny" style={{ fontStyle: 'italic', marginTop: 6 }}>{d.transliteration}</T>}
            {!!d.translation && <T variant="small" style={{ marginTop: 8 }}>{d.translation}</T>}
            <Button
              label={duaRead(d.title) ? '✓ আজ পড়েছি' : 'আজ পড়েছি ✓'}
              variant={duaRead(d.title) ? 'soft' : 'primary'}
              style={{ marginTop: 14, marginBottom: 0 }}
              onPress={async () => { await api.toggleDuaRead(d.title); load(); }}
            />
          </Card>
        ))}
        {duas.length === 0 && <Empty emoji="🤲">আজকের জন্য কোনো দোয়া যোগ করা হয়নি।</Empty>}
      </View>

      <View style={{ marginTop: 16 }}>
        <SectionTitle>My Favourite Dua</SectionTitle>
        {favs.map((f) => (
          <Card key={f.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T variant="body" style={{ fontWeight: '600', flex: 1 }}>{f.title}</T>
              <Pressable onPress={async () => { await api.deleteFavouriteDua(f.id); load(); }}>
                <T variant="tiny">✕</T>
              </Pressable>
            </View>
            <T variant="small" style={{ marginTop: 6 }}>{f.body}</T>
          </Card>
        ))}

        <Card tone="cream">
          <TextInput style={styles.input} value={favTitle} onChangeText={setFavTitle} placeholder="শিরোনাম (ঐচ্ছিক)" placeholderTextColor={colors.faint} maxLength={80} />
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top', marginTop: 10 }]}
            value={favBody} onChangeText={setFavBody} multiline
            placeholder="যে দোয়াটা আপনার মনকে শান্ত করে…" placeholderTextColor={colors.faint} maxLength={1000}
          />
          <Button
            label="★ সংরক্ষণ করুন"
            variant="soft"
            style={{ marginTop: 12, marginBottom: 0 }}
            onPress={async () => {
              if (!favBody.trim()) { Alert.alert('খালি', 'দোয়াটি লিখুন।'); return; }
              await api.addFavouriteDua(favTitle.trim(), favBody.trim());
              setFavTitle(''); setFavBody(''); load();
            }}
          />
        </Card>
      </View>

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 14 }}>
        🔒 আপনার ইবাদতের হিসাব কারও সঙ্গে শেয়ার হয় না।
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dhikrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  dot: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotDone: { borderColor: colors.sage500, backgroundColor: colors.sage500 },
  plus: { height: 38, width: 38, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  plus10: { height: 38, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink, backgroundColor: '#fff' },
});
