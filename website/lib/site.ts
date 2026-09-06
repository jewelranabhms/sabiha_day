/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SITE CONFIG — the only file you need to touch for day-to-day content.
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything here is PUBLIC-facing or demo content.
 *  Real, changing content (messages, updates, donations) lives in the
 *  database / admin dashboard — not in this file.
 *
 *  ▸ To replace Sabiha's photo: drop the file at
 *      website/public/sabiha.jpg
 *    (or change `photo` below to any path / URL).
 *
 *  ▸ To replace the mobile numbers: edit `donation.channels` below.
 *  ▸ Never put a bKash/Nagad PIN or password anywhere in this repo.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const site = {
  brand: {
    journey: "Sabiha's Journey",
    day: "Sabiha's Day",
    tagline: 'A journey of courage, hope & healing.',
    appTagline: 'One day at a time.',
  },

  profile: {
    name: 'সাবিহা',
    nameEn: 'Sabiha',
    photo: '/sabiha.jpg',
    headline: 'সরকারি হোমিওপ্যাথিক মেডিকেল কলেজ ও হাসপাতাল, মিরপুর, ঢাকার একজন শিক্ষার্থী।',
    college: 'Government Homeopathic Medical College & Hospital',
    collegeBn: 'সরকারি হোমিওপ্যাথিক মেডিকেল কলেজ ও হাসপাতাল',
    location: 'মিরপুর, ঢাকা',
    batch: '—', // e.g. 'Batch 22'
    bio: 'সাবিহা মেডিকেল কলেজের একজন শিক্ষার্থী। বই, গল্প আর বন্ধুদের হাসি তার পছন্দ। এই মুহূর্তে সে তার চিকিৎসা চালিয়ে যাচ্ছে — এবং প্রতিটা দিন একটু একটু করে এগিয়ে যাচ্ছে।',
    bioEn:
      'Sabiha is a student of medicine. She loves books, stories and the laughter of her friends. Right now she is going through treatment — and moving forward one day at a time.',
  },

  nav: [
    { href: '/', label: 'Journey' },
    { href: '/journey', label: 'Updates' },
    { href: '/messages', label: 'Messages' },
    { href: '/donate', label: 'Help Sabiha' },
    { href: '/about', label: 'About' },
  ],

  /** Donation — numbers are placeholders until the family confirms them. */
  donation: {
    intro:
      'সাবিহার চিকিৎসার এই সময়ে আপনার সহযোগিতা তার পরিবারের জন্য গুরুত্বপূর্ণ সহায়তা হতে পারে।',
    disclaimer:
      'সাবধানতা: কোনো payment PIN, password বা OTP কারও সঙ্গে শেয়ার করবেন না — এই ওয়েবসাইটের কেউ তা কখনো চাইবে না।',
    channels: [
      { id: 'bkash',  label: 'bKash',  type: 'Personal', number: '01XXXXXXXXX', note: 'Send Money' },
      { id: 'nagad',  label: 'Nagad',  type: 'Personal', number: '01XXXXXXXXX', note: 'Send Money' },
      { id: 'rocket', label: 'Rocket', type: 'Personal', number: '01XXXXXXXXX', note: 'Send Money' },
    ],
    fundLabel: 'Treatment Fund',
    /** Fallback target used only when no `fund_goal` row exists yet. */
    defaultTarget: 500000,
    howTo: [
      'bKash / Nagad / Rocket অ্যাপ খুলে "Send Money" নির্বাচন করুন।',
      'উপরের নম্বরে টাকা পাঠান।',
      'Transaction ID (TrxID) টি সংরক্ষণ করুন।',
      'নিচের ফর্মে আপনার নাম, পরিমাণ ও TrxID জানান — পরিবার যাচাই করে তালিকাভুক্ত করবে।',
    ],
    contactForVerification: 'family@example.com',
  },

  /** Message categories used by the public "write to Sabiha" form. */
  categories: [
    { id: 'dua',      emoji: '🤲', label: 'দোয়া',            en: 'Dua' },
    { id: 'love',     emoji: '❤️', label: 'ভালোবাসা',        en: 'Love' },
    { id: 'courage',  emoji: '🌱', label: 'সাহস',            en: 'Courage' },
    { id: 'hope',     emoji: '🌈', label: 'আশার কথা',        en: 'Hope' },
    { id: 'support',  emoji: '🫂', label: 'পাশে থাকার কথা',  en: 'Standing with you' },
    { id: 'personal', emoji: '💌', label: 'ব্যক্তিগত বার্তা', en: 'Personal' },
  ] as const,

  /** The gentle response shown when a journal entry sounds like a hard day. */
  hardDayResponse: {
    triggerWords: [
      'খারাপ লাগছে', 'খুব খারাপ', 'ভয় লাগছে', 'কান্না', 'একাকী', 'একা লাগছে',
      'পারছি না', 'হতাশ', 'ক্লান্ত', 'ব্যথা', 'sad', 'scared', 'alone',
      'tired', 'hopeless', "can't", 'cry',
    ],
    message: 'আজ তোমাকে কিছু করতে হবে না। শুধু আজকের দিনটা পার করো। ❤️',
    messageEn: "You don't have to do anything today. Just get through today. ❤️",
    cta: 'আমার জন্য একটা ভালো কথা দেখাও',
  },

  /**
   * The core UX principle of the private app:
   * "Don't make Sabiha feel like a patient."
   * These words are never shown on the app's home screen.
   */
  appForbiddenOnHome: ['cancer', 'chemotherapy', 'disease', 'রোগ', 'ক্যান্সার'],

  littleThings: [
    { id: 'prayer', label: 'নামাজ',   emoji: '🕌' },
    { id: 'dua',    label: 'দোয়া',    emoji: '🤲' },
    { id: 'dhikr',  label: 'যিকির',   emoji: '📿' },
    { id: 'water',  label: 'পানি',    emoji: '💧' },
    { id: 'rest',   label: 'বিশ্রাম',  emoji: '🌙' },
    { id: 'sun',    label: 'রোদে বসা', emoji: '☀️' },
  ],

  moods: [
    { value: 5, emoji: '😊', label: 'ভালো' },
    { value: 4, emoji: '🙂', label: 'মোটামুটি ভালো' },
    { value: 3, emoji: '😐', label: 'স্বাভাবিক' },
    { value: 2, emoji: '😔', label: 'মন খারাপ' },
    { value: 1, emoji: '😣', label: 'খুব কঠিন' },
  ],

  prayers: [
    { id: 'fajr',    label: 'Fajr',    bn: 'ফজর' },
    { id: 'dhuhr',   label: 'Dhuhr',   bn: 'যোহর' },
    { id: 'asr',     label: 'Asr',     bn: 'আসর' },
    { id: 'maghrib', label: 'Maghrib', bn: 'মাগরিব' },
    { id: 'isha',    label: 'Isha',    bn: 'এশা' },
  ],

  relationships: ['Family', 'Friends', 'Teachers', 'Doctors', 'Classmates', 'Others'],

  footer: {
    note: 'এই ওয়েবসাইটটি সাবিহার পরিবার ও তার বন্ধুরা যত্ন নিয়ে তৈরি করেছে।',
    privacy:
      'সাবিহার জার্নাল, মুড, ছবি ও ভয়েস ডায়েরি সম্পূর্ণ ব্যক্তিগত — সেগুলো কখনো এই ওয়েবসাইটে প্রকাশিত হয় না।',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/day', label: "Sabiha's Day" },
    ],
  },
} as const;

export type CategoryId = (typeof site.categories)[number]['id'];

export function categoryMeta(id: string) {
  return site.categories.find((c) => c.id === id) ?? site.categories[1];
}

export const currency = (n: number | string) =>
  '৳' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
