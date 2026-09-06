-- ═══════════════════════════════════════════════════════════════════════════
--  SABIHA'S JOURNEY  ·  SABIHA'S DAY
--  Supabase / PostgreSQL schema
-- ───────────────────────────────────────────────────────────────────────────
--  Run this in Supabase → SQL Editor, in this order:
--      1. schema.sql     (this file)
--      2. policies.sql   (Row Level Security)
--      3. seed.sql       (optional demo content)
--
--  Design rule that drives every table below:
--      PUBLIC  = name, photo, intro, approved messages, approved updates,
--                donation info
--      PRIVATE = journal, mood, voice diary, personal memories, private
--                photos, doctor notes, detailed medical records
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  create type message_status   as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_category as enum
    ('dua','love','courage','hope','support','personal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type update_type as enum
    ('general','health','treatment','chemotherapy','important');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visibility_level as enum ('public','family','private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum
    ('scheduled','ongoing','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_role as enum ('sabiha','admin','family_medical');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- PEOPLE / ROLES
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists app_users (
  id            uuid primary key default gen_random_uuid(),
  auth_id       uuid unique,                 -- references auth.users(id)
  email         text unique not null,
  display_name  text not null,
  role          app_role not null default 'family_medical',
  pin_hash      text,                        -- optional app lock, bcrypt/argon2
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table app_users is
  'Only three access levels exist: sabiha (everything private), admin (public site),
   family_medical (treatment + updates, NO journal access by default).';

-- ─────────────────────────────────────────────────────────────────────────
-- PUBLIC PROFILE
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists sabiha_profile (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Sabiha',
  photo_url   text,
  bio         text,
  batch       text,
  college     text,
  headline    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table sabiha_profile is
  'Public-facing only. No medical details belong in this table.';

-- ─────────────────────────────────────────────────────────────────────────
-- MESSAGES  (website → moderation queue → approved → website + app)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  message      text not null,
  category     message_category not null default 'love',
  anonymous    boolean not null default false,
  status       message_status not null default 'pending',
  moderator_note text,
  approved_at  timestamptz,
  approved_by  uuid references app_users(id),
  created_at   timestamptz not null default now()
);
create index if not exists messages_status_idx    on messages (status, created_at desc);
create index if not exists messages_category_idx  on messages (category);
comment on table messages is
  'There is no public comment system. Every message passes through moderation first.';

-- ─────────────────────────────────────────────────────────────────────────
-- UPDATES  (latest update card on the website)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists updates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content       text not null,
  update_type   update_type not null default 'general',
  published     boolean not null default false,
  published_at  timestamptz,
  notify_app    boolean not null default false,  -- sends "tomorrow: chemotherapy" style push
  created_by    uuid references app_users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists updates_published_idx on updates (published, published_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- TREATMENT EVENTS  (public journey timeline + private app timeline)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists treatment_events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  event_date   date not null,
  event_type   update_type not null default 'treatment',
  status       event_status not null default 'scheduled',
  visibility   visibility_level not null default 'public',
  created_at   timestamptz not null default now()
);
create index if not exists treatment_events_date_idx on treatment_events (event_date desc);
comment on table treatment_events is
  'visibility = public  → shown on the website timeline.
   visibility = private → shown only inside Sabiha''s Day (doctor notes etc.).';

-- ─────────────────────────────────────────────────────────────────────────
-- DONATIONS  (manually verified — never store PIN/password/OTP)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists donations (
  id                     uuid primary key default gen_random_uuid(),
  donor_name             text,
  amount                 numeric(12,2) not null check (amount >= 0),
  method                 text not null,                 -- bKash / Nagad / Rocket / Bank
  transaction_reference  text,
  note                   text,
  verified               boolean not null default false,
  verified_by            uuid references app_users(id),
  verified_at            timestamptz,
  created_at             timestamptz not null default now()
);
comment on table donations is
  'SECURITY: payment PIN, password, OTP or card data must NEVER be stored here.';

create table if not exists fund_goal (
  id          uuid primary key default gen_random_uuid(),
  target      numeric(12,2) not null default 0,
  label       text not null default 'Treatment Fund',
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
--  PRIVATE AREA — SABIHA'S DAY
--  Every table below is owned by a single user and is never public.
-- ═══════════════════════════════════════════════════════════════════════════

-- Journal ─────────────────────────────────────────────────────────────────
create table if not exists journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app_users(id) on delete cascade,
  entry_date  date not null default current_date,
  content     text not null,
  mood        smallint check (mood between 1 and 5),   -- 1 = very low, 5 = very good
  photo_url   text,
  voice_url   text,
  is_locked   boolean not null default true,           -- journal lock
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists journal_entries_user_date_idx
  on journal_entries (user_id, entry_date desc);
comment on table journal_entries is 'PRIVATE. Not readable by family/admin by default.';

-- Daily check-in (mood + "today's little things") ─────────────────────────
create table if not exists daily_checks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app_users(id) on delete cascade,
  check_date  date not null default current_date,
  mood        smallint check (mood between 1 and 5),
  little_things jsonb not null default '{}'::jsonb,
  -- e.g. {"prayer":true,"dua":true,"dhikr":false,"water":true,"rest":false}
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, check_date)
);

-- Dua & Dhikr ─────────────────────────────────────────────────────────────
create table if not exists duas (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  arabic       text,
  transliteration text,
  translation  text,
  category     text not null default 'today',  -- morning / evening / today / favourite
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists dhikr_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_users(id) on delete cascade,
  dhikr_id   uuid references duas(id) on delete set null,
  dhikr_name text not null,
  log_date   date not null default current_date,
  count      integer not null default 0,
  completed  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, dhikr_id, log_date, dhikr_name)
);

create table if not exists favourite_duas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_users(id) on delete cascade,
  dua_id     uuid references duas(id) on delete cascade,
  title      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- Prayer tracker (no guilt-inducing streaks: "missed" is not "failure") ───
create table if not exists prayer_logs (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references app_users(id) on delete cascade,
  log_date date not null default current_date,
  fajr     boolean not null default false,
  dhuhr    boolean not null default false,
  asr      boolean not null default false,
  maghrib  boolean not null default false,
  isha     boolean not null default false,
  unique (user_id, log_date)
);

-- Visitors: "আজ কে এসেছিল?" ──────────────────────────────────────────────
create table if not exists visitors (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references app_users(id) on delete cascade,
  name          text not null,
  relationship  text,
  visit_date    date not null default current_date,
  note          text,
  photo_url     text,
  created_at    timestamptz not null default now()
);
create index if not exists visitors_user_date_idx on visitors (user_id, visit_date desc);

-- Little Victories ────────────────────────────────────────────────────────
create table if not exists little_victories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_users(id) on delete cascade,
  v_date     date not null default current_date,
  content    text not null,
  photo_url  text,
  created_at timestamptz not null default now()
);
create index if not exists little_victories_user_date_idx
  on little_victories (user_id, v_date desc);

-- People & Memories ───────────────────────────────────────────────────────
create table if not exists memories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app_users(id) on delete cascade,
  title       text not null,
  description text,
  person_name text,
  relationship text,      -- family / friends / teachers / doctors / classmates / others
  memory_date date not null default current_date,
  photo_url   text,
  created_at  timestamptz not null default now()
);
create index if not exists memories_user_date_idx on memories (user_id, memory_date desc);

-- Photos ──────────────────────────────────────────────────────────────────
create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app_users(id) on delete cascade,
  caption     text,
  photo_url   text not null,
  photo_date  date not null default current_date,
  created_at  timestamptz not null default now()
);

-- Voice diary ─────────────────────────────────────────────────────────────
create table if not exists voice_diaries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_users(id) on delete cascade,
  v_date     date not null default current_date,
  audio_url  text not null,
  duration_s integer,
  transcript text,
  created_at timestamptz not null default now()
);

-- Important contacts ──────────────────────────────────────────────────────
create table if not exists contacts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references app_users(id) on delete cascade,
  name         text not null,
  relationship text,        -- family / doctor / hospital / trusted person
  phone        text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- App settings (notifications, export preferences) ───────────────────────
create table if not exists app_settings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references app_users(id) on delete cascade,
  notifications jsonb not null default '{
    "morning": true, "newMessage": true, "dua": true, "victory": true, "treatment": true
  }'::jsonb,
  export_include jsonb not null default '{
    "journal": true, "victories": true, "photos": true, "memories": true,
    "messages": true, "treatment": false, "voice": false
  }'::jsonb,
  updated_at    timestamptz not null default now()
);
comment on table app_settings is
  'Per-user preferences. `export_include.treatment` defaults to false: medical
   detail is left out of the Journey Book unless she explicitly turns it on.';

-- ─────────────────────────────────────────────────────────────────────────
-- AUTOMATIC updated_at
-- ─────────────────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'app_users','sabiha_profile','updates','journal_entries',
    'daily_checks','fund_goal','app_settings'
  ] loop
    execute format('drop trigger if exists %I on %I', t || '_updated_at', t);
    execute format('create trigger %I before update on %I
                    for each row execute function set_updated_at()',
                    t || '_updated_at', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- A view that powers the app's "My Journey" timeline in one query.
-- Private to the owning user via RLS on the underlying tables.
-- ─────────────────────────────────────────────────────────────────────────
create or replace view journey_timeline as
  select 'journal'   as kind, id, entry_date  as on_date, left(content, 120) as summary, mood::text as meta, user_id from journal_entries
  union all
  select 'victory',  id, v_date,      content,  null, user_id from little_victories
  union all
  select 'visitor',  id, visit_date,  name,     relationship, user_id from visitors
  union all
  select 'memory',   id, memory_date, title,    person_name, user_id from memories
  union all
  select 'voice',    id, v_date,      coalesce(transcript, '🎙️ voice diary'), null, user_id from voice_diaries
  union all
  select 'photo',    id, photo_date,  coalesce(caption, '📷 a memory'), null, user_id from photos;
comment on view journey_timeline is
  'One unified timeline of everything private — years from now this is the most valuable thing in the system.';
