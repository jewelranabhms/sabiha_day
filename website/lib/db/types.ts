/**
 * Shared entity types. These mirror `database/schema.sql` one-to-one
 * (camelCase here, snake_case in Postgres — the supabase store maps them).
 */

export type MessageStatus = 'pending' | 'approved' | 'rejected';
export type MessageCategory =
  | 'dua' | 'love' | 'courage' | 'hope' | 'support' | 'personal';
export type UpdateType =
  | 'general' | 'health' | 'treatment' | 'chemotherapy' | 'important';
export type Visibility = 'public' | 'family' | 'private';
export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type Role = 'sabiha' | 'admin' | 'family_medical';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  pinHash?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  photoUrl: string | null;
  headline: string | null;
  bio: string | null;
  batch: string | null;
  college: string | null;
  updatedAt: string;
}

export interface Message {
  id: string;
  name: string | null;
  message: string;
  category: MessageCategory;
  anonymous: boolean;
  status: MessageStatus;
  moderatorNote: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  updateType: UpdateType;
  published: boolean;
  publishedAt: string | null;
  notifyApp: boolean;
  createdBy: string | null;
  createdAt: string;
}

export interface TreatmentEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string; // yyyy-mm-dd
  eventType: UpdateType;
  status: EventStatus;
  visibility: Visibility;
  createdAt: string;
}

export interface Donation {
  id: string;
  donorName: string | null;
  amount: number;
  method: string;
  transactionReference: string | null;
  note: string | null;
  verified: boolean;
  createdAt: string;
}

export interface FundGoal {
  id: string;
  target: number;
  label: string;
}

/* ── private area ─────────────────────────────────────────────────────── */

export interface JournalEntry {
  id: string;
  userId: string;
  entryDate: string;
  content: string;
  mood: number | null;
  photoUrl: string | null;
  voiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCheck {
  id: string;
  userId: string;
  checkDate: string;
  mood: number | null;
  littleThings: Record<string, boolean>;
  note: string | null;
}

export interface PrayerLog {
  id: string;
  userId: string;
  logDate: string;
  fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean;
}

export interface DhikrLog {
  id: string;
  userId: string;
  dhikrName: string;
  logDate: string;
  count: number;
  completed: boolean;
}

export interface Dua {
  id: string;
  title: string;
  arabic: string | null;
  transliteration: string | null;
  translation: string | null;
  category: string; // morning | evening | today | favourite
  sortOrder: number;
}

export interface FavouriteDua {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface Visitor {
  id: string;
  userId: string;
  name: string;
  relationship: string | null;
  visitDate: string;
  note: string | null;
  photoUrl: string | null;
}

export interface Victory {
  id: string;
  userId: string;
  date: string;
  content: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  personName: string | null;
  relationship: string | null;
  memoryDate: string;
  photoUrl: string | null;
}

export interface Photo {
  id: string;
  userId: string;
  caption: string | null;
  photoUrl: string;
  photoDate: string;
}

export interface VoiceDiary {
  id: string;
  userId: string;
  date: string;
  audioUrl: string;
  durationS: number | null;
  transcript: string | null;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  userId: string;
  notifications: Record<string, boolean>;
  exportInclude: Record<string, boolean>;
  updatedAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  sortOrder: number;
}

/* ── store plumbing ───────────────────────────────────────────────────── */

export interface TableMap {
  app_users: AppUser;
  sabiha_profile: Profile;
  messages: Message;
  updates: Update;
  treatment_events: TreatmentEvent;
  donations: Donation;
  fund_goal: FundGoal;
  journal_entries: JournalEntry;
  daily_checks: DailyCheck;
  prayer_logs: PrayerLog;
  dhikr_logs: DhikrLog;
  duas: Dua;
  favourite_duas: FavouriteDua;
  visitors: Visitor;
  little_victories: Victory;
  memories: Memory;
  photos: Photo;
  voice_diaries: VoiceDiary;
  contacts: Contact;
  app_settings: AppSettings;
}

export type TableName = keyof TableMap;
export type Row<K extends TableName> = TableMap[K];

/**
 * The one abstraction both backends implement.
 * `local` → JSON file (dev / demo).  `supabase` → Postgres + RLS (production).
 */
export interface Store {
  readonly kind: 'local' | 'supabase';
  all<K extends TableName>(table: K): Promise<Row<K>[]>;
  get<K extends TableName>(table: K, id: string): Promise<Row<K> | null>;
  insert<K extends TableName>(table: K, row: Partial<Row<K>>): Promise<Row<K>>;
  update<K extends TableName>(table: K, id: string, patch: Partial<Row<K>>): Promise<Row<K> | null>;
  remove<K extends TableName>(table: K, id: string): Promise<boolean>;
}
