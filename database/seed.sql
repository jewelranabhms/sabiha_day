-- ═══════════════════════════════════════════════════════════════════════════
--  SABIHA SYSTEM — starting content
--  Run AFTER schema.sql and policies.sql.
--
--  Everything here is safe, gentle demo content. Replace or delete it as soon
--  as the family starts using the system for real.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── public profile ──────────────────────────────────────────────────────
insert into sabiha_profile (name, photo_url, headline, bio, batch, college)
values (
  'সাবিহা',
  '/sabiha.jpg',
  'সরকারি হোমিওপ্যাথিক মেডিকেল কলেজ ও হাসপাতাল, মিরপুর, ঢাকার একজন শিক্ষার্থী।',
  'সাবিহা মেডিকেল কলেজের একজন শিক্ষার্থী। বই, গল্প আর বন্ধুদের হাসি তার পছন্দ।',
  '—',
  'Government Homeopathic Medical College & Hospital, Mirpur, Dhaka'
)
on conflict do nothing;

-- ── fund goal ───────────────────────────────────────────────────────────
insert into fund_goal (target, label) values (500000, 'Treatment Fund')
on conflict do nothing;

-- ── treatment journey (public timeline) ─────────────────────────────────
insert into treatment_events (title, description, event_date, event_type, status, visibility) values
  ('Diagnosis',            'চিকিৎসকদের পরামর্শে পরবর্তী ধাপ নির্ধারণ করা হয়েছে।',        current_date - 20, 'health',       'completed', 'public'),
  ('Treatment started',    'চিকিৎসা শুরু হয়েছে। পরিবার ও চিকিৎসকদের পর্যবেক্ষণে আছেন।',   current_date - 10, 'treatment',    'completed', 'public'),
  ('First Chemotherapy',   'আজ সাবিহার প্রথম chemotherapy দেওয়ার সিদ্ধান্ত নেওয়া হয়েছে।', current_date + 1,  'chemotherapy', 'scheduled', 'public'),
  ('Next step',            'চিকিৎসকের পরবর্তী পরামর্শের অপেক্ষায়।',                        current_date + 15, 'treatment',    'scheduled', 'public'),
  -- private: only visible inside Sabiha's Day
  ('Doctor''s Notes',      'ব্যক্তিগত নোট — শুধু সাবিহার অ্যাপে দেখা যাবে।',              current_date,      'health',       'ongoing',   'private');

-- ── updates ─────────────────────────────────────────────────────────────
insert into updates (title, content, update_type, published, published_at, notify_app) values
  ('Today''s Update',
   'আজ সাবিহার শারীরিক অবস্থা মোটামুটি স্থিতিশীল। আগামীকাল chemotherapy দেওয়ার পরিকল্পনা রয়েছে।',
   'general', true, now(), false),
  ('পরিকল্পনা',
   'আগামীকাল প্রথম chemotherapy দেওয়ার পরিকল্পনা রয়েছে। দোয়া করবেন।',
   'treatment', true, now() - interval '1 day', true),
  ('ধন্যবাদ',
   'এতগুলো ভালো কথা পাঠানোর জন্য সবাইকে ধন্যবাদ। সাবিহা প্রতিদিন বার্তাগুলো পড়ে।',
   'general', true, now() - interval '4 days', false);

-- ── a few approved messages, so the wall is not empty ───────────────────
insert into messages (name, message, category, anonymous, status, approved_at) values
  ('একজন বন্ধু', 'সাবিহা, তুমি একা নও। আমরা সবাই তোমার জন্য দোয়া করছি। প্রতিটা দিন তুমি আরেকটু শক্ত হচ্ছে — আমরা সেটা জানি।', 'support',  false, 'approved', now() - interval '6 days'),
  (null,          'আজকের দিনটা কঠিন হতে পারে। কিন্তু তুমি এর চেয়েও শক্ত।',                                                    'courage',  true,  'approved', now() - interval '5 days'),
  ('তানভীর',      'প্রতিদিন তোমার জন্য দোয়া করি। আল্লাহ তোমাকে সম্পূর্ণ শিফা দিন।',                                            'dua',      false, 'approved', now() - interval '4 days'),
  ('কলেজের ব্যাচমেট', 'ক্লাসের নোট জমা আছে, চিন্তা করো না। ফিরে এলে সব একসাথে পড়ব। ❤️',                                          'love',     false, 'approved', now() - interval '3 days'),
  (null,          'ধীরে ধীরে, একদিন একদিন করে। তাড়াহুড়ো নেই।',                                                                'hope',     true,  'approved', now() - interval '2 days'),
  ('নুসরাত আপু',  'তোমার হাসিটা আমাদের সবচেয়ে প্রিয় জিনিস। আবার হাসবে, ইনশাআল্লাহ।',                                          'love',     false, 'approved', now() - interval '1 day'),
  ('রিদওয়ান',     'আজ তোমার জন্য দোয়া করেছি। তুমি অনেক সাহসী।',                                                              'dua',      false, 'approved', now());

-- ── duas & dhikr reference content ─────────────────────────────────────
insert into duas (title, arabic, transliteration, translation, category, sort_order) values
  ('Today''s Dua', 'اللَّهُمَّ قَوِّنِي وَصَبِّرْنِي', 'Allahumma qawwinī wa ṣabbirnī',
   'হে আল্লাহ, আমাকে শক্তি ও ধৈর্য দিন।', 'today', 0),
  ('শিফার দোয়া', 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي',
   'Allāhumma rabban-nās, adhibil-baʾsa, ishfi antash-Shāfī',
   'হে আল্লাহ, মানুষের প্রতিপালক, কষ্ট দূর করুন। আপনিই আরোগ্য দানকারী।', 'today', 1),
  ('সকালের যিকির — SubhanAllah',   'سُبْحَانَ اللَّهِ', 'SubḥānAllāh',     'আল্লাহ পবিত্র',            'morning', 0),
  ('সকালের যিকির — Alhamdulillah', 'الْحَمْدُ لِلَّهِ', 'Alḥamdulillāh',   'সমস্ত প্রশংসা আল্লাহর',     'morning', 1),
  ('সকালের যিকির — Allahu Akbar',  'اللَّهُ أَكْبَرُ',  'Allāhu Akbar',    'আল্লাহ সর্বশ্রেষ্ঠ',         'morning', 2),
  ('সহজ দোয়া', 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', 'Ḥasbunallāhu wa niʿmal-wakīl',
   'আল্লাহই আমাদের জন্য যথেষ্ট, তিনি কত উত্তম কর্মবিধায়ক।', 'evening', 0);

-- ═══════════════════════════════════════════════════════════════════════════
--  Accounts
--  Create the real Supabase Auth users first (Authentication → Add user),
--  then link them here by email. Only three roles exist.
-- ═══════════════════════════════════════════════════════════════════════════

-- Example — replace the emails, then run:
--
-- insert into app_users (auth_id, email, display_name, role)
-- select id, email, 'Sabiha', 'sabiha'
--   from auth.users where email = 'sabiha@example.com'
-- on conflict (email) do update set auth_id = excluded.auth_id;
--
-- insert into app_users (auth_id, email, display_name, role)
-- select id, email, 'Admin', 'admin'
--   from auth.users where email = 'admin@example.com'
-- on conflict (email) do update set auth_id = excluded.auth_id;
--
-- insert into app_users (auth_id, email, display_name, role)
-- select id, email, 'Family / Medical', 'family_medical'
--   from auth.users where email = 'family@example.com'
-- on conflict (email) do update set auth_id = excluded.auth_id;

-- ═══════════════════════════════════════════════════════════════════════════
--  Sanity check — the private tables must be empty on day one.
--  If any of these return rows before Sabiha has used the app, something
--  has been seeded that should not have been.
-- ═══════════════════════════════════════════════════════════════════════════
select 'journal_entries'  as tbl, count(*) from journal_entries
union all select 'daily_checks',      count(*) from daily_checks
union all select 'voice_diaries',     count(*) from voice_diaries
union all select 'photos',            count(*) from photos
union all select 'little_victories',  count(*) from little_victories
union all select 'pending_messages',  count(*) from messages where status = 'pending';
