import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { config, detectHardDay, hardDay, moods, littleThings, categories } from '../services/config';
import * as api from '../services/api';
import {
  Screen, Card, T, SectionTitle, MoodPicker, CheckRow, LockBadge, Button, Empty,
} from '../components/ui';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'শুভ রাত';
  if (h < 12) return 'সুপ্রভাত';
  if (h < 16) return 'শুভ দুপুর';
  if (h < 19) return 'শুভ বিকাল';
  return 'শুভ সন্ধ্যা';
}

const BN = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

function todayLine() {
  const d = new Date();
  return `${BN[d.getDay()]}, ${d.getDate()} ${BN_MONTHS[d.getMonth()]}`;
}

/**
 * APP SCREEN 02 — Home.
 *
 * The single most important screen, governed by one rule:
 *   "Don't make Sabiha feel like a patient."
 *
 * Order: greeting → how are you feeling → today's little things →
 *        messages for you → today's words.
 * No diagnosis, no countdown, no treatment stats on this screen.
 */
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('Sabiha');
  const [check, setCheck] = useState<api.DailyCheckRow | null>(null);
  const [entry, setEntry] = useState<api.JournalRow | null>(null);
  const [msgs, setMsgs] = useState<api.MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [comfort, setComfort] = useState<api.MessageRow | null>(null);
  const [showComfort, setShowComfort] = useState(false);

  const load = useCallback(async () => {
    try {
      const u = await api.currentUser().catch(() => null);
      const displayName = (u as any)?.user_metadata?.name;
      if (displayName) setName(displayName);

      const [c, j, m] = await Promise.all([
        api.getDailyCheck(), api.getJournalFor(api.todayISO()), api.listMessages(3),
      ]);
      setCheck(c); setEntry(j); setMsgs(m);
      if (j && detectHardDay(j.content)) {
        setComfort(await api.randomMessage());
        setShowComfort(false);
      } else {
        setComfort(null);
      }
    } catch (e) {
      // offline / not configured — the screen still renders, just empty
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  async function pickMood(v: number) {
    setCheck((c) => ({ ...(c as any), id: c?.id ?? '', check_date: api.todayISO(), mood: v, little_things: c?.little_things ?? {} }));
    await api.upsertDailyCheck(api.todayISO(), { mood: v });
    load();
  }

  async function toggle(key: string) {
    const next = { ...(check?.little_things ?? {}), [key]: !(check?.little_things ?? {})[key] };
    await api.upsertDailyCheck(api.todayISO(), { little_things: next });
    setCheck((c) => ({ ...(c as any), little_things: next }));
  }

  const done = littleThings.filter((t) => (check?.little_things ?? {})[t.id]).length;

  return (
    <Screen refreshing={loading} onRefresh={load} refresh>
      {/* greeting */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <T variant="h1">{greeting()}, {name} ❤️</T>
          <T variant="small" style={{ marginTop: 6 }}>আজ: {todayLine()}</T>
        </View>
        <LockBadge />
      </View>
      <T variant="tiny" style={{ marginTop: 10 }}>
        আজ শুধু আজকের দিনটা। বাকিটা পরে ভাবা যাবে।
      </T>

      {/* mood */}
      <View style={{ marginTop: 26 }}>
        <SectionTitle>আজ কেমন লাগছে?</SectionTitle>
        <MoodPicker moods={moods as any} value={check?.mood} onChange={pickMood} />
        <T variant="tiny" style={{ textAlign: 'center', marginTop: 10 }}>
          যেটাই সত্যি, সেটাই বেছে নিন — ভুল উত্তর বলে কিছু নেই।
        </T>
      </View>

      {/* little things */}
      <View style={{ marginTop: 26 }}>
        <SectionTitle
          right={<T variant="tiny" style={{ color: colors.sage700 }}>{done}/{littleThings.length}</T>}
        >
          🌿 আজকের ছোট্ট কাজগুলো
        </SectionTitle>
        <Card tone="cream">
          {littleThings.map((t) => (
            <CheckRow
              key={t.id}
              emoji={t.emoji}
              label={t.label}
              checked={!!(check?.little_things ?? {})[t.id]}
              onPress={() => toggle(t.id)}
            />
          ))}
          <T variant="tiny" style={{ marginTop: 8 }}>
            এগুলো কোনো দায়িত্ব নয়। “বাদ পড়া” মানে “ব্যর্থতা” নয়।
          </T>
        </Card>
      </View>

      {/* the Easter egg */}
      {comfort && (
        <Card tone="blush" style={{ marginTop: 8 }}>
          <T variant="body" style={{ color: colors.ink, lineHeight: 26 }}>{hardDay.message}</T>
          {!showComfort ? (
            <Button label={hardDay.cta} variant="soft" onPress={() => setShowComfort(true)} style={{ marginTop: 14 }} />
          ) : (
            <Card style={{ marginTop: 14, marginBottom: 0 }}>
              <T variant="body">“{comfort.message}”</T>
              <T variant="tiny" style={{ marginTop: 8 }}>
                — {comfort.anonymous || !comfort.name ? 'Anonymous' : comfort.name}
              </T>
            </Card>
          )}
          <T variant="tiny" style={{ marginTop: 12 }}>
            এই অ্যাপ কোনো চিকিৎসা পরামর্শ দেয় না।
          </T>
        </Card>
      )}

      {/* messages for you */}
      <View style={{ marginTop: 22 }}>
        <SectionTitle
          right={
            <T variant="tiny" style={{ color: colors.sage700 }} onPress={() => navigation.navigate('Messages')}>
              আরও দেখুন →
            </T>
          }
        >
          💌 আপনার জন্য বার্তা
        </SectionTitle>
        {msgs.length === 0 ? (
          <Empty emoji="💌">এখনো কোনো বার্তা আসেনি। কেউ লিখলে এখানে চলে আসবে।</Empty>
        ) : (
          msgs.map((m) => (
            <Card key={m.id}>
              <T variant="small">{categories[m.category]?.emoji} {categories[m.category]?.label}</T>
              <T variant="body" style={{ marginTop: 8 }}>“{m.message}”</T>
              <T variant="tiny" style={{ marginTop: 8 }}>
                — {m.anonymous || !m.name ? 'Anonymous' : m.name}
              </T>
            </Card>
          ))
        )}
      </View>

      {/* today's words */}
      <View style={{ marginTop: 22 }}>
        <SectionTitle>✍️ আজকের কথা</SectionTitle>
        <Card onPress={() => navigation.navigate('Journal')}>
          {entry ? (
            <>
              <T variant="body" numberOfLines={4}>{entry.content}</T>
              <T variant="tiny" style={{ marginTop: 10, color: colors.sage700 }}>
                আজ লিখেছেন ✓ · সম্পাদনা করুন
              </T>
            </>
          ) : (
            <>
              <T variant="small">আজ আমার মনে যা আছে…</T>
              <T variant="tiny" style={{ marginTop: 10, color: colors.sage700 }}>লিখতে শুরু করুন →</T>
            </>
          )}
        </Card>
      </View>

      <T variant="tiny" style={{ textAlign: 'center', marginTop: 20 }}>
        🌱 {config.appName} · {config.tagline}
      </T>
    </Screen>
  );
}
