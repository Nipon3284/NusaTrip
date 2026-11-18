-- ==============================================================================
-- NusaTrip Platform - Migrasi: Tabel Konfigurasi Sistem Terpadu
-- Tujuan: Menyimpan dan menyinkronkan pengaturan global (seperti Google Maps API Key)
-- ke seluruh perangkat admin agar cukup diinputkan satu kali saja.
-- ==============================================================================

create table if not exists public.tbl_konfigurasi_sistem (
  kunci text primary key,
  nilai text not null,
  keterangan text,
  waktu_diperbarui timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_konfigurasi_kunci on public.tbl_konfigurasi_sistem (kunci);

alter table public.tbl_konfigurasi_sistem enable row level security;

-- Izinkan pembacaan konfigurasi sistem oleh siapapun (publik/authenticated)
-- agar browser klien pada perangkat mana pun dapat memuat Maps API Key
create policy "Izinkan publik membaca konfigurasi sistem"
  on public.tbl_konfigurasi_sistem for select
  to anon, authenticated
  using (true);

-- Izinkan penambahan atau pembaruan konfigurasi
create policy "Izinkan insert konfigurasi sistem"
  on public.tbl_konfigurasi_sistem for insert
  to anon, authenticated
  with check (true);

create policy "Izinkan update konfigurasi sistem"
  on public.tbl_konfigurasi_sistem for update
  to anon, authenticated
  using (true);
