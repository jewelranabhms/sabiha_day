-- ═══════════════════════════════════════════════════════════════════════════
--  SABIHA SYSTEM — Row Level Security policies
--  Run AFTER schema.sql.
--
--  The whole privacy story lives here:
--    · the public website may only ever read approved / published rows
--    · nobody — not even family or a medical admin — may read the journal,
--      mood, voice diary or private photos through the API
--    · only the service role (server-side, secret key) bypasses RLS
-- ═══════════════════════════════════════════════════════════════════════════

alter table app_users          enable row level security;
alter table sabiha_profile     enable row level security;
alter table messages           enable row level security;
alter table updates            enable row level security;
alter table treatment_events   enable row level security;
alter table donations          enable row level security;
alter table fund_goal          enable row level security;
alter table journal_entries    enable row level security;
alter table daily_checks       enable row level security;
alter table duas               enable row level security;
alter table dhikr_logs         enable row level security;
alter table favourite_duas     enable row level security;
alter table prayer_logs        enable row level security;
alter table visitors           enable row level security;
alter table little_victories   enable row level security;
alter table memories           enable row level security;
alter table photos             enable row level security;
alter table voice_diaries      enable row level security;
alter table contacts           enable row level security;
alter table app_settings       enable row level security;

-- ── helpers ──────────────────────────────────────────────────────────────
create or replace function current_app_user()
returns app_users language plpgsql security definer stable as $$
begin
  return (select * from app_users where auth_id = auth.uid());
end $$;

create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from app_users
    where auth_id = auth.uid() and role in ('admin') and is_active
  );
$$;

create or replace function is_sabiha()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from app_users
    where auth_id = auth.uid() and role = 'sabiha' and is_active
  );
$$;

create or replace function is_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from app_users
    where auth_id = auth.uid() and role in ('admin','family_medical') and is_active
  );
$$;

create or replace function me()
returns uuid language sql security definer stable as $$
  select id from app_users where auth_id = auth.uid();
$$;

-- ═══════════════════════════════════════════════════════════════════════════
--  PUBLIC TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Profile: anyone can read, only admins can write.
create policy "profile public read"  on sabiha_profile for select using (true);
create policy "profile staff write"  on sabiha_profile for all    using (is_admin()) with check (is_admin());

-- Messages: the world can INSERT a message (it lands as 'pending').
-- The world can only SELECT approved ones. Only staff can moderate.
create policy "messages anyone can submit"
  on messages for insert
  with check (status = 'pending');

create policy "messages public read approved only"
  on messages for select
  using (status = 'approved' or is_staff());

create policy "messages staff moderate"
  on messages for update
  using (is_staff()) with check (is_staff());

create policy "messages staff delete"
  on messages for delete using (is_staff());

-- Updates: public read only when published.
create policy "updates public read published only"
  on updates for select using (published or is_staff());
create policy "updates staff write"
  on updates for all using (is_staff()) with check (is_staff());

-- Treatment events: public timeline shows only visibility = 'public'.
create policy "treatment public read"
  on treatment_events for select
  using (visibility = 'public' or is_staff() or is_sabiha());
create policy "treatment staff write"
  on treatment_events for all using (is_staff()) with check (is_staff());

-- Donations: totals are public, individual donor rows are staff-only.
create policy "donations staff read"  on donations for select using (is_staff());
create policy "donations staff write" on donations for all    using (is_staff()) with check (is_staff());

create policy "fund goal public read" on fund_goal for select using (true);
create policy "fund goal staff write" on fund_goal for all    using (is_staff()) with check (is_staff());

-- ═══════════════════════════════════════════════════════════════════════════
--  PRIVATE TABLES — owner only.
--  NOTE: there is deliberately NO policy that lets 'family_medical' read
--  journal_entries, daily_checks, voice_diaries, photos or memories.
--  If the family ever needs access it must be granted explicitly, per row,
--  by Sabiha herself.
-- ═══════════════════════════════════════════════════════════════════════════

-- Journal ─────────────────────────────────────────────────────────────────
create policy "journal owner read"
  on journal_entries for select using (user_id = me());
create policy "journal owner insert"
  on journal_entries for insert with check (user_id = me());
create policy "journal owner update"
  on journal_entries for update using (user_id = me()) with check (user_id = me());
create policy "journal owner delete"
  on journal_entries for delete using (user_id = me());

-- Daily checks / mood ─────────────────────────────────────────────────────
create policy "daily owner" on daily_checks for select using (user_id = me());
create policy "daily owner insert" on daily_checks for insert with check (user_id = me());
create policy "daily owner update" on daily_checks for update using (user_id = me()) with check (user_id = me());

-- Dhikr / prayers / favourites ────────────────────────────────────────────
create policy "dhikr owner"        on dhikr_logs       for select using (user_id = me());
create policy "dhikr owner write"  on dhikr_logs       for all    using (user_id = me()) with check (user_id = me());
create policy "favourite owner"    on favourite_duas   for select using (user_id = me());
create policy "favourite write"    on favourite_duas   for all    using (user_id = me()) with check (user_id = me());
create policy "prayer owner"       on prayer_logs      for select using (user_id = me());
create policy "prayer owner write" on prayer_logs      for all    using (user_id = me()) with check (user_id = me());

-- duas content is shared reference data: everyone signed in can read.
create policy "duas readable" on duas for select using (true);
create policy "duas staff write" on duas for all using (is_staff()) with check (is_staff());

-- Visitors / victories / memories / photos / voice / contacts ─────────────
create policy "visitors owner"     on visitors        for select using (user_id = me());
create policy "visitors write"     on visitors        for all    using (user_id = me()) with check (user_id = me());
create policy "victories owner"    on little_victories for select using (user_id = me());
create policy "victories write"    on little_victories for all    using (user_id = me()) with check (user_id = me());
create policy "memories owner"     on memories        for select using (user_id = me());
create policy "memories write"     on memories        for all    using (user_id = me()) with check (user_id = me());
create policy "photos owner"       on photos          for select using (user_id = me());
create policy "photos write"       on photos          for all    using (user_id = me()) with check (user_id = me());
create policy "voice owner"        on voice_diaries   for select using (user_id = me());
create policy "voice write"        on voice_diaries   for all    using (user_id = me()) with check (user_id = me());
create policy "contacts owner"     on contacts        for select using (user_id = me());
create policy "contacts write"     on contacts        for all    using (user_id = me()) with check (user_id = me());
create policy "settings owner"     on app_settings    for select using (user_id = me());
create policy "settings write"     on app_settings    for all    using (user_id = me()) with check (user_id = me());

-- App users: you may read your own row; admins may manage everyone.
create policy "users read self"  on app_users for select using (auth_id = auth.uid() or is_admin());
create policy "users admin write" on app_users for all   using (is_admin()) with check (is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
--  STORAGE
--  Buckets:
--    'public-media'  → sabiha_profile photo, approved memory photos (public)
--    'private-media' → journal photos, voice diaries, private photos
--  Private bucket paths must be prefixed with the owner's user id:
--      private-media/{user_id}/voice/2026-08-30-abc.webm
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('public-media','public-media', true),
       ('private-media','private-media', false)
on conflict (id) do nothing;

create policy "public media read"
  on storage.objects for select
  using (bucket_id = 'public-media');

create policy "public media staff write"
  on storage.objects for all
  using (bucket_id = 'public-media' and is_staff())
  with check (bucket_id = 'public-media' and is_staff());

create policy "private media owner read"
  on storage.objects for select
  using (bucket_id = 'private-media'
         and (storage.foldername(name))[1] = me()::text);

create policy "private media owner write"
  on storage.objects for insert
  with check (bucket_id = 'private-media'
              and (storage.foldername(name))[1] = me()::text);

create policy "private media owner delete"
  on storage.objects for delete
  using (bucket_id = 'private-media'
         and (storage.foldername(name))[1] = me()::text);
