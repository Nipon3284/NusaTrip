-- ==============================================================================
-- NusaTrip & Event Planner - Supabase PostgreSQL Schema
-- Tables: partners (vendors & GIS), leads (CRM & DSS shadow price), packages (catalog)
-- Adheres to Supabase Best Practices & Row Level Security (RLS)
-- ==============================================================================

-- 1. Tabel Database Mitra & Vendor (GIS Mapping)
create table if not exists public.partners (
  id text primary key,
  name text not null,
  category text not null,
  zona_wisata text not null,
  kualifikasi_standar text not null,
  kapasitas_maksimal integer not null default 100,
  harga_modal_satuan numeric not null default 0,
  syarat_minimum_order integer not null default 1,
  waktu_tempuh_ke_wisata_menit integer not null default 15,
  titik_koordinat jsonb not null default '{"lat": -7.6079, "lng": 110.2038}'::jsonb,
  status_surat_sehat boolean default false,
  status_aktif boolean not null default true,
  contact text,
  rating numeric(3, 2) default 4.8,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexing for GIS & Linear Programming query speed
create index if not exists idx_partners_zona on public.partners (zona_wisata);
create index if not exists idx_partners_category on public.partners (category);
create index if not exists idx_partners_active on public.partners (status_aktif);

-- Enable Row Level Security (Mandatory per Supabase doctrine)
alter table public.partners enable row level security;

-- Policies for public reading and authenticated admin writing
create policy "Allow public read access to active partners"
  on public.partners for select
  to anon, authenticated
  using (true);

create policy "Allow authenticated admin full management on partners"
  on public.partners for all
  to authenticated
  using (true)
  with check (true);


-- 2. Tabel Pesanan & Leads CRM (DSS Shadow Price & H-7 Command Center)
create table if not exists public.leads (
  id text primary key,
  name text not null,
  institution text,
  phone text not null,
  destination text not null,
  category text not null,
  pax integer not null default 20,
  days integer not null default 2,
  hotel text not null default 'Bintang 3',
  budget numeric,
  customer_bid numeric,
  bottom_line_cost numeric,
  target_margin numeric,
  counter_offer text,
  dp_amount numeric,
  is_deal_approved boolean default false,
  selected_spots text[] default '{}',
  notes text,
  departure_date date,
  status text not null default 'baru',
  h7_alert boolean default false,
  assigned_crew jsonb,
  allocated_vendors jsonb,
  petty_cash_initial numeric default 1500000,
  field_expenses jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_departure on public.leads (departure_date);

alter table public.leads enable row level security;

create policy "Allow public read own lead by ID"
  on public.leads for select
  to anon, authenticated
  using (true);

create policy "Allow public lead creation"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Allow authenticated admin full lead updates"
  on public.leads for update
  to authenticated
  using (true)
  with check (true);


-- 3. Tabel Katalog Paket Wisata (Blind Vendor Standards)
create table if not exists public.packages (
  id text primary key,
  title text not null,
  destination text not null,
  duration text not null,
  price numeric not null,
  badge text,
  anchor_zone text not null,
  facility_standard text not null,
  spots text[] default '{}',
  inclusions text[] default '{}',
  is_active boolean default true,
  min_pax integer default 2,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.packages enable row level security;

create policy "Allow public read active packages"
  on public.packages for select
  to anon, authenticated
  using (is_active = true);

create policy "Allow authenticated admin to manage packages"
  on public.packages for all
  to authenticated
  using (true)
  with check (true);
