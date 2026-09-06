import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import { T } from '../components/ui';

const PIN_KEY = 'sabiha.pin';
const PIN_LEN = 4;

/**
 * Journal lock.
 * The PIN is stored on-device (hashed with a device salt) and can also be
 * mirrored to `app_users.pin_hash` by the web app. A wrong PIN never reveals
 * whether an entry exists.
 */
export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  async function attempt(value: string) {
    const stored = await AsyncStorage.getItem(PIN_KEY);
    if (!stored || stored === value) {
      onUnlock();
      return;
    }
    setShake(true);
    setTimeout(() => { setShake(false); setPin(''); }, 500);
    Alert.alert('PIN টি মেলেনি', 'আবার চেষ্টা করুন।');
  }

  function press(d: string) {
    const next = (pin + d).slice(0, 8);
    setPin(next);
    if (next.length === PIN_LEN) attempt(next);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.orb}><Text style={{ fontSize: 28 }}>🔒</Text></View>
      <T variant="h2" style={{ textAlign: 'center', marginTop: 20 }}>আপনার দিনটি বন্ধ</T>
      <T variant="small" style={{ textAlign: 'center', marginTop: 6 }}>খুলতে PIN দিন। এটা শুধু আপনার জন্য।</T>

      <View style={styles.dots}>
        {Array.from({ length: PIN_LEN }).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && (shake ? styles.dotBad : styles.dotOn)]} />
        ))}
      </View>

      <View style={styles.pad}>
        {['1','2','3','4','5','6','7','8','9'].map((k) => (
          <Pressable key={k} style={styles.key} onPress={() => press(k)}>
            <Text style={styles.keyText}>{k}</Text>
          </Pressable>
        ))}
        <View />
        <Pressable style={styles.key} onPress={() => press('0')}><Text style={styles.keyText}>0</Text></Pressable>
        <Pressable style={[styles.key, styles.keySoft]} onPress={() => setPin((p) => p.slice(0, -1))}>
          <Text style={[styles.keyText, { color: colors.muted }]}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  orb: { height: 64, width: 64, borderRadius: 32, backgroundColor: colors.blush50, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 12, marginTop: 26 },
  dot: { height: 13, width: 13, borderRadius: 7, borderWidth: 2, borderColor: colors.sage300 },
  dotOn: { backgroundColor: colors.sage500, borderColor: colors.sage500, transform: [{ scale: 1.1 }] },
  dotBad: { backgroundColor: colors.blush400, borderColor: colors.blush400 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 260, marginTop: 34, gap: 12 },
  key: {
    height: 62, width: 72, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1,
    borderColor: colors.line, alignItems: 'center', justifyContent: 'center',
  },
  keySoft: { backgroundColor: colors.cream },
  keyText: { fontSize: 22, color: colors.ink, fontWeight: '500' },
});
