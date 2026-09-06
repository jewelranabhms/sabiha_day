import React from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';

/* ── text ─────────────────────────────────────────────────────────────── */

export function T({
  children, variant = 'body', style, ...rest
}: {
  children: React.ReactNode;
  variant?: 'title' | 'h1' | 'h2' | 'body' | 'small' | 'tiny' | 'label';
  style?: any;
} & Omit<React.ComponentProps<typeof Text>, 'style'>) {
  return (
    <Text style={[styles[variant], style]} {...rest}>
      {children}
    </Text>
  );
}

/* ── screen shell ─────────────────────────────────────────────────────── */

export function Screen({
  children, scroll = true, style, refresh, refreshing, onRefresh,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  refresh?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={undefined}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.fill}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']}>
      {refresh && refreshing ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.sage500} />
        </View>
      ) : null}
      {body}
    </SafeAreaView>
  );
}

/* ── card ─────────────────────────────────────────────────────────────── */

export function Card({
  children, style, tone = 'white', onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  tone?: 'white' | 'cream' | 'sage' | 'blush' | 'honey';
  onPress?: () => void;
}) {
  const bg = {
    white: colors.paper === '#FDFAF5' ? '#FFFFFF' : '#FFFFFF',
    cream: colors.cream,
    sage: colors.sage50,
    blush: colors.blush50,
    honey: colors.honey100,
  }[tone];
  const border = {
    white: colors.line,
    cream: colors.line,
    sage: colors.sage200,
    blush: colors.blush200,
    honey: colors.honey300,
  }[tone];

  const inner = (
    <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

/* ── buttons ──────────────────────────────────────────────────────────── */

export function Button({
  label, onPress, variant = 'primary', disabled, style, icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'soft' | 'danger' | 'blush';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}) {
  const bg = {
    primary: colors.sage600,
    soft: '#FFFFFF',
    danger: colors.blush50,
    blush: colors.blush500,
  }[variant];
  const fg = {
    primary: '#FFFFFF',
    soft: colors.ink,
    danger: colors.blush600,
    blush: '#FFFFFF',
  }[variant];
  const border = {
    primary: colors.sage600,
    soft: colors.line,
    danger: colors.blush200,
    blush: colors.blush500,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>
        {icon ? `${icon}  ` : ''}{label}
      </Text>
    </Pressable>
  );
}

/* ── section title ────────────────────────────────────────────────────── */

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <T variant="label">{children}</T>
      {right}
    </View>
  );
}

/* ── empty state ──────────────────────────────────────────────────────── */

export function Empty({ children, emoji = '🌱' }: { children: React.ReactNode; emoji?: string }) {
  return (
    <Card tone="cream">
      <T variant="h2" style={{ textAlign: 'center' }}>{emoji}</T>
      <T variant="small" style={{ textAlign: 'center', marginTop: 8 }}>{children}</T>
    </Card>
  );
}

/* ── lock badge ───────────────────────────────────────────────────────── */

export function LockBadge({ label = 'Private' }: { label?: string }) {
  return (
    <View style={styles.lock}>
      <T variant="tiny" style={{ color: colors.blush600 }}>🔒 {label}</T>
    </View>
  );
}

/* ── mood picker ──────────────────────────────────────────────────────── */

export function MoodPicker({
  moods, value, onChange, size = 'md',
}: {
  moods: { value: number; emoji: string; label: string }[];
  value: number | null | undefined;
  onChange: (v: number) => void;
  size?: 'md' | 'lg';
}) {
  return (
    <View style={styles.moodRow}>
      {moods.map((m) => {
        const active = value === m.value;
        return (
          <Pressable
            key={m.value}
            onPress={() => onChange(m.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={m.label}
            style={[
              styles.moodItem,
              active && styles.moodItemActive,
              size === 'lg' && { paddingVertical: 14 },
            ]}
          >
            <Text style={{ fontSize: size === 'lg' ? 30 : 24 }}>{m.emoji}</Text>
            <T variant="tiny" style={{ color: active ? colors.sage800 : colors.faint, marginTop: 4 }}>
              {m.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── checkbox row ─────────────────────────────────────────────────────── */

export function CheckRow({
  checked, onPress, emoji, label,
}: {
  checked: boolean; onPress: () => void; emoji: string; label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[styles.checkRow, checked && styles.checkRowOn]}
    >
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <T variant="tiny" style={{ color: '#fff', fontWeight: '700' }}>✓</T>}
      </View>
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <T variant="body" style={{ flex: 1, color: checked ? colors.sage900 : colors.muted }}>
        {label}
      </T>
    </Pressable>
  );
}

/* ── styles ───────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  fill: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40, gap: 0 },
  loading: { paddingVertical: 8, alignItems: 'center' },

  title: { fontSize: 13, fontWeight: '600', color: colors.faint, letterSpacing: 1.4, textTransform: 'uppercase' },
  h1: { fontSize: 26, fontWeight: '700', color: colors.ink, lineHeight: 34 },
  h2: { fontSize: 19, fontWeight: '600', color: colors.ink, lineHeight: 27 },
  body: { fontSize: 15, color: colors.ink, lineHeight: 25 },
  small: { fontSize: 14, color: colors.muted, lineHeight: 22 },
  tiny: { fontSize: 12, color: colors.faint, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600', color: colors.faint, letterSpacing: 1.2, textTransform: 'uppercase' },

  card: {
    borderRadius: radius.lg, borderWidth: 1, padding: 18, marginBottom: 14,
    shadowColor: '#2B2A27', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },

  button: {
    borderRadius: radius.lg, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  buttonText: { fontSize: 15, fontWeight: '600' },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 10, marginBottom: 10,
  },

  lock: {
    backgroundColor: colors.blush50, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },

  moodRow: { flexDirection: 'row', gap: 8 },
  moodItem: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff',
  },
  moodItemActive: { borderColor: colors.sage400, backgroundColor: colors.sage50 },

  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
    backgroundColor: '#fff', paddingVertical: 13, paddingHorizontal: 14, marginBottom: 8,
  },
  checkRowOn: { borderColor: colors.sage300, backgroundColor: colors.sage50 },
  checkbox: {
    height: 22, width: 22, borderRadius: 7, borderWidth: 2, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  checkboxOn: { borderColor: colors.sage500, backgroundColor: colors.sage500 },
});
