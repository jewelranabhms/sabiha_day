# Roadmap

Phases 1–3 from the original design are **built**. What follows is what is
left, in the order it should happen.

---

## ✅ Phase 1 — Public website (done)

Home · About Sabiha · Write a message · Moderation queue · Message wall ·
Updates · Treatment timeline · Donation section with transparency ·
Privacy page · Bangla-first typography · responsive, self-hosted fonts.

## ✅ Phase 2 — The app (done)

Welcome · Login · PIN lock · Home (greeting → mood → little things →
messages → journal) · Journal · Messages + random kind word · Dua & Dhikr ·
Prayer · Treatment · Mood · Little victories.

Ships twice from one design: as a phone-framed browser preview at `/day`
(so the family can feel it today) and as a real Expo / React Native app in
`app/` (19 screens) for the APK.

## ✅ Phase 3 — Memories & backup (done)

Visitors · People & Memories · Photos · Voice diary · Important contacts ·
My Journey timeline · Notifications preferences · Journey Book (PDF, web +
mobile) · full JSON/Markdown export · automatic cloud sync.

---

## 🔜 Now — before anything goes live

These are content and infrastructure, not features.

| # | Task | Where | Owner |
|---|---|---|---|
| 1 | **Add her real photo** | replace `website/public/sabiha.jpg` | family |
| 2 | **Real bKash / Nagad / Rocket numbers** | `website/lib/site.ts` → `donation.channels` | family |
| 3 | **Real fund target** | Admin → Donations → Fund target | family |
| 4 | **Batch + college details** | Admin → Settings → Public profile | family |
| 5 | Create the Supabase project and run the three SQL files | `database/` | dev |
| 6 | Create the three auth users and link `app_users.auth_id` | Supabase → Auth | dev |
| 7 | Set `ADMIN_PASSWORD`, `SESSION_SECRET`, `SABIHA_PASSWORD` | Vercel env | dev |
| 8 | Delete all demo content | Admin → each tab | family |
| 9 | Add app icons + splash (`app/assets/*.png`) | `app/app.json` | dev |
| 10 | First `eas build -p android --profile preview` → install the APK | `app/` | dev |

> Until #1 and #2 are done the site is publishable but should not be shared —
> the portrait is a placeholder and the donation numbers are `01XXXXXXXXX`.

---

## 🔧 Soon — hardening

Things that are correct today at family scale and need work at public scale.

| Item | Why | Rough effort |
|---|---|---|
| **Rate limiting** on `POST /api/messages` and `/api/donations` | The site will be shared widely; a single script could fill the moderation queue. Add a per-IP token bucket (Upstash Redis or a Supabase table with a timestamp). | S |
| **Honeypot / turnstile** on the message form | Cheap bot deterrence that costs real users nothing. | XS |
| **Realtime on `messages`** | Supabase Realtime → the app badge updates the moment a message is approved, and `notifyNewMessage()` fires. The function already exists in `app/src/services/notifications.ts`. | S |
| **Push notification delivery** | Today scheduling is local to the device. For "Tomorrow — Chemotherapy" to survive a phone restart reliably, add Expo push tokens + a scheduled edge function. | M |
| **Signed-URL caching in the app** | `PhotosScreen` requests a signed URL per image on every focus. Cache them for their lifetime. | XS |
| **Image resizing** | Upload originals are stored as-is. Generate a thumbnail in a Supabase edge function or with `next/image` + a loader. | S |
| **Audit log** | A small `moderation_log` table: who approved/rejected what, when. Worth having for a fundraising page. | S |
| **Tests** | The privacy model deserves tests more than the UI does: a suite asserting that `family_medical` cannot select from `journal_entries`, that `/api/messages` always creates `pending`, and that `detectHardDay()` never produces medical text. | M |
| **Backup verification** | A monthly job that exports everything to a JSON blob in a separate bucket, so a Supabase mistake is recoverable. | S |
| **Voice transcription** | The `transcript` column exists and the UI accepts manual text. Optional: Whisper via an edge function, run only on demand. | M |

---

## 💭 Later — only if she wants them

Nothing here should be built before asking.

* **A shared memory book for the family** — she chooses specific entries to
  release; everything else stays locked. Export already proves the mechanism.
* **Letters to the future** — write something now, deliver it on a date.
* **A "how I'm doing" one-tap signal to the family** — a single emoji, nothing
  more, and only if she opts in. Careful: this is the shortest path to making
  the app feel like a monitoring tool.
* **Classmate notes archive** — the batch already sends messages; a curated
  keepsake volume at the end of treatment.
* **Bangla voice input** for the journal (system keyboard dictation works
  today).
* **i18n** — English UI alongside Bangla, for relatives abroad.
* **Offline-first** — the journal should work on a train and sync later.
  Supabase + a local queue; the schema already supports it.

---

## Explicitly never

* ❌ Public comments, replies or reactions
* ❌ A visible "progress against cancer" percentage
* ❌ Streaks of any kind
* ❌ Storing payment PINs, passwords, OTPs or card data
* ❌ Giving family or medical admins journal access by default
* ❌ Red ribbons, hospital stock photos, "বাঁচান" framing
* ❌ Turning this into a multi-patient platform

If a request arrives that belongs on this list, the answer is no — and the
reason is written down in [`docs/PRIVACY.md`](PRIVACY.md) §5.

---

## Suggested next session

1. Family sends the photo + the three mobile numbers → 10 minutes of edits,
   the site becomes real.
2. Create the Supabase project together, run the SQL, watch the same site
   read from Postgres with zero code changes.
3. Build the preview APK and put it on her phone.
4. Then decide about the hardening list — rate limiting first, because that
   is the one that bites the day the link gets shared.
