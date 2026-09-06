import type { Config } from 'tailwindcss';

/**
 * Design language: minimal + warm + dignified.
 * White / warm neutral / soft green / muted accent. Lots of whitespace.
 * Explicitly avoided: sensational "save her" red, cancer ribbons,
 * hospital stock photography, anything that makes Sabiha look like a patient.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:   '#FDFAF5',
        cream:   '#F7F1E8',
        shell:   '#EFE7DB',
        ink:     '#2B2A27',
        muted:   '#7A736A',
        faint:   '#A79E93',
        line:    '#E6DDCF',
        sage: {
          50:  '#F2F7F3',
          100: '#E1EDE4',
          200: '#C4DACB',
          300: '#9FC0A9',
          400: '#7BA489',
          500: '#5E8A6D',
          600: '#4A7058',
          700: '#3B5947',
          800: '#2F4739',
          900: '#26382D',
        },
        blush: {
          50:  '#FDF5F4',
          100: '#F9E7E4',
          200: '#F0CDC8',
          300: '#E2A9A2',
          400: '#D08780',
          500: '#BC6A63',
          600: '#9E534D',
        },
        honey: {
          100: '#FBF1DC',
          300: '#EBD3A0',
          500: '#C9A45C',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        bn: ['var(--font-hind)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,42,39,0.04), 0 8px 24px -12px rgba(43,42,39,0.12)',
        lift: '0 2px 6px rgba(43,42,39,0.05), 0 24px 48px -24px rgba(43,42,39,0.22)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'breathe': {
          '0%,100%': { transform: 'scale(1)',    opacity: '0.9' },
          '50%':     { transform: 'scale(1.04)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'breathe': 'breathe 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
