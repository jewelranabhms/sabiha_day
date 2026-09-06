# 🌸 Sabiha's Journey · 🌱 Sabiha's Day

> **The website carries the love of everyone.
> The app carries Sabiha through each day.**

A three-part system built for one person:

| | | |
|---|---|---|
| 🌸 **Sabiha's Journey** | Public website | *Everyone can leave a little love.* |
| 🌱 **Sabiha's Day** | Private app (Expo / React Native + a browser preview) | *One day at a time.* |
| ◈ **Sabiha Admin** | Moderation dashboard | *Messages · Updates · Treatment · Donations* |

The bridge between them is a single table: **`messages`**. A stranger writes on
the website → an admin approves → the same words arrive in Sabiha's app as
"বার্তা".

---

## The one rule this whole codebase obeys

> ### “Don't make Sabiha feel like a patient.”

Open the app and the first thing she sees is **not** cancer, chemotherapy or
disease. It is:

```
সুপ্রভাত, Sabiha ❤️
আজ: রবিবার, ৩০ আগস্ট
────────────────────
আজ কেমন লাগছে?
😊 🙂 😐 😔 😣
```

Treatment exists in the app — but it is never her identity. There is no
"Treatment" tab in the bottom navigation. It lives inside **আরও** ("More"),
reachable but never the front door.

The second rule, equally hard:

> ### PUBLIC WEBSITE ≠ SABIHA'S PRIVATE LIFE

Enforced at the **database** level with Row Level Security, not just in the UI.
See [`database/policies.sql`](database/policies.sql) and
[`/privacy`](website/app/(site)/privacy/page.tsx).

---

## Quick start (2 minutes, no accounts needed)

```bash
npm install          # installs the website workspace
npm run dev          # http://localhost:3000
```

That's it. The system starts with a **local file-backed store**
(`website/data/db.json`) pre-loaded with gentle demo content, so every screen
is explorable immediately — no Supabase account required.

### Demo logins (development only)

| | URL | Credential |
|---|---|---|
| ◈ Admin dashboard | `/admin` | password `sabiha-admin-2026` |
| 🌱 Sabiha's Day | `/day` | `sabiha@example.com` / `sabiha2026` |

> In production both are refused unless `ADMIN_PASSWORD` / `SABIHA_PASSWORD`
> are set in the environment. See [`.env.example`](.env.example).

### Reset the demo data

```bash
npm run seed
```

---

## What's in the box

### 🌸 Public website — `website/app/(site)/`

| Route | Screen |
|---|---|
| `/` | Landing — Journey → **সাবিহাকে ভালো কিছু বলুন** → Latest Update → Messages → Treatment Journey → পাশে থাকুন → About |
| `/write` | ❤️ সাবিহাকে লিখুন — the primary CTA. Name, message, 6 categories, anonymous option. Always lands as `pending`. |
| `/messages` | Message Wall — approved only, filterable by category, paginated with "আরও দেখুন" |
| `/journey` | Treatment Journey timeline + all published updates |
| `/donate` | bKash · Nagad · Rocket, copy-to-clipboard, How to Donate, transparent fund progress, donor report form |
| `/about` | Who is Sabiha? — deliberately short, no medical detail |
| `/privacy` | What is public, what is hers, who can see what |

The homepage order is intentional: she is introduced **before** anyone is asked
for anything.

### 🌱 Sabiha's Day — `website/app/(app)/day/` + `app/` (Expo)

Every screen from the design, in both the browser preview and the real
React Native app:

| # | Screen | Notes |
|---|---|---|
| 01 | Welcome | "One day at a time. আজ শুধু আজকের দিনটা।" |
| 02 | **Home** | greeting → mood → today's little things → messages for you → আজকের কথা |
| 03 | আজকের কথা | Private journal. One entry per day, editable. date · time · mood · text · photo · voice |
| 04 | Messages | Grouped আজ / গতকাল / month + **✨ আজ আমাকে একটা ভালো কথা বলো** (random approved message) |
| 05 | Dua & Dhikr | Morning dhikr counters, Today's Dua, My Favourite Dua |
| 06 | Prayer | 5 prayers, last-7-days dots. **No streaks. "Missed" ≠ failure.** |
| 07 | Treatment | Current stage, next appointment, Doctor's Notes (private), timeline — plus an explicit "this app gives no medical advice" notice |
| 08 | আজ কে এসেছিল? | Visitors → becomes a memory timeline over time |
| 09 | Little Victories | The emotional centre. "+ আজকের ছোট্ট জয়" |
| 10 | People & Memories | Family · Friends · Teachers · Doctors · Classmates · Others |
| 11 | Photos | Private album, month-grouped. Never published. |
| 12 | Voice Diary | Record → cloud (private bucket) → optional transcript |
| 13 | Important Contacts | One-tap call. Not emergency medical advice. |
| 14 | My Journey | Everything in one filterable timeline |
| 15 | Settings | Profile · Notifications · Privacy · Journal Lock (PIN) · Backup · Export · Delete Account |
| — | 📖 Journey Book | "Sabiha's Day — Volume 01", print-ready A4 → PDF |

#### The Easter egg 🤍

When a journal entry contains words like *"আজ খুব খারাপ লাগছে"*, the app does
**not** respond with advice, statistics or anything medical. It says one thing:

> “আজ তোমাকে কিছু করতে হবে না। শুধু আজকের দিনটা পার করো। ❤️”

…and then, only if she taps it, shows one kind message somebody else sent.
Implemented in [`lib/queries.ts → detectHardDay()`](website/lib/queries.ts) and
[`components/ComfortCard.tsx`](website/components/ComfortCard.tsx).

### ◈ Admin dashboard — `website/app/admin/`

```
Dashboard      Messages 126 · Pending 14 · Updates 3 · Donations ৳XX,XXX
──────────────────────────────────────────────────────────────────────
[ Messages ] [ Updates ] [ Treatment ] [ Donations ]
[ Sabiha's Journal ]  ← deliberately empty, and says why
[ Settings ]
```

Moderation is the core: **Approve / Reject / Edit**. An approved message goes
to the website wall *and* the app in the same write.

---

## Architecture

```
                    ┌──────────────────────┐
                    │   PUBLIC WEBSITE     │
                    │   Sabiha's Journey   │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼──────────────────┐
             ↓                 ↓                  ↓
       Write to Sabiha   Treatment Updates    Donation report
             │                 │                  │
             ↓                 ↓                  ↓
       Moderation Queue   (admin only)      (manual verify)
             ↓
       status = approved
             │
             └──────────────┬───────────────┐
                            ↓               ↓
                   ┌──────────────────┐   ┌──────────────────┐
                   │    DATABASE      │   │  ADMIN DASHBOARD │
                   │ Supabase/Postgres│←──│ messages·updates │
                   │  + RLS policies  │   │ treatment·donations
                   └────────┬─────────┘   └──────────────────┘
                            ↓
                 ┌───────────────────┐
                 │ SABIHA'S DAY APP  │
                 │   Private Area    │
                 └─────────┬─────────┘
                           ↓
     Journal · Dua/Dhikr · Mood · Prayer · Visitors ·
     Little Victories · Memories · Photos · Voice · Journey
                           ↓
                     Cloud Backup
                           ↓
                📖 "Create My Journey Book" (PDF)
```

### Backend switching — one environment variable

The data layer is a single interface ([`lib/db/types.ts → Store`](website/lib/db/types.ts))
with two implementations:

| `DATA_SOURCE` | Implementation | When |
|---|---|---|
| `local` *(default)* | [`local-store.ts`](website/lib/db/local-store.ts) — atomic JSON file | dev, demo, preview |
| `supabase` | [`supabase-store.ts`](website/lib/db/supabase-store.ts) — Postgres + RLS | production |

Switching requires **no code changes** — only:

```bash
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

### Database — `database/`

| File | What it does |
|---|---|
| `schema.sql` | 20 tables + enums + indexes + triggers + the `journey_timeline` view |
| `policies.sql` | Row Level Security for every table + the two storage buckets |
| `seed.sql` | Gentle starting content (profile, timeline, updates, duas, messages) |

Tables: `app_users`, `sabiha_profile`, `messages`, `updates`,
`treatment_events`, `donations`, `fund_goal`, `journal_entries`,
`daily_checks`, `duas`, `dhikr_logs`, `favourite_duas`, `prayer_logs`,
`visitors`, `little_victories`, `memories`, `photos`, `voice_diaries`,
`contacts`, `app_settings`.

### Roles — only three

| Role | Can do |
|---|---|
| **sabiha** | journal, mood, dua, dhikr, prayer, memories, photos, voice, messages |
| **admin** | website, message moderation, updates, donations, treatment timeline |
| **family_medical** | treatment, health updates, appointments — **no journal access, ever** |

---

## Privacy

**Public** ✅ name · photo · basic introduction · approved messages ·
approved updates · verified donation totals

**Private** 🔒 journal · mood · voice diary · personal memories · private
photos · doctor's notes · detailed medical records · prayer & dhikr logs ·
visitors

The enforcement is layered, so a bug in one layer is not a leak:

1. **Postgres RLS** — `journal_entries` etc. are readable only where
   `user_id = me()`. There is deliberately **no** policy granting
   `family_medical` read access.
2. **Storage buckets** — `private-media` is non-public; paths are prefixed
   with the owner's user id and checked in the policy.
3. **Application** — every server action in
   [`app/(app)/day/actions.ts`](website/app/(app)/day/actions.ts) resolves the
   session first and scopes every query to it.
4. **Journal Lock** — an optional on-device PIN, scrypt-hashed.
5. **Export control** — she chooses what goes into the Journey Book. Medical
   detail is excluded **by default**.

Also, deliberately: **no payment PIN, password, OTP or card data is ever
stored anywhere.** Donations are reported and verified manually.

---

## Design language

Minimal + warm + dignified.

* white / warm neutral (`#FDFAF5`, `#F7F1E8`) / soft green (`#5E8A6D`) / muted blush (`#BC6A63`)
* Typography: **Hind Siliguri** (Bangla) + **Inter** (Latin) — self-hosted, no third-party font requests
* Generous whitespace, soft shadows, rounded corners
* Explicitly avoided ❌ excessive grief, "বাঁচান"-style sensationalism, red
  cancer imagery, hospital stock photography

Palette and tokens: [`website/tailwind.config.ts`](website/tailwind.config.ts) ·
[`app/src/theme.ts`](app/src/theme.ts)

---

## Folder structure

```
sabiha_day/
├── website/                    Next.js 15 · Tailwind · TypeScript
│   ├── app/
│   │   ├── (site)/             public website  ( / write messages journey donate about privacy )
│   │   ├── (app)/day/          Sabiha's Day — browser preview, phone-framed
│   │   │   ├── (private)/      auth + PIN gated screens
│   │   │   ├── login/ lock/ welcome/
│   │   │   └── actions.ts      every private write, session-scoped
│   │   ├── admin/              ◈ dashboard (login + (dashboard) group)
│   │   └── api/                messages · donations · day/upload · day/media · day/export
│   ├── components/
│   ├── lib/
│   │   ├── db/                 Store interface · local · supabase · types · seed
│   │   ├── auth.ts             HMAC sessions, scrypt PIN, admin password
│   │   ├── queries.ts          read helpers + detectHardDay()
│   │   ├── site.ts             ★ content config — edit this for day-to-day changes
│   │   └── format.ts           Bangla dates, numbers, relative days
│   ├── data/                   local JSON store + private uploads (gitignored)
│   ├── public/sabiha.jpg       ★ replace with her real photo
│   └── scripts/seed.mjs
│
├── app/                        🌱 Sabiha's Day — Expo / React Native
│   ├── App.tsx
│   └── src/
│       ├── screens/            19 screens, one per design spec
│       ├── components/ui.tsx   Screen · Card · Button · MoodPicker · CheckRow …
│       ├── services/           supabase · api · notifications · config
│       ├── navigation/         tabs (আজ জার্নাল বার্তা দোয়া আরও) + stack
│       └── theme.ts            same palette as the website
│
├── database/                   schema.sql · policies.sql · seed.sql
├── docs/                       ARCHITECTURE · SETUP · PRIVACY · ROADMAP
└── .env.example
```

---

## The three things you'll edit most

| What | Where |
|---|---|
| 🖼 **Her photo** | Replace `website/public/sabiha.jpg` (one file, appears everywhere). For the mobile app, upload to the `public-media` bucket and set `sabiha_profile.photo_url`. |
| 💳 **Donation numbers & fund target** | Numbers: `website/lib/site.ts` → `donation.channels`. Target: Admin → Donations → *Fund target*. |
| 📝 **Daily content** | Admin dashboard — never code. |

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Website | **Next.js 15** (App Router, RSC, Server Actions) | fast, SEO-friendly, free to deploy |
| UI | **Tailwind CSS** | rapid, consistent, tiny |
| App | **Expo / React Native** | one codebase → Android + iOS; an APK is enough to start |
| Backend | **Supabase** | Postgres + Auth + Storage + Realtime + RLS in one place; no separate server to build |
| Validation | **Zod** | one schema for every form and API route |
| Hosting | **Vercel** (website) · **Supabase** (data) · **EAS** (app) | free/low-cost through the whole development phase |

---

## Roadmap

**Phase 1 — website** ✅ built
Home · profile · write message · moderation · message wall · updates ·
treatment timeline · donation section · privacy page

**Phase 2 — app** ✅ built
Login · PIN lock · Home · Journal · Messages (+random) · Dua/Dhikr · Prayer ·
Mood · Little victories · Treatment timeline

**Phase 3 — memories & backup** ✅ built
Memories · Visitors · Photos · Voice diary · Notifications ·
Journey Book (PDF) · full export (JSON/Markdown) · advanced backup

**Still to do** — see [`docs/ROADMAP.md`](docs/ROADMAP.md):
real Supabase provisioning, push notification delivery, Expo EAS build for the
APK, transcription of voice notes, and replacing all placeholder content with
the family's real information.

---

## Docs

* [`docs/SETUP.md`](docs/SETUP.md) — local → Supabase → Vercel → Android APK, step by step
* [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the website, admin and app share one database
* [`docs/PRIVACY.md`](docs/PRIVACY.md) — the privacy model, threat by threat
* [`docs/ROADMAP.md`](docs/ROADMAP.md) — what's left, in order

---

## A note on why this exists

Thousands of people may be far away, but their words can stay close.

Everything in this repository is in service of one small thing: that when
Sabiha opens her phone on a hard morning, the first sentence she reads is
**“সুপ্রভাত, Sabiha ❤️”** — and not a single word about being ill.

Made with care, one day at a time. 🌱
