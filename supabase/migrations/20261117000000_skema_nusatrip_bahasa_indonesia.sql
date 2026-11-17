-- ==============================================================================
-- NusaTrip & Event Planner - Skema Database Relasional (Bahasa Indonesia)
-- Arsitektur: Two-Sided Platform (Portal Pelanggan & Dasbor Admin Terpusat)
-- Mesin: Decision Support System (DSS) berbasis Binary & Integer Linear Programming
-- ==============================================================================

-- 1. TABEL PENGGUNA (Otentikasi Google SSO & Admin)
create table if not exists public.tbl_pengguna (
  id_pengguna text primary key,
  email text unique not null,
  nama_lengkap text not null,
  nomor_telepon text,
  peran_pengguna text not null default 'pelanggan' check (peran_pengguna in ('admin', 'pelanggan')),
  google_id text unique,
  foto_profil_url text,
  nama_instansi text,
  waktu_dibuat timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_pengguna_email on public.tbl_pengguna (email);
create index if not exists idx_pengguna_google_id on public.tbl_pengguna (google_id);
create index if not exists idx_pengguna_peran on public.tbl_pengguna (peran_pengguna);

alter table public.tbl_pengguna enable row level security;

create policy "Izinkan pengguna membaca data profil sendiri"
  on public.tbl_pengguna for select
  to authenticated
  using (auth.uid()::text = id_pengguna or peran_pengguna = 'admin');

-- 2. TABEL ZONA WISATA (Master Zonasi & Titik Jangkar)
create table if not exists public.tbl_zona_wisata (
  id_zona text primary key,
  nama_zona text not null,
  kota_destinasi text not null,
  nama_titik_jangkar text not null,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  waktu_tempuh_maksimal_menit integer not null default 25,
  status_aktif boolean not null default true,
  deskripsi text,
  waktu_dibuat timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_zona_kota on public.tbl_zona_wisata (kota_destinasi);
create index if not exists idx_zona_aktif on public.tbl_zona_wisata (status_aktif);

alter table public.tbl_zona_wisata enable row level security;
create policy "Izinkan publik membaca zona aktif"
  on public.tbl_zona_wisata for select
  to anon, authenticated
  using (status_aktif = true);

-- 3. TABEL MITRA VENDOR (Rekanan Hotel, Resto, Wisata, Oleh-oleh, Bus, Kru)
create table if not exists public.tbl_mitra_vendor (
  id_mitra text primary key,
  nama_mitra text not null,
  kategori text not null check (kategori in ('Hotel', 'Restoran', 'Wisata (Anchor Zone)', 'Pusat Oleh-oleh', 'Transportasi', 'Tour Leader', 'Tim Dokumentasi', 'Tim Medis', 'Tim Pengawas')),
  id_zona text references public.tbl_zona_wisata(id_zona) on delete set null,
  kualifikasi_standar text not null,
  kapasitas_maksimal integer not null default 100,
  harga_modal_satuan numeric(14, 2) not null default 0,
  syarat_minimum_order integer not null default 1,
  waktu_tempuh_ke_wisata_menit integer not null default 15,
  latitude numeric(9, 6) not null default -7.6079,
  longitude numeric(9, 6) not null default 110.2038,
  status_surat_sehat boolean default false,
  status_aktif boolean not null default true,
  nomor_kontak text,
  rating numeric(3, 2) default 4.8,
  nama_file_surat_sehat text,
  waktu_dibuat timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_mitra_kategori on public.tbl_mitra_vendor (kategori);
create index if not exists idx_mitra_zona on public.tbl_mitra_vendor (id_zona);
create index if not exists idx_mitra_aktif on public.tbl_mitra_vendor (status_aktif);

alter table public.tbl_mitra_vendor enable row level security;
create policy "Izinkan publik membaca mitra aktif"
  on public.tbl_mitra_vendor for select
  to anon, authenticated
  using (status_aktif = true);

-- 4. TABEL MATRIKS WAKTU TEMPUH (GIS Transit Matrix <= 25 Menit)
create table if not exists public.tbl_matriks_waktu_tempuh (
  id_matriks text primary key,
  id_mitra_asal text not null references public.tbl_mitra_vendor(id_mitra) on delete cascade,
  id_mitra_tujuan text not null references public.tbl_mitra_vendor(id_mitra) on delete cascade,
  waktu_tempuh_menit integer not null,
  jarak_km numeric(5, 2),
  waktu_diperbarui timestamptz default timezone('utc'::text, now()) not null
);

create unique index if not exists idx_matriks_asal_tujuan on public.tbl_matriks_waktu_tempuh (id_mitra_asal, id_mitra_tujuan);
alter table public.tbl_matriks_waktu_tempuh enable row level security;
create policy "Izinkan baca publik matriks waktu"
  on public.tbl_matriks_waktu_tempuh for select
  to anon, authenticated
  using (true);

-- 5. TABEL KATALOG PAKET WISATA (Jalur 1 - Blind Vendor Ritel)
create table if not exists public.tbl_katalog_paket (
  id_paket text primary key,
  judul_paket text not null,
  kota_destinasi text not null,
  durasi_trip text not null,
  harga_per_pax numeric(14, 2) not null,
  badge_label text,
  id_zona text references public.tbl_zona_wisata(id_zona) on delete set null,
  standar_fasilitas text not null,
  daftar_wisata text[] default '{}',
  fasilitas_inklusif text[] default '{}',
  minimal_pax integer default 2,
  status_aktif boolean default true,
  waktu_dibuat timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_katalog_kota on public.tbl_katalog_paket (kota_destinasi);
create index if not exists idx_katalog_aktif on public.tbl_katalog_paket (status_aktif);
alter table public.tbl_katalog_paket enable row level security;
create policy "Izinkan publik membaca katalog aktif"
  on public.tbl_katalog_paket for select
  to anon, authenticated
  using (status_aktif = true);

-- 6. TABEL PENGAJUAN PAKET MANDIRI (Jalur 2 - B2B Custom & Feasibility DSS)
create table if not exists public.tbl_pengajuan_paket_mandiri (
  id_pengajuan text primary key,
  id_pengguna text references public.tbl_pengguna(id_pengguna) on delete set null,
  nama_pemesan text not null,
  nama_instansi text,
  nomor_whatsapp text not null,
  kota_destinasi text not null,
  kategori_acara text not null,
  jumlah_pax integer not null default 20,
  durasi_hari integer not null default 2,
  kelas_bintang_hotel text not null default 'Bintang 3',
  estimasi_anggaran numeric(14, 2) not null,
  tawaran_pelanggan numeric(14, 2),
  batas_bawah_modal_dss numeric(14, 2), -- Modal Rahasia Z-Minimum
  margin_keuntungan_target numeric(5, 2) default 15.0,
  pesan_counter_offer text,
  status_pengajuan text not null default 'baru' check (status_pengajuan in ('baru', 'negosiasi', 'menunggu_dp', 'proses_dss', 'final_h7', 'selesai', 'dibatalkan')),
  tanggal_rencana_keberangkatan date,
  catatan_tambahan text,
  waktu_diajukan timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_pengajuan_pengguna on public.tbl_pengajuan_paket_mandiri (id_pengguna);
create index if not exists idx_pengajuan_status on public.tbl_pengajuan_paket_mandiri (status_pengajuan);
alter table public.tbl_pengajuan_paket_mandiri enable row level security;
create policy "Pengguna bisa membaca pengajuan miliknya"
  on public.tbl_pengajuan_paket_mandiri for select
  to authenticated
  using (id_pengguna = auth.uid()::text);

-- 7. TABEL DETAIL WISATA PILIHAN
create table if not exists public.tbl_detail_wisata_pilihan (
  id_detail text primary key,
  id_pengajuan text not null references public.tbl_pengajuan_paket_mandiri(id_pengajuan) on delete cascade,
  nama_lokawisata text not null,
  urutan_kunjungan integer not null default 1,
  is_titik_jangkar boolean default false
);

create index if not exists idx_detail_pengajuan on public.tbl_detail_wisata_pilihan (id_pengajuan);
alter table public.tbl_detail_wisata_pilihan enable row level security;
create policy "Baca detail wisata pilihan"
  on public.tbl_detail_wisata_pilihan for select
  to anon, authenticated
  using (true);

-- 8. TABEL RIWAYAT NEGOSIASI (Chat & Auto Counter-Offer DSS)
create table if not exists public.tbl_riwayat_negosiasi (
  id_negosiasi text primary key,
  id_pengajuan text not null references public.tbl_pengajuan_paket_mandiri(id_pengajuan) on delete cascade,
  pihak_pengirim text not null check (pihak_pengirim in ('pelanggan', 'admin', 'sistem_dss')),
  harga_diajukan numeric(14, 2),
  pesan_negosiasi text not null,
  status_tawaran text default 'pending' check (status_tawaran in ('pending', 'diterima', 'ditolak', 'counter')),
  waktu_dikirim timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_nego_pengajuan on public.tbl_riwayat_negosiasi (id_pengajuan);
alter table public.tbl_riwayat_negosiasi enable row level security;
create policy "Baca riwayat negosiasi"
  on public.tbl_riwayat_negosiasi for select
  to authenticated
  using (true);

-- 9. TABEL PESANAN PELANGGAN (Command Center & Transaksi)
create table if not exists public.tbl_pesanan_pelanggan (
  id_pesanan text primary key,
  id_pengajuan text references public.tbl_pengajuan_paket_mandiri(id_pengajuan) on delete set null,
  id_pengguna text references public.tbl_pengguna(id_pengguna) on delete set null,
  jalur_pemesanan text not null check (jalur_pemesanan in ('katalog_ritel', 'kustom_b2b')),
  nomor_invoice text unique not null,
  nominal_total_disepakati numeric(14, 2) not null,
  nominal_dp numeric(14, 2) not null,
  status_pembayaran_dp text not null default 'menunggu_pembayaran' check (status_pembayaran_dp in ('menunggu_pembayaran', 'lunas', 'kedaluwarsa')),
  tanggal_jatuh_tempo_dp timestamptz not null,
  nominal_pelunasan numeric(14, 2) not null,
  status_pembayaran_pelunasan text not null default 'belum_ditagih' check (status_pembayaran_pelunasan in ('belum_ditagih', 'menunggu_pelunasan', 'lunas')),
  status_fase_perjalanan text not null default 'masa_tunggu' check (status_fase_perjalanan in ('masa_tunggu', 'h7_terbuka', 'hari_h_berjalan', 'selesai_h1')),
  kode_vip_clearance text unique,
  token_web_beacon text unique,
  status_beacon_aktif boolean default false,
  latitude_bus_terakhir numeric(9, 6),
  longitude_bus_terakhir numeric(9, 6),
  kecepatan_bus_kmh numeric(5, 2) default 0,
  waktu_lokasi_terakhir timestamptz,
  rating_hotel integer check (rating_hotel between 1 and 5),
  rating_restoran integer check (rating_restoran between 1 and 5),
  rating_bus integer check (rating_bus between 1 and 5),
  rating_tour_leader integer check (rating_tour_leader between 1 and 5),
  ulasan_pelanggan text,
  tanggal_keberangkatan date not null,
  waktu_dibuat timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_pesanan_pengguna on public.tbl_pesanan_pelanggan (id_pengguna);
create index if not exists idx_pesanan_fase on public.tbl_pesanan_pelanggan (status_fase_perjalanan);
create index if not exists idx_pesanan_tgl on public.tbl_pesanan_pelanggan (tanggal_keberangkatan);
alter table public.tbl_pesanan_pelanggan enable row level security;
create policy "Pengguna melihat pesanannya sendiri"
  on public.tbl_pesanan_pelanggan for select
  to authenticated
  using (id_pengguna = auth.uid()::text);

-- 10. TABEL KEPUTUSAN OPTIMASI DSS (Solusi ILP)
create table if not exists public.tbl_keputusan_optimasi_dss (
  id_keputusan text primary key,
  id_pesanan text unique not null references public.tbl_pesanan_pelanggan(id_pesanan) on delete cascade,
  total_modal_dss_z numeric(14, 2) not null,
  detail_alokasi_hotel jsonb not null,
  detail_alokasi_restoran jsonb not null,
  detail_alokasi_bus jsonb not null,
  detail_penugasan_kru jsonb not null,
  penghematan_vs_baseline_rp numeric(14, 2) default 0,
  persentase_penghematan numeric(5, 2) default 0,
  waktu_dihitung timestamptz default timezone('utc'::text, now()) not null
);

alter table public.tbl_keputusan_optimasi_dss enable row level security;
create policy "Akses keputusan DSS oleh admin"
  on public.tbl_keputusan_optimasi_dss for all
  to authenticated
  using (true);

-- 11. TABEL RUNDOWN PERJALANAN (Jadwal Presisi Jam-ke-Jam)
create table if not exists public.tbl_rundown_perjalanan (
  id_rundown text primary key,
  id_pesanan text not null references public.tbl_pesanan_pelanggan(id_pesanan) on delete cascade,
  hari_ke integer not null,
  jam_mulai time not null,
  jam_selesai time not null,
  aktivitas text not null,
  lokasi text not null,
  nama_mitra text,
  keterangan text,
  urutan integer not null default 1
);

create index if not exists idx_rundown_pesanan on public.tbl_rundown_perjalanan (id_pesanan, hari_ke, urutan);
alter table public.tbl_rundown_perjalanan enable row level security;
create policy "Publik baca rundown pesanan"
  on public.tbl_rundown_perjalanan for select
  to anon, authenticated
  using (true);

-- 12. TABEL KAS KECIL LAPANGAN & PENGELUARAN INSIDENTAL
create table if not exists public.tbl_kas_kecil_lapangan (
  id_kas_kecil text primary key,
  id_pesanan text unique not null references public.tbl_pesanan_pelanggan(id_pesanan) on delete cascade,
  id_kru_penerima text not null references public.tbl_mitra_vendor(id_mitra),
  nominal_uang_jalan_awal numeric(14, 2) not null default 1500000,
  total_pengeluaran_nota numeric(14, 2) not null default 0,
  selisih_settlement numeric(14, 2) not null default 0,
  status_settlement text not null default 'belum_settle' check (status_settlement in ('belum_settle', 'sisa_setor_balik', 'reimburse_ke_kru', 'lunas')),
  tanggal_penyerahan date not null,
  tanggal_settlement date
);

create table if not exists public.tbl_pengeluaran_insidental (
  id_pengeluaran text primary key,
  id_kas_kecil text not null references public.tbl_kas_kecil_lapangan(id_kas_kecil) on delete cascade,
  id_admin_pencatat text references public.tbl_pengguna(id_pengguna),
  nama_kru_pelapor text not null,
  kategori_biaya text not null check (kategori_biaya in ('Ban & Kendaraan', 'Parkir & Retribusi', 'Obat & Medis', 'Konsumsi Darurat', 'Lain-lain')),
  nominal_rp numeric(14, 2) not null,
  catatan_pengeluaran text not null,
  bukti_nota_url text,
  waktu_kejadian timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_insidental_kas on public.tbl_pengeluaran_insidental (id_kas_kecil);
alter table public.tbl_kas_kecil_lapangan enable row level security;
alter table public.tbl_pengeluaran_insidental enable row level security;
create policy "Admin kelola kas kecil"
  on public.tbl_kas_kecil_lapangan for all
  to authenticated
  using (true);
create policy "Admin kelola pengeluaran insidental"
  on public.tbl_pengeluaran_insidental for all
  to authenticated
  using (true);
