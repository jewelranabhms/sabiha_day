import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { config } from '../services/config';
import { T } from '../components/ui';

/**
 * APP SCREEN 01 — Welcome
 * The first thing she ever sees. Not a diagnosis. Just: today, only today.
 */
export default function WelcomeScreen({ onBegin, onLogin }: { onBegin: () => void; onLogin: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <T variant="label" style={styles.brand}>{config.appName.toUpperCase()}</T>

        <View style={styles.orb}>
          <Text style={{ fontSize: 52 }}>🌱</Text>
        </View>

        <T variant="h1" style={styles.headline}>One day{'\n'}at a time.</T>
        <T variant="body" style={styles.sub}>{config.welcomeLine}</T>

        <View style={{ width: '100%', marginTop: 40, gap: 10 }}>
          <Pressable style={styles.primary} onPress={onBegin} accessibilityRole="button">
            <Text style={styles.primaryText}>শুরু করি</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={onLogin} accessibilityRole="button">
            <Text style={styles.ghostText}>অ্যাকাউন্টে ঢুকুন</Text>
          </Pressable>
        </View>

        <T variant="tiny" style={styles.footnote}>
          এখানে যা লিখবেন তা শুধু আপনার। কেউ পড়বে না — না পরিবার, না ডাক্তার, না ওয়েবসাইট।
        </T>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  brand: { letterSpacing: 4, color: colors.sage600 },
  orb: {
    height: 108, width: 108, borderRadius: 54, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginTop: 28,
    shadowColor: '#2B2A27', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  headline: { textAlign: 'center', marginTop: 34, lineHeight: 38 },
  sub: { textAlign: 'center', marginTop: 14, color: colors.muted },
  primary: {
    backgroundColor: colors.sage600, borderRadius: 22, paddingVertical: 16, alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ghost: {
    borderRadius: 22, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff',
  },
  ghostText: { color: colors.muted, fontSize: 15 },
  footnote: { textAlign: 'center', marginTop: 34, maxWidth: 260, lineHeight: 18 },
});
