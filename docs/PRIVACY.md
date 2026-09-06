# Privacy model

The most important document in this repository. Everything else is UI.

> ## PUBLIC WEBSITE ≠ SABIHA'S PRIVATE LIFE

---

## 1. What is public, what is hers

| ✅ Public (anyone, no login) | 🔒 Private (only Sabiha) |
|---|---|
| Name | Journal — "আজকের কথা" |
| Photo | Mood / how she is feeling |
| Basic introduction | Voice diary |
| **Approved** messages | Personal memories |
| **Published** updates | Private photos |
| Treatment timeline (visibility = `public`) | Doctor's notes (visibility = `private`) |
| Verified donation **totals** | Detailed medical records |
| | Prayer & dhikr logs |
| | Visitors — "আজ কে এসেছিল?" |
| | Little victories |
| | Important contacts |
| | Notification preferences |

Note the two qualifiers that do most of the work: **approved** and
**published**. Nothing reaches the public internet without a human deciding
it should.

---

## 2. The three roles

| Role | Website | Messages | Updates | Treatment | Donations | **Journal / mood / voice / photos** |
|---|---|---|---|---|---|---|
| `sabiha` | — | read approved | read | read (incl. private) | — | ✅ **everything** |
| `admin` | ✅ manage | ✅ moderate | ✅ publish | ✅ manage | ✅ verify | ❌ **none** |
| `family_medical` | — | — | ✅ publish | ✅ manage | — | ❌ **none** |

The family can keep the treatment timeline accurate and post updates.
**They cannot read her journal.** That is not an omission — it is the point.

`/admin/journal` exists as a page whose entire job is to explain this.

---

## 3. Five layers, so one bug is not a leak

### Layer 1 — Postgres Row Level Security (`database/policies.sql`)

Every private table gets policies of exactly this shape:

```sql
create policy "journal owner read"
  on journal_entries for select using (user_id = me());
```

where `me()` resolves the signed-in Supabase user through `app_users.auth_id`.

There is **deliberately no policy** that lets `family_medical` or `admin`
select from `journal_entries`, `daily_checks`, `voice_diaries`, `photos` or
`memories`. Absence of a policy means denial — RLS is default-deny.

The public tables are narrowed the same way:

```sql
create policy "messages public read approved only"
  on messages for select using (status = 'approved' or is_staff());
```

So even a raw `select * from messages` with the public anon key returns only
approved rows.

### Layer 2 — Storage buckets

```
public-media   → public: true      (her portrait, approved photos)
private-media  → public: false     (journal photos, voice notes)
```

Private paths must begin with the owner's user id, and the policy checks it:

```sql
using (bucket_id = 'private-media'
       and (storage.foldername(name))[1] = me()::text);
```

In the web preview the same idea is enforced by serving media only through
`/api/day/media/[name]`, which requires a signed-in **and unlocked** session,
with UUID file names as defence in depth.

### Layer 3 — Application

Every Server Action in `app/(app)/day/actions.ts` starts with:

```ts
const s = await me();   // redirects if not signed in; redirects if PIN-locked
```

…and every subsequent query filters on `s.userId`. `removeRow()` re-reads the
row before deleting to confirm ownership. `addPhoto()` / `addVoiceDiary()`
refuse any URL that is not from our own private media endpoint, so a
submitted URL can't be used to point a row at someone else's file.

### Layer 4 — Journal Lock (PIN)

Optional, scrypt-hashed, on top of the session. The session carries
`pinLocked`, so locking the app does not sign her out and does not leave her
data reachable from an unlocked phone.

### Layer 5 — Export control

Settings → *Export My Journal* lets her choose what goes into the Journey
Book. `treatment` and `voice` are **off by default**. The book's colophon
states plainly that publishing it is her decision alone.

---

## 4. Threats, and the answer to each

| Threat | Answer |
|---|---|
| Someone guesses the admin password | `ADMIN_PASSWORD` is required in production; comparison uses `timingSafeEqual`; sessions are HMAC-signed and expire in 7 days. And even a valid admin session **cannot read the journal** — Layer 1. |
| The service-role key leaks | It is server-side only, never imported by client code, never in the mobile bundle. Rotate it in Supabase → Settings → API. |
| A visitor spams the message form | Zod caps length at 600 chars, rejects links, and everything lands `pending` for a human to read. There is no rate-limit table yet — see ROADMAP. |
| Someone submits a donation report with a fake TrxID | It is created `verified: false` and contributes **nothing** to the public total until an admin verifies it. |
| A family member wants to read the journal | They can't, at any layer. If Sabiha ever wants to share something, she exports it herself. |
| The phone is borrowed | Journal Lock PIN. |
| A photo URL is guessed | UUID file names + a session-gated route + a non-public bucket. |
| Real journal data ends up in Git | `website/data/db.json` and `website/data/uploads/` are gitignored; `npm run seed` refuses to run when `DATA_SOURCE=supabase`. |
| Payment credentials are harvested | The system never asks for a PIN, password, OTP or card number, and the donations table has no column that could hold one. The donate page says so out loud. |

---

## 5. What the product refuses to do

These are decisions, not gaps.

* **No medical advice.** Not in the app, not in the Easter egg, not on the
  treatment screen. The screen says so in writing.
* **No streaks.** The prayer tracker shows seven quiet dots. A missed prayer
  is never rendered as a broken chain, and "missed" is never called failure.
* **No public grief.** The design brief bans sensational imagery, red cancer
  motifs, hospital stock photos and "বাঁচান"-style framing.
* **No diagnosis as identity.** The app never opens on illness. Treatment has
  no tab.
* **No engagement mechanics.** No likes, no counts of who read what, no
  notifications designed to create obligation. Every notification is an
  invitation and can be turned off.
* **No third-party requests.** Fonts are self-hosted. There is no analytics,
  no tracking pixel, no ad SDK.

---

## 6. Data retention & deletion

* **Delete Account** (Settings) wipes every private row belonging to her —
  journal, checks, prayers, dhikr, favourites, visitors, victories, memories,
  photos, voice, contacts, settings. Public content (approved messages,
  updates, the timeline) is left intact, because it is no longer only hers.
* Backups: enable Supabase **daily backups** (Database → Backups). Point-in-time
  recovery is worth turning on if the journal starts to matter as much as it
  will.
* Before deleting anything permanently, use **Export My Journal** — JSON or
  Markdown — and keep a copy somewhere offline.

---

## 7. If you change nothing else

When you add a feature to this system, ask one question first:

> **Could this ever make something private become public?**

If the answer isn't an immediate "no", write the Row Level Security policy
before you write the screen.
