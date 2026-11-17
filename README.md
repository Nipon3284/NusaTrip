# NusaTrip - Platform Operasional Biro Wisata & Corporate B2B

NusaTrip adalah platform manajemen operasional terintegrasi untuk biro perjalanan wisata (tour operator) berbasis Next.js 16 (App Router), mengombinasikan portal pemesanan publik dan kokpit manajemen internal Decision Support System (DSS).

---

## 1. Fitur Utama

### Portal Publik & Layanan Pelanggan (B2B & B2C)
- **Beranda & Etalase Paket Wisata**: Penjelajahan paket wisata Nusantara dengan filter destinasi, durasi, dan kategori.
- **Kustom Trip Builder**: Kalkulator anggaran dinamis untuk rombongan B2B (perusahaan, instansi pendidikan, komunitas).
- **Portal Pelanggan B2B**: Riwayat pemesanan rombongan, pelunasan bertahap, negosiasi kuotasi harga, serta pengisian ulasan per komponen vendor (hotel, resto, armada, kru).
- **Lacak Pesanan & Web Beacon**: Pelacakan status pergerakan armada bus rombongan secara real-time via Web Beacon GPS.

### Kokpit Internal & Decision Support System (Admin Gate)
- **Internal Gate & Otentikasi**: Akses terkontrol bagi staf operasional biro perjalanan.
- **Decision Cockpit & Ringkasan Metrik**: Monitoring performa operasional, lead pipeline, margin keuntungan, dan utilisasi armada.
- **CMS Paket & Manajemen Mitra (GIS)**: Manajemen paket wisata, zona anchor wisata, serta pemetaan rekanan vendor (hotel, resto, transportasi, pusat oleh-oleh) terintegrasi Google Maps Platform.
- **Manajemen Leads & Negosiasi**: Monitoring penawaran masuk dari pelanggan, perhitungan modal batas bawah (Z-Minimum), target margin aman, dan persetujuan deal.
- **Supply Chain & Smart LP Optimizer**: Algoritma optimasi alokasi armada bus (Big Bus, Medium Bus, HiAce, Elf) berbasis Linear Programming untuk efisiensi kapasitas dan biaya solar/sewa.
- **Alokasi Kru Lapangan**: Penugasan Tour Leader, Tim Medis, Tim Dokumentasi, dan Pengawas rombongan.
- **Kas Bon & Pengeluaran Lapangan**: Pencatatan petty cash dan rekonsiliasi pengeluaran insidental selama tur berlangsung.

---

## 2. Tech Stack

- **Framework**: Next.js 16 (React 19, Turbopack, App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS dengan sistem Design Token (DTCG)
- **Ikonografi**: Lucide React (tanpa emoji, sesuai standar enterprise)
- **Database & Backend**: Supabase (PostgreSQL dengan RLS)
- **Otentikasi**: Firebase Auth (Google SSO) & Internal Gate Cookie Session
- **Peta & GIS**: Google Maps JavaScript API (Marker Clustering, Place Picker, Vendor Canvas)

---

## 3. Prasyarat Sistem

- Node.js versi 18.18.0 atau lebih tinggi
- npm versi 9 atau lebih tinggi (atau pnpm / yarn)
- Akun Supabase (opsional untuk sinkronisasi database cloud)
- Google Maps Platform API Key (opsional untuk visualisasi peta vendor)

---

## 4. Panduan Instalasi & Menjalankan Lokal

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/<username>/nusatrip.git
cd nusatrip
```

### Langkah 2: Instal Dependensi
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Sesuaikan nilai di dalam `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari proyek Supabase Anda.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` dari Google Cloud Console.
- Kredensial default gate internal: `ADMIN_ID=admin` dan `ADMIN_PIN=123456`.

### Langkah 4: Jalankan Server Development
```bash
npm run dev
```

Aplikasi dapat diakses pada:
- **Portal Publik**: [http://localhost:3000](http://localhost:3000)
- **Panel Internal / Admin Gate**: [http://localhost:3000/internal_gate](http://localhost:3000/internal_gate)
- **Portal Pelanggan**: [http://localhost:3000/pelanggan](http://localhost:3000/pelanggan)

---

## 5. Skema & Migrasi Database

Skema PostgreSQL lengkap untuk Supabase tersedia di direktori `supabase/migrations/`:
- `20261116000000_init_nusatrip_schema.sql` (Skema awal inisialisasi)
- `20261117000000_skema_nusatrip_bahasa_indonesia.sql` (Skema relasional lengkap dalam Bahasa Indonesia: paket wisata, mitra, leads, armada bus, kru, kas bon lapangan)

Untuk menerapkan migrasi ke Supabase CLI:
```bash
supabase db push
# atau jalankan skrip SQL langsung melalui SQL Editor di Supabase Dashboard
```

---

## 6. Build Produksi & Pengujian

Verifikasi kompilasi dan tipe TypeScript:
```bash
# Validasi tipe TypeScript
npx tsc --noEmit

# Kompilasi produksi Next.js
npm run build

# Menjalankan server produksi lokal
npm run start
```

---

## 7. Lisensi

Hak Cipta (c) 2026 NusaTrip. Seluruh hak cipta dilindungi undang-undang.
