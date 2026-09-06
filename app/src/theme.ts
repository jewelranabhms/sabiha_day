/**
 * Design tokens for Sabiha's Day.
 * Identical palette to the website (`website/tailwind.config.ts`) so the two
 * products feel like one thing.
 */

export const colors = {
  paper: '#FDFAF5',
  cream: '#F7F1E8',
  shell: '#EFE7DB',
  ink: '#2B2A27',
  muted: '#7A736A',
  faint: '#A79E93',
  line: '#E6DDCF',

  sage50: '#F2F7F3',
  sage100: '#E1EDE4',
  sage200: '#C4DACB',
  sage300: '#9FC0A9',
  sage400: '#7BA489',
  sage500: '#5E8A6D',
  sage600: '#4A7058',
  sage700: '#3B5947',
  sage800: '#2F4739',
  sage900: '#26382D',

  blush50: '#FDF5F4',
  blush100: '#F9E7E4',
  blush200: '#F0CDC8',
  blush300: '#E2A9A2',
  blush400: '#D08780',
  blush500: '#BC6A63',
  blush600: '#9E534D',

  honey100: '#FBF1DC',
  honey300: '#EBD3A0',
  honey500: '#C9A45C',
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  full: 999,
} as const;

export const spacing = (n: number) => n * 4;

/** Bangla-first font stack. Hind Siliguri is bundled with the Expo app. */
export const fontFamily = {
  bn: 'HindSiliguri_400Regular',
  bnSemi: 'HindSiliguri_600SemiBold',
  bnBold: 'HindSiliguri_700Bold',
  bnLight: 'HindSiliguri_300Light',
  latin: 'Inter_400Regular',
  latinSemi: 'Inter_600SemiBold',
} as const;
