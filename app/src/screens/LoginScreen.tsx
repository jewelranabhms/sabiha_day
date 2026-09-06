import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { T, Button, Card } from '../components/ui';
import * as api from '../services/api';

/**
 * Email + password sign-in.
 * There is deliberately no "sign up" — this is a private app for one person,
 * and accounts are created by an admin.
 */
export default function LoginScreen({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert('আরেকটু তথ্য', 'ইমেইল ও পাসওয়ার্ড দুটোই দিন।');
      return;
    }
    setBusy(true);
    try {
      await api.signIn(email.trim(), password);
      onDone();
    } catch (e: any) {
      Alert.alert('ঢোকা যায়নি', e?.message || 'ইমেইল বা পাসওয়ার্ড মেলেনি।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.orb}><T variant="h1">🌱</T></View>
        <T variant="h1" style={{ textAlign: 'center', marginTop: 20 }}>Sabiha&apos;s Day</T>
        <T variant="small" style={{ textAlign: 'center', marginTop: 6 }}>One day at a time.</T>

        <Card style={{ marginTop: 28, width: '100%' }}>
          <T variant="label">EMAIL</T>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor={colors.faint}
          />

          <T variant="label" style={{ marginTop: 12 }}>PASSWORD</T>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            placeholder="••••••••"
            placeholderTextColor={colors.faint}
            onSubmitEditing={submit}
          />

          <Button label={busy ? 'অপেক্ষা করুন…' : 'ঢুকুন'} onPress={submit} disabled={busy} style={{ marginTop: 14 }} />
        </Card>

        <T variant="tiny" style={{ textAlign: 'center', marginTop: 16, maxWidth: 280 }}>
          এই অ্যাপটি শুধু সাবিহার জন্য। অ্যাকাউন্ট পরিবারের তরফ থেকে তৈরি করা হয়।
        </T>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  orb: {
    alignSelf: 'center', height: 72, width: 72, borderRadius: 36,
    backgroundColor: colors.sage100, alignItems: 'center', justifyContent: 'center',
  },
  input: {
    marginTop: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink,
    backgroundColor: '#fff',
  },
});
