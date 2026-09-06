/**
 * Seed content for the local JSON store — gentle, dignified demo data so the
 * site and the app are immediately explorable.
 *
 * In production Supabase is the source of truth; run `database/seed.sql`
 * (or the admin dashboard) instead.
 */

const now = new Date();
const day = (offset: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const stamp = (offset: number, h = 12) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

export const SABIHA_USER_ID = '00000000-0000-4000-8000-000000000001';
export const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000002';
export const FAMILY_USER_ID = '00000000-0000-4000-8000-000000000003';

export const seed = {
  app_users: [
    {
      id: SABIHA_USER_ID,
      email: 'sabiha@example.com',
      displayName: 'Sabiha',
      role: 'sabiha',
      pinHash: null,
      isActive: true,
      createdAt: stamp(-60),
    },
    {
      id: ADMIN_USER_ID,
      email: 'admin@example.com',
      displayName: 'Admin',
      role: 'admin',
      pinHash: null,
      isActive: true,
      createdAt: stamp(-60),
    },
    {
      id: FAMILY_USER_ID,
      email: 'family@example.com',
      displayName: 'Family / Medical',
      role: 'family_medical',
      pinHash: null,
      isActive: true,
      createdAt: stamp(-60),
    },
  ],

  sabiha_profile: [
    {
      id: '00000000-0000-4000-8000-000000000010',
      name: 'সাবিহা',
      photoUrl: '/sabiha.jpg',
      headline:
        'সরকারি হোমিওপ্যাথিক মেডিকেল কলেজ ও হাসপাতাল, মিরপুর, ঢাকার একজন শিক্ষার্থী।',
      bio: 'সাবিহা মেডিকেল কলেজের একজন শিক্ষার্থী। বই, গল্প আর বন্ধুদের হাসি তার পছন্দ।',
      batch: '—',
      college: 'Government Homeopathic Medical College & Hospital, Mirpur, Dhaka',
      updatedAt: stamp(-30),
    },
  ],

  messages: [
    {
      id: 'm-1',
      name: 'একজন বন্ধু',
      message: 'সাবিহা, তুমি একা নও। আমরা সবাই তোমার জন্য দোয়া করছি। প্রতিটা দিন তুমি আরেকটু শক্ত হচ্ছে — আমরা সেটা জানি।',
      category: 'support',
      anonymous: false,
      status: 'approved',
      moderatorNote: null,
      approvedAt: stamp(-6, 20),
      createdAt: stamp(-6, 18),
    },
    {
      id: 'm-2',
      name: null,
      message: 'আজকের দিনটা কঠিন হতে পারে। কিন্তু তুমি এর চেয়েও শক্ত।',
      category: 'courage',
      anonymous: true,
      status: 'approved',
      moderatorNote: null,
      approvedAt: stamp(-5, 21),
      createdAt: stamp(-5, 19),
    },
    {
      id: 'm-3',
      name: 'তানভীর',
      message: 'প্রতিদিন তোমার জন্য দোয়া করি। আল্লাহ তোমাকে সম্পূর্ণ শিফা দিন।',
      category: 'dua',
      anonymous: false,
      status: 'approved',
      moderatorNote: null,
      approvedAt: stamp(-4, 10),
      createdAt: stamp(-4, 9),
    },
    {
      id: 'm-4',
      name: 'কলেজের ব্যাচমেট',
      message: 'ক্লাসের নোট জমা আছে, চিন্তা করো না। ফিরে এলে সব একসাথে পড়ব। ❤️',
      category: 'love',
      anonymous: false,
      status: 'approved',
      moderatorNote: null,
      approvedAt: stamp(-3, 12),
      createdAt: stamp(-3, 11),
    },
    {
      id: 'm-5',
      name: null,
      message: 'ধীরে ধীরে, একদিন একদিন করে। তাড়াহুড়ো নেই।',
      category: 'hope',
      anonymous: true,
      status: 'approved',
      moderatorNote: null,
      approvedAt: stamp(-2, 9),
      createdAt: stamp(-2, 8),
    },
    {
      id: 'm-6',
      name: 'নুসরাত আপু',
      message: 'তোমার হাসিটা আমাদের সবচেয়ে প্রিয় জিনিস। আবার হাসবে, ইনশাআল্লাহ।',
      category: 'love',
      anonymous: false,
      status: 'approved',
      moderatorNote: null,
      approvedAt: stamp(-1, 20),
      createdAt: stamp(-1, 19),
    },
    {
      id: 'm-7',
      name: 'রিদওয়ান',
      message: 'আজ তোমার জন্য দোয়া করেছি। তুমি অনেক সাহসী।',
      category: 'dua',
      anonymous: false,
      status: 'approved',
      moderatorNote: null,
      approvedAt: stamp(0, 8),
      createdAt: stamp(0, 7),
    },
    /* a small moderation queue so the admin dashboard is demonstrable */
    {
      id: 'm-8',
      name: 'Anonymous',
      message: 'আমরা তোমার অপেক্ষায় আছি। ফিরে এসো তাড়াতাড়ি।',
      category: 'hope',
      anonymous: true,
      status: 'pending',
      moderatorNote: null,
      approvedAt: null,
      createdAt: stamp(0, 9),
    },
    {
      id: 'm-9',
      name: 'সুমাইয়া',
      message: 'সাবিহা, তোমার জন্য আজও দোয়া করেছি। সাহস রেখো।',
      category: 'dua',
      anonymous: false,
      status: 'pending',
      moderatorNote: null,
      approvedAt: null,
      createdAt: stamp(0, 10),
    },
    {
      id: 'm-10',
      name: null,
      message: 'চিন্তা কোরো না, সব ঠিক হয়ে যাবে। ওষুধ বদলালে ভালো হবে।',
      category: 'personal',
      anonymous: true,
      status: 'pending',
      moderatorNote: 'Medical speculation — needs review before approving.',
      approvedAt: null,
      createdAt: stamp(0, 11),
    },
  ],

  updates: [
    {
      id: 'u-1',
      title: "Today's Update",
      content:
        'আজ সাবিহার শারীরিক অবস্থা মোটামুটি স্থিতিশীল। আগামীকাল chemotherapy দেওয়ার পরিকল্পনা রয়েছে।',
      updateType: 'general',
      published: true,
      publishedAt: stamp(0, 20.5),
      notifyApp: false,
      createdBy: ADMIN_USER_ID,
      createdAt: stamp(0, 20),
    },
    {
      id: 'u-2',
      title: 'পরিকল্পনা',
      content:
        'আগামীকাল প্রথম chemotherapy দেওয়ার পরিকল্পনা রয়েছে। দোয়া করবেন।',
      updateType: 'treatment',
      published: true,
      publishedAt: stamp(-1, 19),
      notifyApp: true,
      createdBy: ADMIN_USER_ID,
      createdAt: stamp(-1, 18),
    },
    {
      id: 'u-3',
      title: 'ধন্যবাদ',
      content:
        'এতগুলো ভালো কথা পাঠানোর জন্য সবাইকে ধন্যবাদ। সাবিহা প্রতিদিন বার্তাগুলো পড়ে।',
      updateType: 'general',
      published: true,
      publishedAt: stamp(-4, 12),
      notifyApp: false,
      createdBy: ADMIN_USER_ID,
      createdAt: stamp(-4, 11),
    },
  ],

  treatment_events: [
    {
      id: 't-1',
      title: 'Diagnosis',
      description: 'চিকিৎসকদের পরামর্শে পরবর্তী ধাপ নির্ধারণ করা হয়েছে।',
      eventDate: day(-20),
      eventType: 'health',
      status: 'completed',
      visibility: 'public',
      createdAt: stamp(-20),
    },
    {
      id: 't-2',
      title: 'Treatment started',
      description: 'চিকিৎসা শুরু হয়েছে। পরিবার ও চিকিৎসকদের পর্যবেক্ষণে আছেন।',
      eventDate: day(-10),
      eventType: 'treatment',
      status: 'completed',
      visibility: 'public',
      createdAt: stamp(-10),
    },
    {
      id: 't-3',
      title: 'First Chemotherapy',
      description: 'আজ সাবিহার প্রথম chemotherapy দেওয়ার সিদ্ধান্ত নেওয়া হয়েছে।',
      eventDate: day(1),
      eventType: 'chemotherapy',
      status: 'scheduled',
      visibility: 'public',
      createdAt: stamp(-1),
    },
    {
      id: 't-4',
      title: 'Next step',
      description: 'চিকিৎসকের পরবর্তী পরামর্শের অপেক্ষায়।',
      eventDate: day(15),
      eventType: 'treatment',
      status: 'scheduled',
      visibility: 'public',
      createdAt: stamp(0),
    },
    {
      id: 't-5',
      title: "Doctor's Notes",
      description: 'ব্যক্তিগত নোট — শুধু সাবিহার অ্যাপে দেখা যাবে।',
      eventDate: day(0),
      eventType: 'health',
      status: 'ongoing',
      visibility: 'private',
      createdAt: stamp(0),
    },
  ],

  donations: [
    { id: 'd-1', donorName: 'নাম প্রকাশে অনিচ্ছুক', amount: 5000, method: 'bKash', transactionReference: 'BK7H2X9P1Q', note: null, verified: true, createdAt: stamp(-5, 14) },
    { id: 'd-2', donorName: 'তানভীর আহমেদ', amount: 2500, method: 'Nagad', transactionReference: 'NG4K8M2L7R', note: null, verified: true, createdAt: stamp(-4, 16) },
    { id: 'd-3', donorName: 'কলেজ ব্যাচ ২২', amount: 21000, method: 'bKash', transactionReference: 'BK9P3T5Y6U', note: 'পুরো ব্যাচের পক্ষ থেকে', verified: true, createdAt: stamp(-3, 11) },
    { id: 'd-4', donorName: 'সুমাইয়া', amount: 1000, method: 'Rocket', transactionReference: 'RK2V6N8B1C', note: null, verified: false, createdAt: stamp(-1, 18) },
  ],

  fund_goal: [
    { id: 'f-1', target: 500000, label: 'Treatment Fund' },
  ],

  /* ── private app data (demo) ─────────────────────────────────────────── */

  journal_entries: [
    {
      id: 'j-1',
      userId: SABIHA_USER_ID,
      entryDate: day(0),
      content: 'আজ সকালে জানালার পাশে বসে অনেকক্ষণ রোদ পোহালাম। মনটা হালকা লাগল।',
      mood: 4,
      photoUrl: null,
      voiceUrl: null,
      createdAt: stamp(0, 9),
      updatedAt: stamp(0, 9),
    },
    {
      id: 'j-2',
      userId: SABIHA_USER_ID,
      entryDate: day(-1),
      content: 'অনেকদিন পর বন্ধুদের সঙ্গে হাসলাম। হাসিটা মনে হচ্ছে ফিরে আসছে।',
      mood: 5,
      photoUrl: null,
      voiceUrl: null,
      createdAt: stamp(-1, 21),
      updatedAt: stamp(-1, 21),
    },
    {
      id: 'j-3',
      userId: SABIHA_USER_ID,
      entryDate: day(-2),
      content: 'আজ খুব খারাপ লাগছে। কিছু করতে ইচ্ছে করছিল না।',
      mood: 2,
      photoUrl: null,
      voiceUrl: null,
      createdAt: stamp(-2, 22),
      updatedAt: stamp(-2, 22),
    },
  ],

  daily_checks: [
    {
      id: 'c-1',
      userId: SABIHA_USER_ID,
      checkDate: day(0),
      mood: 4,
      littleThings: { prayer: true, dua: true, dhikr: false, water: true, rest: false },
      note: null,
    },
  ],

  prayer_logs: [
    { id: 'p-1', userId: SABIHA_USER_ID, logDate: day(0), fajr: true, dhuhr: true, asr: false, maghrib: false, isha: false },
  ],

  dhikr_logs: [
    { id: 'k-1', userId: SABIHA_USER_ID, dhikrName: 'SubhanAllah', logDate: day(0), count: 33, completed: true },
    { id: 'k-2', userId: SABIHA_USER_ID, dhikrName: 'Alhamdulillah', logDate: day(0), count: 12, completed: false },
    { id: 'k-3', userId: SABIHA_USER_ID, dhikrName: 'Allahu Akbar', logDate: day(0), count: 0, completed: false },
  ],

  duas: [
    {
      id: 'dua-1',
      title: "Today's Dua",
      arabic: 'اللَّهُمَّ قَوِّنِي وَصَبِّرْنِي',
      transliteration: 'Allahumma qawwinī wa ṣabbirnī',
      translation: 'হে আল্লাহ, আমাকে শক্তি ও ধৈর্য দিন।',
      category: 'today',
      sortOrder: 0,
    },
    {
      id: 'dua-2',
      title: 'শিফার দোয়া',
      arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي',
      transliteration: 'Allāhumma rabban-nās, adhibil-baʾsa, ishfi antash-Shāfī',
      translation: 'হে আল্লাহ, মানুষের প্রতিপালক, কষ্ট দূর করুন। আপনিই আরোগ্য দানকারী।',
      category: 'today',
      sortOrder: 1,
    },
    {
      id: 'dua-3',
      title: 'সকালের যিকির — SubhanAllah',
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubḥānAllāh',
      translation: 'আল্লাহ পবিত্র',
      category: 'morning',
      sortOrder: 0,
    },
    {
      id: 'dua-4',
      title: 'সকালের যিকির — Alhamdulillah',
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alḥamdulillāh',
      translation: 'সমস্ত প্রশংসা আল্লাহর',
      category: 'morning',
      sortOrder: 1,
    },
    {
      id: 'dua-5',
      title: 'সকালের যিকির — Allahu Akbar',
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allāhu Akbar',
      translation: 'আল্লাহ সর্বশ্রেষ্ঠ',
      category: 'morning',
      sortOrder: 2,
    },
    {
      id: 'dua-6',
      title: 'সহজ দোয়া',
      arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      transliteration: 'Ḥasbunallāhu wa niʿmal-wakīl',
      translation: 'আল্লাহই আমাদের জন্য যথেষ্ট, তিনি কত উত্তম কর্মবিধায়ক।',
      category: 'evening',
      sortOrder: 0,
    },
  ],

  favourite_duas: [],

  visitors: [
    { id: 'v-1', userId: SABIHA_USER_ID, name: 'আম্মু', relationship: 'Mom', visitDate: day(0), note: 'আমার সাথে অনেকক্ষণ ছিল।', photoUrl: null },
    { id: 'v-2', userId: SABIHA_USER_ID, name: 'নুসরাত', relationship: 'Friend', visitDate: day(0), note: 'ফুল নিয়ে এসেছিল।', photoUrl: null },
    { id: 'v-3', userId: SABIHA_USER_ID, name: 'ডা. রহমান', relationship: 'Doctor', visitDate: day(-1), note: 'Treatment নিয়ে কথা বলেছেন।', photoUrl: null },
  ],

  little_victories: [
    { id: 'lv-1', userId: SABIHA_USER_ID, date: day(0), content: 'আজ কঠিন একটা দিন পার করেছি।', photoUrl: null, createdAt: stamp(0, 21) },
    { id: 'lv-2', userId: SABIHA_USER_ID, date: day(-1), content: 'অনেকদিন পর বন্ধুদের সঙ্গে হাসলাম।', photoUrl: null, createdAt: stamp(-1, 20) },
    { id: 'lv-3', userId: SABIHA_USER_ID, date: day(-2), content: 'আজ নিজেকে একটু ভালো লেগেছে।', photoUrl: null, createdAt: stamp(-2, 19) },
  ],

  memories: [
    { id: 'mm-1', userId: SABIHA_USER_ID, title: 'প্রথম দিনের ক্লাস', description: 'কলেজের প্রথম দিন, সবার সঙ্গে পরিচয়।', personName: 'ব্যাচমেটরা', relationship: 'Classmates', memoryDate: day(-400), photoUrl: null },
    { id: 'mm-2', userId: SABIHA_USER_ID, title: 'বৃষ্টির দিন', description: 'ছাদে বসে বৃষ্টি দেখা, আর গরম চা।', personName: 'আম্মু', relationship: 'Family', memoryDate: day(-120), photoUrl: null },
  ],

  photos: [],

  voice_diaries: [],

  app_settings: [
    {
      id: 'set-1',
      userId: SABIHA_USER_ID,
      notifications: { morning: true, newMessage: true, dua: true, victory: true, treatment: true },
      exportInclude: { journal: true, victories: true, photos: true, memories: true, messages: true, treatment: false, voice: false },
      updatedAt: stamp(-1),
    },
  ],

  contacts: [
    { id: 'ct-1', userId: SABIHA_USER_ID, name: 'আম্মু', relationship: 'Family', phone: '01XXXXXXXXX', sortOrder: 0 },
    { id: 'ct-2', userId: SABIHA_USER_ID, name: 'ডা. রহমান', relationship: 'Doctor', phone: '01XXXXXXXXX', sortOrder: 1 },
    { id: 'ct-3', userId: SABIHA_USER_ID, name: 'হাসপাতাল', relationship: 'Hospital', phone: '01XXXXXXXXX', sortOrder: 2 },
    { id: 'ct-4', userId: SABIHA_USER_ID, name: 'নুসরাত', relationship: 'Trusted person', phone: '01XXXXXXXXX', sortOrder: 3 },
  ],
};

export type SeedShape = typeof seed;
