# Architecture

Three front ends, one database, no custom backend server.

```
┌───────────────────────────┐   ┌───────────────────────────┐
│  🌸 PUBLIC WEBSITE        │   │  ◈ ADMIN DASHBOARD        │
│  Next.js · (site)         │   │  Next.js · /admin         │
│                           │   │                           │
│  /            landing     │   │  messages   approve/reject│
│  /write       ❤️ CTA      │   │  updates    publish       │
│  /messages    wall        │   │  treatment  timeline      │
│  /journey     timeline    │   │  donations  verify        │
│  /donate      bKash…      │   │  journal    (empty, on    │
│  /about  /privacy         │   │              purpose)     │
└────────────┬──────────────┘   └────────────┬──────────────┘
             │ POST /api/messages            │ Server Actions
             │ POST /api/donations           │ (session-gated)
             ↓                               ↓
        ┌────────────────────────────────────────────┐
        │   lib/db  —  the Store interface           │
        │   all · get · insert · update · remove     │
        ├────────────────────┬───────────────────────┤
        │  local-store.ts    │  supabase-store.ts    │
        │  JSON file         │  Postgres + RLS       │
        │  (dev / demo)      │  (production)         │
        └─────────┬──────────┴───────────┬───────────┘
                  │  DATA_SOURCE=local   │  =supabase
                  ↓                      ↓
        website/data/db.json      Supabase project
                                          ↑
                                          │ anon key
                                          │ + HER session
                                          │ → RLS scopes every query
                              ┌───────────┴──────────────┐
                              │  🌱 SABIHA'S DAY         │
                              │  Expo / React Native     │
                              │  (+ a phone-framed       │
                              │   browser preview at     │
                              │   /day for the family)   │
                              └──────────────────────────┘
```

---

## Why there is no backend server

Everything the system needs — Postgres, auth, file storage, realtime, and
row-level security — ships with Supabase. Adding an Express/Fastify layer
would only add a place for the privacy model to be implemented *wrong*.

Instead:

* **Public writes** (a message, a donation report) go through two tiny Next.js
  Route Handlers that validate with Zod and always create rows in the safest
  state — `pending` and `verified: false`.
* **Admin writes** are Next.js **Server Actions** gated by an HMAC-signed
  session cookie. They never run in the browser.
* **Private writes** are Server Actions too, but every one of them resolves the
  session first and scopes to it. In production the mobile app talks to
  Supabase directly under Sabiha's own session, and RLS does the scoping.

---

## The Store interface

`website/lib/db/types.ts`:

```ts
export interface Store {
  readonly kind: 'local' | 'supabase';
  all<K extends TableName>(table: K): Promise<Row<K>[]>;
  get<K extends TableName>(table: K, id: string): Promise<Row<K> | null>;
  insert<K extends TableName>(table: K, row: Partial<Row<K>>): Promise<Row<K>>;
  update<K extends TableName>(table: K, id: string, patch: Partial<Row<K>>): Promise<Row<K> | null>;
  remove<K extends TableName>(table: K, id: string): Promise<boolean>;
}
```

`TableName` is a union of the 20 table names, and `TableMap` gives each one a
strongly-typed row shape. So `db().all('journal_entries')` returns
`JournalEntry[]` — a typo in a table name is a compile error, not a runtime
surprise.

The Supabase implementation converts camelCase ⇄ snake_case automatically,
with an override table for the few deliberate mismatches
(`little_victories.date` → `v_date`, `voice_diaries.date` → `v_date` — chosen
because `date` is a reserved-ish word that reads badly as a column).

### The local store

`local-store.ts` keeps an in-memory copy, writes atomically
(`db.json.tmp` → `rename`), and coalesces bursts with a 60 ms debounce.
The file is **gitignored** — real journals must never end up in version
control.

It exists for three reasons: the preview in this sandbox has no Supabase
project, the family can evaluate the whole product before creating any
accounts, and offline development never blocks on a network.

---

## The message pipeline (the bridge)

This is the single flow that connects all three products:

```
Visitor types on /write
        ↓
POST /api/messages
        ↓  Zod validation  ·  rejects links  ·  caps at 600 chars
messages.status = 'pending'          ← nothing is public yet
        ↓
Admin → Messages → reads it
        ↓  [Approve]  [Reject]  [Edit]
messages.status = 'approved'
        ↓                    ↓
Website Message Wall    Sabiha's Day → 💌 বার্তা
                              ↓
                     ✨ random kind word
```

There is no public comment system, no replies, no like counts, no threading.
A message is a gift, not a conversation.

The same shape applies to updates:

```
Admin writes an update
        ↓
updates.published = true
        ↓                ↓                    ↓
 Website            App timeline        Notification
 "Latest Update"    (treatment_events)  "Tomorrow — Chemotherapy"
```

---

## Data model

```
PUBLIC                          PRIVATE (owner-scoped, RLS-protected)
──────                          ─────────────────────────────────────
sabiha_profile                  journal_entries      date·mood·text·photo·voice
messages        (write: all /   daily_checks         mood + "little things"
                 read: approved) prayer_logs          5 booleans per day
updates         (read: published) dhikr_logs         counts + completions
treatment_events (visibility:    favourite_duas
                 public|family|  visitors             "আজ কে এসেছিল?"
                 private)        little_victories
donations       (staff only;     memories             people + relationship
                 totals public)  photos               private album
fund_goal                        voice_diaries        audio + transcript
duas            (reference data) contacts             one-tap call
app_users                        app_settings         notifications + export prefs
```

`journey_timeline` is a Postgres view that unions six of the private tables
into one ordered stream — it powers APP SCREEN 14 with a single query.
The TypeScript equivalent (`journeyTimeline()` in `app/src/services/api.ts`
and the `/day/journey` page) keeps the browser preview and the APK behaving
identically.

---

## Authentication

Two independent sessions, both HMAC-SHA256-signed JSON in `httpOnly` cookies:

| Cookie | Area | Lifetime | Credential |
|---|---|---|---|
| `sabiha_admin` | `/admin` | 7 days | `ADMIN_PASSWORD` |
| `sabiha_day` | `/day` | 30 days | email + password, then optional PIN |

The PIN is hashed with **scrypt** (`lib/auth.ts → hashPin`), never stored in
plain text, and the session carries a `pinLocked` flag — so locking the app
does not sign her out.

Comparison uses `timingSafeEqual` throughout.

In production both passwords **must** come from the environment; the
development fallbacks are disabled when `NODE_ENV === 'production'`.

On mobile the app uses Supabase Auth (`signInWithPassword`) with the session
persisted in AsyncStorage — that is what makes RLS work.

---

## Media

| | Web preview | Mobile app |
|---|---|---|
| Upload target | `POST /api/day/upload` → `website/data/uploads/` | `supabase.storage.from('private-media').upload()` |
| Read back | `GET /api/day/media/[name]` (session required) | `createSignedUrl()` (RLS + expiry) |
| Allowed types | jpeg/png/webp/gif, webm/ogg/mp3/m4a/wav/aac | same |
| Size cap | 8 MB | 8 MB |
| Path traversal | rejected (`/^[\w.-]+$/`, no `..`) | n/a (bucket paths) |

Voice recording uses `MediaRecorder` on the web and `expo-av` on mobile; both
cap the clip length so a forgotten recording cannot fill storage.

---

## The Journey Book

"Create My Journey Book" produces **Sabiha's Day — Volume 01**.

* **Web**: a print-typeset A4 page (`/day/book`) plus a stylesheet that
  flattens the phone frame and expands every nested scroll container, so
  `Ctrl/Cmd-P → Save as PDF` yields the whole volume.
* **Mobile**: the same content is rendered to HTML and handed to
  `expo-print` → a real PDF, then `expo-sharing`.

Going through the platform's text engine (rather than a PDF library) is
deliberate: Bangla is a complex script that needs proper shaping and
conjunct handling, which browsers and Android/iOS already do correctly.

Also available from Settings: raw **JSON** and readable **Markdown** exports
(`/api/day/export`).

---

## What is intentionally *not* here

* No public comments, replies, reactions or user accounts on the website.
* No payment gateway. Donations are reported and verified by a human.
* No analytics, no trackers, no third-party requests — fonts are self-hosted.
* No push-notification server yet; scheduling is local on the device.
* No multi-tenant anything. There is one Sabiha. The `user_id` columns exist
  so the schema is honest and so RLS can be written properly — not because
  this will ever become a platform.
