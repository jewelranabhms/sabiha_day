import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { config } from '../services/config';
import { Card, T, Screen, LockBadge } from '../components/ui';

const LINKS = [
  { screen: 'Prayer',    emoji: '🕌', title: 'নামাজ',          desc: 'আজকের নামাজ — কোনো streak নেই' },
  { screen: 'Treatment', emoji: '🏥', title: 'আমার চিকিৎসা',    desc: 'timeline, appointment, ডাক্তারের নোট' },
  { screen: 'Visitors',  emoji: '🫂', title: 'আজ কে এসেছিল?',  desc: 'যারা পাশে ছিলেন' },
  { screen: 'Victories', emoji: '🌱', title: 'ছোট্ট জয়',       desc: 'আজ যা ঠিকঠাক ছিল' },
  { screen: 'People',    emoji: '💫', title: 'মানুষ ও স্মৃতি',   desc: 'Family · Friends · Teachers' },
  { screen: 'Photos',    emoji: '📷', title: 'আমার ছবি',         desc: 'ব্যক্তিগত অ্যালবাম' },
  { screen: 'Voice',     emoji: '🎙️', title: 'ভয়েস ডায়েরি',      desc: 'লিখতে ইচ্ছে না করলে বলুন' },
  { screen: 'Contacts',  emoji: '☎️', title: 'জরুরি যোগাযোগ',    desc: 'পরিবার · ডাক্তার · হাসপাতাল' },
  { screen: 'Journey',   emoji: '🌸', title: 'আমার journey',     desc: 'সব এক সুতোয়' },
  { screen: 'Book',      emoji: '📖', title: 'Journey Book',    desc: 'একটা বই বানান' },
  { screen: 'Settings',  emoji: '⚙️', title: 'Settings',        desc: 'profile · lock · backup' },
];

/** The "more" tab — every room in the app, in one quiet grid. */
export default function MoreScreen() {
  const navigation = useNavigation<any>();
  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <T variant="h1">⋯ সব ঘর</T>
        <LockBadge />
      </View>
      <T variant="small" style={{ marginTop: 6 }}>যেখানে খুশি ঢুকুন। সবকিছু আপনার নিজের।</T>

      <View style={{ marginTop: 20, gap: 8 }}>
        {LINKS.map((l) => (
          <Card key={l.screen} onPress={() => navigation.navigate(l.screen)} style={{ marginBottom: 0, paddingVertical: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.icon}><T variant="body">{l.emoji}</T></View>
              <View style={{ flex: 1 }}>
                <T variant="body" style={{ fontWeight: '600' }}>{l.title}</T>
                <T variant="tiny">{l.desc}</T>
              </View>
              <T variant="small" style={{ color: colors.faint }}>›</T>
            </View>
          </Card>
        ))}
      </View>

      <Card tone="sage" style={{ marginTop: 16 }}>
        <T variant="small" style={{ color: colors.sage900, lineHeight: 24 }}>
          এই অ্যাপটা কোনো medical app নয়। এটা একটা সঙ্গী — একটা জার্নাল, একটা স্মৃতির খাতা,
          আর একটা জায়গা যেখানে আপনি রোগী নন, শুধুই আপনি।
        </T>
      </Card>

      <T variant="tiny" style={{ textAlign: 'center' }}>🌱 {config.appName} · {config.tagline}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { height: 42, width: 42, borderRadius: 16, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
});
