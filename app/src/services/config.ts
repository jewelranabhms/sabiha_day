/**
 * Content configuration for the mobile app.
 * Mirrors `website/lib/site.ts` so both products speak the same language.
 */

export const config = {
  appName: "Sabiha's Day",
  tagline: 'One day at a time.',
  welcomeLine: 'আজ শুধু আজকের দিনটা।',
};

export const moods = [
  { value: 5, emoji: '😊', label: 'ভালো' },
  { value: 4, emoji: '🙂', label: 'মোটামুটি ভালো' },
  { value: 3, emoji: '😐', label: 'স্বাভাবিক' },
  { value: 2, emoji: '😔', label: 'মন খারাপ' },
  { value: 1, emoji: '😣', label: 'খুব কঠিন' },
] as const;

export const littleThings = [
  { id: 'prayer', label: 'নামাজ', emoji: '🕌' },
  { id: 'dua', label: 'দোয়া', emoji: '🤲' },
  { id: 'dhikr', label: 'যিকির', emoji: '📿' },
  { id: 'water', label: 'পানি', emoji: '💧' },
  { id: 'rest', label: 'বিশ্রাম', emoji: '🌙' },
  { id: 'sun', label: 'রোদে বসা', emoji: '☀️' },
] as const;

export const prayers = [
  { id: 'fajr', bn: 'ফজর', en: 'Fajr' },
  { id: 'dhuhr', bn: 'যোহর', en: 'Dhuhr' },
  { id: 'asr', bn: 'আসর', en: 'Asr' },
  { id: 'maghrib', bn: 'মাগরিব', en: 'Maghrib' },
  { id: 'isha', bn: 'এশা', en: 'Isha' },
] as const;

export const morningDhikr = ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar'] as const;
export const DHIKR_TARGET = 33;

export const categories: Record<string, { emoji: string; label: string }> = {
  dua: { emoji: '🤲', label: 'দোয়া' },
  love: { emoji: '❤️', label: 'ভালোবাসা' },
  courage: { emoji: '🌱', label: 'সাহস' },
  hope: { emoji: '🌈', label: 'আশার কথা' },
  support: { emoji: '🫂', label: 'পাশে থাকার কথা' },
  personal: { emoji: '💌', label: 'ব্যক্তিগত বার্তা' },
};

export const relationships = [
  'Family', 'Friends', 'Teachers', 'Doctors', 'Classmates', 'Others',
] as const;

export const notifications = [
  { key: 'morning', emoji: '🌸', text: 'আজকের দিনটা শুরু করি?', hour: 8, minute: 0 },
  { key: 'newMessage', emoji: '💌', text: 'আপনার জন্য নতুন একটি বার্তা এসেছে।' },
  { key: 'dua', emoji: '🤲', text: 'আজকের দোয়া পড়েছেন?', hour: 6, minute: 30 },
  { key: 'victory', emoji: '🌱', text: 'আজকের little victory লিখবেন?', hour: 21, minute: 0 },
  { key: 'treatment', emoji: '🏥', text: 'Tomorrow — Chemotherapy' },
] as const;

/**
 * The Easter egg.
 * When a journal entry sounds like a hard day, the app never responds with
 * medical advice — only this, then (if she asks) one kind message from someone.
 */
export const hardDay = {
  triggerWords: [
    'খারাপ লাগছে', 'খুব খারাপ', 'ভয় লাগছে', 'কান্না', 'একাকী', 'একা লাগছে',
    'পারছি না', 'হতাশ', 'ক্লান্ত', 'ব্যথা', 'sad', 'scared', 'alone',
    'tired', 'hopeless', "can't", 'cry',
  ],
  message: 'আজ তোমাকে কিছু করতে হবে না। শুধু আজকের দিনটা পার করো। ❤️',
  cta: '✨ আমার জন্য একটা ভালো কথা দেখাও',
};

export function detectHardDay(text: string): boolean {
  const t = text.toLowerCase();
  return hardDay.triggerWords.some((w) => t.includes(w.toLowerCase()));
}

/**
 * The core UX rule: the app never opens on illness.
 * Used in tests / review to make sure nothing clinical leaks onto Home.
 */
export const forbiddenOnHome = ['cancer', 'chemotherapy', 'disease', 'রোগ', 'ক্যান্সার'];
