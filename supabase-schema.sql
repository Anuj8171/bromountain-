-- ============================================================
-- BroMountain Adventures — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================


-- ── EXTENSIONS ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ── SECTIONS ────────────────────────────────────────────────
create table if not exists sections (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text not null unique,
  description     text,
  icon            text not null,
  cover_image_url text,
  status          text not null default 'active'
                  check (status in ('active', 'coming_soon')),
  display_order   int  not null default 0,
  created_at      timestamptz default now()
);


-- ── ADVENTURES ──────────────────────────────────────────────
create table if not exists adventures (
  id               uuid primary key default uuid_generate_v4(),
  section_id       uuid references sections(id) on delete set null,
  title            text not null,
  slug             text not null unique,
  tagline          text,
  description      text,
  location         text,
  state            text default 'Uttarakhand',
  difficulty       text not null default 'Moderate'
                   check (difficulty in ('Easy','Moderate','Hard','Extreme')),
  duration_days    int  not null default 1,
  duration_nights  int  not null default 0,
  max_altitude     text,
  distance_km      numeric,
  best_season      text,
  min_age          int  default 10,
  max_group_size   int  default 20,
  cover_image_url  text,
  gallery_images   text[] default '{}',
  original_price   numeric not null default 0,
  discounted_price numeric not null default 0,
  offer_price      numeric,
  offer_expires_at timestamptz,
  is_featured      boolean default false,
  is_active        boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- auto update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger adventures_updated_at
  before update on adventures
  for each row execute function update_updated_at();


-- ── ITINERARY DAYS ───────────────────────────────────────────
create table if not exists itinerary_days (
  id             uuid primary key default uuid_generate_v4(),
  adventure_id   uuid references adventures(id) on delete cascade,
  day_number     int  not null,
  title          text not null,
  description    text,
  activities     text[] default '{}',
  accommodation  text,
  meals          text,
  distance_km    numeric,
  custom_fields  jsonb default '[]',
  created_at     timestamptz default now()
);

-- index for fast lookup
create index if not exists idx_itinerary_adventure
  on itinerary_days(adventure_id, day_number);


-- ── INCLUSIONS ───────────────────────────────────────────────
create table if not exists inclusions (
  id           uuid primary key default uuid_generate_v4(),
  adventure_id uuid references adventures(id) on delete cascade,
  item         text not null,
  sort_order   int default 0
);

create index if not exists idx_inclusions_adventure
  on inclusions(adventure_id);


-- ── EXCLUSIONS ───────────────────────────────────────────────
create table if not exists exclusions (
  id           uuid primary key default uuid_generate_v4(),
  adventure_id uuid references adventures(id) on delete cascade,
  item         text not null,
  sort_order   int default 0
);

create index if not exists idx_exclusions_adventure
  on exclusions(adventure_id);


-- ── DEPARTURE DATES ──────────────────────────────────────────
create table if not exists departure_dates (
  id              uuid primary key default uuid_generate_v4(),
  adventure_id    uuid references adventures(id) on delete cascade,
  date            date not null,
  available_slots int  not null default 15,
  booked_slots    int  not null default 0,
  created_at      timestamptz default now()
);

create index if not exists idx_departure_adventure
  on departure_dates(adventure_id, date);


-- ── BOOKINGS ─────────────────────────────────────────────────
create table if not exists bookings (
  id                  text primary key,
  adventure_id        uuid references adventures(id) on delete set null,
  departure_date_id   uuid references departure_dates(id) on delete set null,
  name                text not null,
  email               text not null,
  phone               text not null,
  whatsapp            text not null,
  group_type          text not null
                      check (group_type in (
                        'solo','random_group','friends_group','family','corporate'
                      )),
  group_size          int  not null default 1,
  special_requests    text,
  status              text not null default 'pending'
                      check (status in ('pending','confirmed','cancelled')),
  created_at          timestamptz default now()
);

create index if not exists idx_bookings_adventure
  on bookings(adventure_id);
create index if not exists idx_bookings_status
  on bookings(status);
create index if not exists idx_bookings_created
  on bookings(created_at desc);


-- ── REVIEWS ──────────────────────────────────────────────────
create table if not exists reviews (
  id             uuid primary key default uuid_generate_v4(),
  adventure_id   uuid references adventures(id) on delete set null,
  reviewer_name  text not null,
  reviewer_email text not null,
  rating         int  not null check (rating between 1 and 5),
  title          text not null,
  content        text not null,
  image_urls     text[] default '{}',
  status         text not null default 'pending'
                 check (status in ('pending','approved','rejected')),
  created_at     timestamptz default now()
);

create index if not exists idx_reviews_status
  on reviews(status);
create index if not exists idx_reviews_adventure
  on reviews(adventure_id);


-- ── SPECIAL OFFERS ───────────────────────────────────────────
create table if not exists special_offers (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  subtitle    text not null,
  badge_text  text not null default 'LIMITED TIME',
  expires_at  timestamptz,
  is_active   boolean default false,
  created_at  timestamptz default now()
);


-- ── SITE SETTINGS ────────────────────────────────────────────
-- stores hero images, about image, contact details etc
create table if not exists site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);


-- ── ROW LEVEL SECURITY ───────────────────────────────────────
-- Public can read everything
alter table sections        enable row level security;
alter table adventures      enable row level security;
alter table itinerary_days  enable row level security;
alter table inclusions      enable row level security;
alter table exclusions      enable row level security;
alter table departure_dates enable row level security;
alter table bookings        enable row level security;
alter table reviews         enable row level security;
alter table special_offers  enable row level security;
alter table site_settings   enable row level security;

-- Public READ policies
create policy "Public can read sections"
  on sections for select using (true);

create policy "Public can read active adventures"
  on adventures for select using (is_active = true);

create policy "Public can read itinerary"
  on itinerary_days for select using (true);

create policy "Public can read inclusions"
  on inclusions for select using (true);

create policy "Public can read exclusions"
  on exclusions for select using (true);

create policy "Public can read departure dates"
  on departure_dates for select using (true);

create policy "Public can read approved reviews"
  on reviews for select using (status = 'approved');

create policy "Public can read active offers"
  on special_offers for select using (is_active = true);

create policy "Public can read site settings"
  on site_settings for select using (true);

-- Public INSERT policies (for bookings and reviews)
create policy "Anyone can submit booking"
  on bookings for insert with check (true);

create policy "Anyone can submit review"
  on reviews for insert with check (true);

-- Service role can do everything (used by admin API routes)
create policy "Service role full access on sections"
  on sections for all using (true) with check (true);

create policy "Service role full access on adventures"
  on adventures for all using (true) with check (true);

create policy "Service role full access on itinerary"
  on itinerary_days for all using (true) with check (true);

create policy "Service role full access on inclusions"
  on inclusions for all using (true) with check (true);

create policy "Service role full access on exclusions"
  on exclusions for all using (true) with check (true);

create policy "Service role full access on departure_dates"
  on departure_dates for all using (true) with check (true);

create policy "Service role full access on bookings"
  on bookings for all using (true) with check (true);

create policy "Service role full access on reviews"
  on reviews for all using (true) with check (true);

create policy "Service role full access on offers"
  on special_offers for all using (true) with check (true);

create policy "Service role full access on settings"
  on site_settings for all using (true) with check (true);


-- ── SEED DATA ────────────────────────────────────────────────
-- Insert default sections
insert into sections (name, slug, description, icon, status, display_order) values
  ('Trekking', 'trekking', 'Raw Himalayan trails of Uttarakhand', '🥾', 'active', 1),
  ('Camping',  'camping',  'Sleep under a billion Himalayan stars', '⛺', 'active', 2),
  ('Snowboarding', 'snowboarding', 'Ride untouched Himalayan slopes', '🏂', 'coming_soon', 3)
on conflict (slug) do nothing;

-- Insert default site settings
insert into site_settings (key, value) values
  ('admin_whatsapp', '919876543210'),
  ('contact_email',  'hello@bromountain.in'),
  ('contact_phone',  '+91 98765 43210'),
  ('address',        'Uttarkashi, Uttarakhand, India')
on conflict (key) do nothing;


create or replace function increment_booked_slots(date_id uuid)
returns void as $$
begin
  update departure_dates
  set booked_slots = booked_slots + 1
  where id = date_id
    and booked_slots < available_slots;
end;
$$ language plpgsql;


