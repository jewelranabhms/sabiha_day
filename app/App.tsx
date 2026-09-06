import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import {
  HindSiliguri_300Light,
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from '@expo-google-fonts/hind-siliguri';
import { useFonts } from 'expo-font';

import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';
import { isConfigured } from './src/services/supabase';

/**
 * 🌱 SABIHA'S DAY — One day at a time.
 *
 * The private companion app. Everything in here is Sabiha's: her journal, her
 * mood, her prayers, her little victories, her voice notes, her people.
 *
 * The public website ("Sabiha's Journey") carries everyone's love.
 * This app carries her through each day.
 * The bridge between them is `messages` — moderated on the website,
 * arriving here as "বার্তা".
 */
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    HindSiliguri_300Light,
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLeaf}>🌱</Text>
        <Text style={styles.splashText}>Sabiha&apos;s Day</Text>
      </View>
    );
  }

  if (!isConfigured()) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLeaf}>⚙️</Text>
        <Text style={styles.errTitle}>Supabase সেটআপ দরকার</Text>
        <Text style={styles.errBody}>
          app/.env ফাইলে EXPO_PUBLIC_SUPABASE_URL এবং EXPO_PUBLIC_SUPABASE_ANON_KEY বসান,
          তারপর আবার চালু করুন।
        </Text>
        <Text style={styles.errBody}>
          database/schema.sql ও database/policies.sql আগে Supabase-এ চালিয়ে নিতে হবে।
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: colors.paper, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 32,
  },
  splashLeaf: { fontSize: 52, marginBottom: 16 },
  splashText: { fontSize: 18, color: colors.muted, letterSpacing: 2 },
  errTitle: { fontSize: 19, fontWeight: '700', color: colors.ink, marginBottom: 12, textAlign: 'center' },
  errBody: { fontSize: 14, color: colors.muted, lineHeight: 22, textAlign: 'center', marginBottom: 10 },
});
