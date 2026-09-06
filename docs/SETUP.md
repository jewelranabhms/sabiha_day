# Setup — from this repository to a live system

Four stages. You can stop after any of them; each one is independently useful.

```
Stage 0  Run it locally (already working, no accounts)         ~2 min
Stage 1  Create the Supabase project                            ~20 min
Stage 2  Deploy the website to Vercel                           ~10 min
Stage 3  Build the Android APK with EAS                         ~30 min
```

---

## Stage 0 — Run locally

```bash
npm install
cp .env.example .env        # optional; sensible dev defaults exist without it
npm run dev                 # http://localhost:3000
```

Everything works against `website/data/db.json`. Demo logins are printed on
the two login screens (`/admin`, `/day`).

Reset at any time:

```bash
npm run seed
```

---

## Stage 1 — Supabase

### 1.1 Create the project

1. [supabase.com](https://supabase.com) → **New project**.
2. Pick a region close to Bangladesh (e.g. `ap-south-1` Mumbai) — it matters
   for latency on a slow connection.
3. Save the database password somewhere safe. You will not need it in code.

### 1.2 Run the SQL

In **SQL Editor**, run these three files **in this order**:

| Order | File | Notes |
|---|---|---|
| 1 | `database/schema.sql` | tables, enums, indexes, `journey_timeline` view |
| 2 | `database/policies.sql` | RLS + storage buckets |
| 3 | `database/seed.sql` | gentle starting content |

`policies.sql` ends with a sanity check query — the private tables should all
return `0` rows.

### 1.3 Create the storage buckets

`policies.sql` inserts the two bucket rows. If you prefer the dashboard:

* **Storage → New bucket → `public-media`** — ✅ Public
* **Storage → New bucket → `private-media`** — ❌ *not* public

The private bucket's policies require paths to start with the owner's user id:

```
private-media/{user_id}/voice/1725000000000.m4a
private-media/{user_id}/photos/1725000000001.jpg
```

### 1.4 Create the three accounts

**Authentication → Users → Add user** for each, with a real password and
"Auto Confirm User" enabled:

| Email | Role | Purpose |
|---|---|---|
| `sabiha@…` | `sabiha` | the private app |
| `admin@…` | `admin` | the website dashboard |
| `family@…` | `family_medical` | treatment + updates only |

Then link them to `app_users` — the commented-out block at the bottom of
`database/seed.sql` does exactly this:

```sql
insert into app_users (auth_id, email, display_name, role)
select id, email, 'Sabiha', 'sabiha'
  from auth.users where email = 'sabiha@example.com'
on conflict (email) do update set auth_id = excluded.auth_id;
```

> ⚠️ Without the `auth_id` link, RLS has nothing to match against and the
> private screens will appear empty. This is the single most common setup
> mistake.

### 1.5 Point the website at Supabase

In `.env` (and in Vercel later):

```bash
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # public, safe in the browser
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # SECRET — server-side only
```

* The **anon** key is what the mobile app uses; RLS does the protecting.
* The **service role** key bypasses RLS. It is only ever read by Next.js
  server code (`lib/db/supabase-store.ts`). Never put it in a client bundle,
  never commit it.

Restart and the website reads/writes Postgres. No code changed.

### 1.6 Point the mobile app at Supabase

```bash
cd app
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Only the anon key. The app signs in **as Sabiha**, so every query runs under
her session and RLS scopes it automatically.

---

## Stage 2 — Deploy the website (Vercel)

```bash
npm i -g vercel
vercel                 # first run: link the project
```

Or: push to GitHub → [vercel.com/new](https://vercel.com/new) → import.

**Vercel settings**

| Setting | Value |
|---|---|
| Root Directory | `website` |
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` (run from the **repo root**) |

**Environment variables** (Production *and* Preview):

```
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…
ADMIN_PASSWORD=…                # long, random — the dashboard depends on it
SESSION_SECRET=…                # openssl rand -hex 32
SABIHA_PASSWORD=…               # only if you use the web /day preview in prod
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

> 🔒 In production, `ADMIN_PASSWORD` and `SABIHA_PASSWORD` are **required**.
> Without them the login forms refuse every attempt — the demo passwords are
> disabled outside development on purpose.

### Local JSON store on Vercel?

Serverless filesystems are read-only, so `DATA_SOURCE=local` **cannot persist
writes** on Vercel. Use Supabase in production. The local store is for
development and for this preview.

---

## Stage 3 — The Android APK

```bash
cd app
npm install
npm i -g eas-cli
eas login
eas build:configure
```

`eas.json` (create it, or let `build:configure` generate one):

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ..."
      }
    },
    "production": { "autoIncrement": true }
  }
}
```

Then:

```bash
eas build -p android --profile preview
```

When it finishes you get a download link — that `.apk` installs directly on
her phone. No Play Store needed.

For development instead:

```bash
npx expo start          # scan the QR with the Expo Go app
```

> **Icons/splash**: placeholder assets ship in `app/assets/`
> (`icon.png`, `adaptive-icon.png`, `splash.png` — the sage-ring mark on warm
> paper), so `eas build` works out of the box. Swap in a designed mark whenever
> you like; same file names, 1024×1024.

---

## After you go live — the content checklist

| # | Task | Where |
|---|---|---|
| 1 | Replace the placeholder portrait with her real photo | `./scripts/set-photo.sh photo.jpg` — or upload `website/public/sabiha.jpg` straight on GitHub (see below) |
| 2 | Enter the real bKash / Nagad / Rocket numbers | `website/lib/site.ts` → `donation.channels` |
| 3 | Set the real fund target | Admin → Donations → *Fund target* |
| 4 | Fill in her batch and college | Admin → Settings → Public profile |
| 5 | Delete the demo messages / updates / donations | Admin → each tab → 🗑 |
| 6 | Confirm the treatment timeline dates with the family | Admin → Treatment |
| 7 | Add the real contacts (mother, doctor, hospital) | Sabiha's Day → ☎️ জরুরি যোগাযোগ |
| 8 | Turn on the journal PIN | Sabiha's Day → ⚙️ Settings → Journal Lock |
| 9 | Change `ADMIN_PASSWORD` and `SESSION_SECRET` | Vercel env |
| 10 | Turn on Supabase **daily backups** | Supabase → Database → Backups |

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Her photo won't arrive through chat attachment | Some environments deliver images to the agent as view-only content, never as a file. Three routes that always work: **(a)** upload it on GitHub — repository → branch `arena/01a075a7-sabiha-day` → `website/public/` → *Add file → Upload files*, name it `sabiha.jpg`, commit; **(b)** on whoever's machine has the repo: `./scripts/set-photo.sh photo.jpg`, commit, push; **(c)** swap the file on the deployment machine before/after deploying. The site only ever reads that one path. |
| Private screens empty after switching to Supabase | `app_users.auth_id` not linked to `auth.users` — see 1.4 |
| `DATA_SOURCE=supabase but Supabase env vars are missing` | `.env` not loaded; check it is in the **repo root** *and* in Vercel |
| Message submitted but nothing appears | That's correct — it's `pending`. Admin → Messages → Approve |
| Donation total doesn't move | Unverified reports don't count. Admin → Donations → ✓ Verify |
| Voice recording fails in the browser | Needs HTTPS or `localhost`, plus microphone permission |
| `/day/book` print looks clipped | Use Chrome/Edge; the print stylesheet flattens the phone frame automatically |
| Bangla renders as boxes | Font not loaded — the app self-hosts Hind Siliguri via `@fontsource`; on Expo it comes from `@expo-google-fonts/hind-siliguri` |
