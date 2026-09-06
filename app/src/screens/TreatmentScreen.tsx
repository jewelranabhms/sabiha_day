import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import * as api from '../services/api';
import { Screen, Card, T, SectionTitle, LockBadge, Empty } from '../components/ui';

const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const bnDate = (iso: string) => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()} ${BN_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

const STATUS: Record<string, string> = { scheduled: 'নির্ধারিত', ongoing: 'চলমান', completed: 'সম্পন্ন', cancelled: 'বাতিল' };

/**
 * APP SCREEN 07 — My Treatment
 *
 * This screen exists but is never the app's front door.
 * Two hard rules:
 *   1. the app never gives medical recommendations
 *   2. doctor's notes only appear when an authorised family / medical account
 *      entered them — and they are marked as such
 */
export default function TreatmentScreen() {
  const [rows, setRows] = useState<api.TreatmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setRows(await api.listTreatment()); } catch {} finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const next = rows.find((r) => r.status === 'scheduled' || r.status === 'ongoing');
  const notes = rows.filter((r) => r.visibility === 'private');

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">🏥 আমার চিকিৎসা</T>
        <LockBadge label="Private" />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>এখানে যা আছে তা পরিবার ও চিকিৎসকদের দেওয়া তথ্য।</T>

      {next && (
        <Card style={{ marginTop: 20 }}>
          <T variant="label">CURRENT STAGE</T>
          <T variant="h2" style={{ marginTop: 6 }}>{next.title}</T>
          <T variant="small" style={{ marginTop: 4 }}>{bnDate(next.event_date)} · {STATUS[next.status]}</T>
        </Card>
      )}

      <View style={{ marginTop: 8 }}>
        <SectionTitle>Next appointment</SectionTitle>
        {next ? (
          <Card tone="sage">
            <T variant="body" style={{ fontWeight: '600', color: colors.sage900 }}>{next.title}</T>
            <T variant="small" style={{ marginTop: 4, color: colors.sage700 }}>{bnDate(next.event_date)}</T>
            {!!next.description && <T variant="small" style={{ marginTop: 10 }}>{next.description}</T>}
          </Card>
        ) : (
          <Empty emoji="📅">এই মুহূর্তে কোনো নির্ধারিত appointment নেই।</Empty>
        )}
      </View>

      <View style={{ marginTop: 8 }}>
        <SectionTitle>Doctor&apos;s Notes</SectionTitle>
        {notes.length === 0 ? (
          <Empty emoji="🩺">
            এখনো কোনো নোট যোগ করা হয়নি। চিকিৎসকের নির্দেশনা থাকলে পরিবারের অনুমোদিত
            অ্যাকাউন্ট থেকে এখানে যোগ হবে।
          </Empty>
        ) : (
          notes.map((n) => (
            <Card key={n.id} tone="blush">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T variant="body" style={{ fontWeight: '600', flex: 1 }}>{n.title}</T>
                <LockBadge />
              </View>
              {!!n.description && <T variant="small" style={{ marginTop: 8 }}>{n.description}</T>}
              <T variant="tiny" style={{ marginTop: 8 }}>{bnDate(n.event_date)}</T>
            </Card>
          ))
        )}
      </View>

      <View style={{ marginTop: 8 }}>
        <SectionTitle>Timeline</SectionTitle>
        <Card>
          {rows.map((r, i) => (
            <View key={r.id} style={styles.tlRow}>
              <View style={styles.tlLeft}>
                <View style={[styles.tlDot, r.status === 'completed' && styles.tlDotDone]} />
                {i < rows.length - 1 && <View style={styles.tlLine} />}
              </View>
              <View style={{ flex: 1, paddingBottom: 18 }}>
                <T variant="tiny" style={{ color: colors.sage700, fontWeight: '600' }}>{bnDate(r.event_date)}</T>
                <T variant="body" style={{ marginTop: 4 }}>{r.title}</T>
                {!!r.description && <T variant="small" style={{ marginTop: 4 }}>{r.description}</T>}
                <T variant="tiny" style={{ marginTop: 4 }}>
                  {STATUS[r.status]} · {r.visibility === 'public' ? 'প্রকাশ্য' : '🔒 ব্যক্তিগত'}
                </T>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <Card tone="honey">
        <T variant="body" style={{ fontWeight: '600' }}>⚠️ একটি গুরুত্বপূর্ণ কথা</T>
        <T variant="small" style={{ marginTop: 8 }}>
          এই অ্যাপ কোনো medical recommendation দেয় না — না ওষুধ, না ডোজ, না পরামর্শ।
          শারীরিক অবস্থার কোনো পরিবর্তন হলে সরাসরি চিকিৎসকের সঙ্গে যোগাযোগ করুন।
        </T>
      </Card>

      <T variant="tiny" style={{ textAlign: 'center' }}>🔒 এই পাতাটা ওয়েবসাইটে কখনো প্রকাশিত হয় না।</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tlRow: { flexDirection: 'row', gap: 12 },
  tlLeft: { alignItems: 'center', width: 18 },
  tlDot: { height: 14, width: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.sage300, backgroundColor: colors.paper, marginTop: 3 },
  tlDotDone: { backgroundColor: colors.sage400, borderColor: colors.sage400 },
  tlLine: { flex: 1, width: 1, backgroundColor: colors.sage200, marginVertical: 4 },
});
