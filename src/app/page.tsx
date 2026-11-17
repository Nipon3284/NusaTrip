"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Cpu,
  Navigation,
  ShieldCheck,
  ArrowRight,
  Building2,
  GraduationCap,
  Heart,
  Tent,
  Award,
  MapPin,
  Users,
  Compass,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Bus,
  Shield,
  HelpCircle,
  Search,
  QrCode,
  Clock,
  Ticket,
  Utensils,
  Receipt,
  Download,
  LayoutDashboard,
  Star,
  Lock,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useTourPackages,
  useCustomerAuth,
  useHeroSettings,
  getHeroGradientCss,
} from "@/lib/data/tour-store";
import { GoogleSSOModal } from "@/components/auth/google-sso-modal";

const DESTINATIONS_PREVIEW = [
  {
    id: "jogja",
    name: "Yogyakarta",
    tagline: "Budaya, Candi Megah, & Lava Tour",
    packageCount: "18 Paket Siap",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bali",
    name: "Bali",
    tagline: "Pantai Eksotis & Kemewahan Tropis",
    packageCount: "24 Paket Siap",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bromo",
    name: "Bromo & Malang",
    tagline: "Sunrise Kaldera & Petik Apel",
    packageCount: "14 Paket Siap",
    image: "https://images.unsplash.com/photo-1609137144822-7772186835a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bandung",
    name: "Bandung",
    tagline: "Kesejukan Dataran Tinggi & Outbound",
    packageCount: "12 Paket Siap",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80",
  },
];

const EO_SERVICES = [
  {
    id: "gathering",
    icon: Building2,
    title: "Company Gathering & Outing Kantor",
    desc: "Perjalanan apresiasi karyawan dengan outbound team-building, gala dinner bertema, dan bus eksekutif berstandar pariwisata.",
  },
  {
    id: "study",
    icon: GraduationCap,
    title: "Study Tour & Edukasi Kampus",
    desc: "Kunjungan industri, cagar budaya, dan museum sejarah berizin resmi dengan pendampingan tim medis serta pengawas.",
  },
  {
    id: "family",
    icon: Heart,
    title: "Family Trip & Liburan Komunitas",
    desc: "Itinerary ramah lansia dan anak, private transport tanpa digabung rombongan lain, serta fleksibilitas jadwal.",
  },
  {
    id: "outbound",
    icon: Tent,
    title: "Outbound Training & Leadership",
    desc: "Instruktur bersertifikasi BNSP dengan simulasi dinamika kelompok, arung jeram, dan modul kepemimpinan.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Rancang Kebutuhan Rombongan",
    desc: "Pilih paket katalog siap berangkat atau gunakan Wizard Kustom Mandiri 4-tahap dengan validasi pagu anggaran DSS.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Optimasi Rantai Pasok (ILP)",
    desc: "Algoritma menghitung alokasi bus tanpa kursi kosong dan menyeleksi mitra terbaik dalam radius ≤ 25 menit.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Pusat Kendali H-7 & Hari-H",
    desc: "Pada H-7 identitas vendor asli & SPK dibuka. Di Hari-H rombongan menikmati VIP Clearance bebas antre & live GPS bus.",
    icon: Navigation,
  },
];

const WHY_US_PILLARS = [
  {
    title: "Konsep Blind Vendor Efisien",
    desc: "Efisiensi pengadaan pihak ketiga tanpa beban aset fisik, menghasilkan harga termurah dengan jaminan kualitas hotel & bus setaraf.",
    icon: Shield,
  },
  {
    title: "Armada Bus 0 Idle Capacity",
    desc: "Algoritma Integer Linear Programming memadukan Big Bus, Medium Bus, dan Hiace untuk efisiensi biaya maksimal rombongan.",
    icon: Bus,
  },
  {
    title: "4 Kru Lapangan Mutlak",
    desc: "Setiap event didampingi Tour Leader berlisensi, Tim Dokumentasi Drone 4K, Tim Medis K3 Kemenkes, dan Tim Pengawas Lapangan.",
    icon: Award,
  },
  {
    title: "Transparansi Biaya & Escrow",
    desc: "Simulasi DP 40% transparan dengan rekening escrow aman, pemantauan nota insidental real-time, dan LPJ resmi faktur pajak.",
    icon: CheckCircle2,
  },
];

export default function HomePage() {
  const customerAuth = useCustomerAuth();
  const allPackages = useTourPackages();
  const heroSettings = useHeroSettings();
  const [openFaqId, setOpenFaqId] = useState<string | null>("blind-vendor");
  const [quickSearchId, setQuickSearchId] = useState("");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const formatRupiah = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const featuredPackages = allPackages.filter((p) => p.isActive).slice(0, 3);
  const gradientCss = getHeroGradientCss(heroSettings);
  const isDark = heroSettings.textTheme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--text-primary)] selection:bg-indigo-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 space-y-20 pb-16">
        {/* HERO SECTION WITH CUSTOMIZABLE BACKGROUND & GRADIENT OVERLAY */}
        <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 overflow-hidden border-b border-[var(--border-subtle)]">
          {/* Layer 1: Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
            style={{
              backgroundImage: `url(${heroSettings.imageUrl})`,
              filter:
                heroSettings.blurAmount === "sm"
                  ? "blur(4px)"
                  : heroSettings.blurAmount === "md"
                  ? "blur(8px)"
                  : "none",
            }}
            aria-hidden="true"
          />

          {/* Layer 2: Gradient Overlay with Custom Opacity */}
          <div
            className="absolute inset-0 transition-all duration-500 pointer-events-none"
            style={{
              background: gradientCss,
              opacity: heroSettings.overlayOpacity / 100,
            }}
            aria-hidden="true"
          />

          {/* Layer 3: Smooth Bottom Fade into Page Surface */}
          <div
            className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--surface-page)] via-[var(--surface-page)]/80 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Layer 4: Foreground Content with Guaranteed Text Contrast */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors ${
                  isDark
                    ? "bg-white/10 text-cyan-300 border border-white/20 backdrop-blur-md shadow-sm"
                    : "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                }`}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span>Platform Agregator Pariwisata & Event Organizer Berbasis DSS</span>
              </div>

              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] ${
                  isDark ? "text-white drop-shadow-md" : "text-[var(--text-primary)]"
                }`}
              >
                Solusi Cerdas Tour Rombongan dengan{" "}
                <span
                  className={
                    isDark
                      ? "bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm"
                      : "bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent"
                  }
                >
                  Riset Operasi & Blind Vendor
                </span>
              </h1>

              <p
                className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${
                  isDark
                    ? "text-slate-100 font-medium drop-shadow-xs"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                Menghitung alokasi bus tanpa kursi kosong (*zero idle capacity*), garansi keutuhan rombongan, 
                akses <strong className={isDark ? "text-cyan-300 font-bold" : ""}>VIP Group Clearance</strong> tanpa antre perorangan, serta didampingi <strong className={isDark ? "text-cyan-300 font-bold" : ""}>4 kru berlisensi mutlak</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/paket-wisata">
                  <Button size="lg" variant="gradient" className="gap-2 text-xs sm:text-sm font-bold shadow-md">
                    <span>Jelajahi Paket Wisata</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/kustom-trip">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`gap-2 text-xs sm:text-sm font-bold ${
                      isDark
                        ? "bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs"
                        : "text-indigo-600 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50"
                    }`}
                  >
                    <SlidersHorizontal className={`w-4 h-4 shrink-0 ${isDark ? "text-cyan-300" : "text-indigo-600"}`} />
                    <span>Rancang Trip Kustom (Wizard B2B)</span>
                  </Button>
                </Link>

                {customerAuth ? (
                  <Link href="/pelanggan">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`gap-2 text-xs sm:text-sm font-bold ${
                        isDark
                          ? "bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs"
                          : "text-indigo-600 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Buka Dasbor Pelanggan</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsGoogleModalOpen(true)}
                    className={`gap-2 text-xs sm:text-sm font-bold ${
                      isDark
                        ? "bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs"
                        : "text-indigo-600 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Masuk Dasbor Pelanggan</span>
                  </Button>
                )}
              </div>

              {/* Trust Signal Badges */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t text-xs ${
                  isDark
                    ? "border-white/15 text-slate-100"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
                }`}
              >
                <div
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl ${
                    isDark ? "bg-black/25 backdrop-blur-xs border border-white/10" : ""
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                  <span>Rekening Escrow Aman</span>
                </div>
                <div
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl ${
                    isDark ? "bg-black/25 backdrop-blur-xs border border-white/10" : ""
                  }`}
                >
                  <Bus className={`w-4 h-4 shrink-0 ${isDark ? "text-indigo-300" : "text-indigo-600"}`} />
                  <span>0 Kursi Kosong (ILP)</span>
                </div>
                <div
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl ${
                    isDark ? "bg-black/25 backdrop-blur-xs border border-white/10" : ""
                  }`}
                >
                  <Award className={`w-4 h-4 shrink-0 ${isDark ? "text-purple-300" : "text-purple-600"}`} />
                  <span>4 Kru Mutlak Ber-SPK</span>
                </div>
                <div
                  className={`flex items-center justify-center gap-2 p-2 rounded-xl ${
                    isDark ? "bg-black/25 backdrop-blur-xs border border-white/10" : ""
                  }`}
                >
                  <QrCode className={`w-4 h-4 shrink-0 ${isDark ? "text-cyan-300" : "text-cyan-600"}`} />
                  <span>VIP Group Clearance</span>
                </div>
              </div>
            </div>

            {/* Quick Order Tracker Floating Card */}
            <div
              className={`mt-12 max-w-xl mx-auto p-4 sm:p-5 rounded-2xl border shadow-xl space-y-3 ${
                isDark
                  ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-white/20"
                  : "bg-[var(--surface-card)] border-[var(--border-subtle)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>Lacak Pesanan / Command Center Perjalanan</span>
                </span>
                {customerAuth ? (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Sesi Pelanggan Aktif
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Khusus Pelanggan Terdaftar</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan Nomor Order (contoh: ORD-H0-4491)..."
                  value={quickSearchId}
                  onChange={(e) => setQuickSearchId(e.target.value)}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-mono font-bold text-[var(--text-primary)]"
                />
                {customerAuth ? (
                  <Link href={`/lacak-pesanan?id=${quickSearchId || "ORD-H0-4491"}`}>
                    <Button size="md" variant="gradient" className="text-xs font-bold shrink-0">
                      Lacak Trip
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="md"
                    variant="gradient"
                    onClick={() => setIsGoogleModalOpen(true)}
                    className="text-xs font-bold shrink-0"
                  >
                    Lacak Trip
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span>Contoh nomor pesanan:</span>
                <Link href="/lacak-pesanan?id=ORD-H0-4491" className="text-indigo-600 font-mono hover:underline">
                  ORD-H0-4491 (Hari-H)
                </Link>
                <span>&bull;</span>
                <Link href="/lacak-pesanan?id=ORD-H7-7721" className="text-indigo-600 font-mono hover:underline">
                  ORD-H7-7721 (H-7)
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 PILAR KEUNGGULAN AGREGATOR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 inline-block">
              Keunggulan Arsitektur
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Kenapa NusaTrip Menjadi Pilihan Utama Corporate & Group?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Kombinasi efisiensi aset pihak ketiga dengan kontrol mutu ketat, garansi keutuhan rombongan, dan 4 kru lapangan berlisensi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-xs hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{p.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SHOWCASE DESTINASI UNGGULAN */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
                Zona Titik Jangkar
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Destinasi Favorit Rombongan Indonesia
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Akomodasi hotel dan resto ditempatkan dalam radius optimal ≤ 25 menit dari lokawisata jangkar.
              </p>
            </div>
            <Link href="/destinasi">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold">
                <span>Lihat Seluruh 6 Destinasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS_PREVIEW.map((dest) => (
              <Link
                key={dest.id}
                href="/destinasi"
                className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white">
                      {dest.packageCount}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">{dest.name}</h3>
                  </div>
                </div>
                <div className="p-4 text-xs">
                  <p className="text-[var(--text-secondary)] font-medium">{dest.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SHOWCASE PAKET WISATA POPULER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
                Pilihan Cepat Ritel
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Paket Siap Berangkat (Katalog Fixed Price)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Tanpa perlu negosiasi ulang. Checkout DP 40% langsung diterbitkan dengan batas bayar 1x24 jam.
              </p>
            </div>
            <Link href="/paket-wisata">
              <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-bold">
                <span>Lihat Seluruh Katalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-4 group hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface-page)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                      {pkg.destination}
                    </span>
                    {pkg.badge && <Badge variant="brand" size="sm">{pkg.badge}</Badge>}
                  </div>

                  <h3 className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors">
                    {pkg.title}
                  </h3>

                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-1">
                    <span className="font-semibold text-indigo-950 dark:text-indigo-200 block">
                      {pkg.anchorZone}
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Standar: <strong>{pkg.facilityStandard}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {pkg.spots.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Tarif Mulai Dari:</span>
                    <strong className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(pkg.price)}
                    </strong>
                  </div>
                  <Link href="/paket-wisata">
                    <Button size="sm" variant="gradient" className="text-xs">
                      Pesan Paket
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALUR KERJA AGREGATOR 3 LANGKAH */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50/60 dark:bg-slate-900/40 rounded-3xl border border-[var(--border-subtle)]">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 inline-block">
              Alur Kerja Sistem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Tiga Langkah Mudah Mengatur Wisata Rombongan
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Dari pengajuan kebutuhan, kalkulasi riset operasi, hingga pembukaan kendali H-7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((hw, idx) => {
              const Icon = hw.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] space-y-3 relative overflow-hidden shadow-xs"
                >
                  <span className="text-4xl font-black text-indigo-600/15 absolute right-4 top-4 font-mono">
                    {hw.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{hw.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{hw.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* LAYANAN SPESIALIS EVENT ORGANIZER (EO) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 inline-block">
              Kategori Layanan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Spesialisasi Acara & Rombongan Skala Besar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Pengalaman mengelola perjalanan grup mulai dari 20 hingga 500+ peserta di berbagai kota.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EO_SERVICES.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-3 shadow-xs hover:border-indigo-500 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{srv.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ INTERAKTIF */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 inline-block">
              Tanya Jawab
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "blind-vendor",
                q: "Mengapa NusaTrip menggunakan konsep Blind Vendor saat pemesanan?",
                a: "Konsep Blind Vendor memungkinkan sistem agregator kami mengoptimalkan alokasi kuota kamar hotel dan armada bus terbaik tanpa beban kepemilikan aset fisik. Hal ini menghasilkan tarif lebih murah tanpa menurunkan mutu layanan (hotel dan bus tetap setaraf standar yang dijanjikan).",
              },
              {
                id: "h7-unmasking",
                q: "Apa yang terjadi pada H-7 Keberangkatan?",
                a: "Pada H-7, Pusat Kendali Perjalanan (Travel Command Center) akan membuka seluruh identitas resmi mitra hotel, restoran rekanan, armada PO Bus beserta nomor plat, rundown jam-ke-jam, serta profil 4 kru lapangan ber-SPK dan bersurat keterangan sehat terverifikasi.",
              },
              {
                id: "vip-clearance",
                q: "Bagaimana cara kerja Kartu Status Lunas VIP (VIP Group Clearance)?",
                a: "Di Hari-H keberangkatan, rombongan tidak perlu mengantre scan barcode perorangan di pintu masuk lokawisata. Tour Leader berlisensi akan menunjukkan kartu VIP Clearance rombongan untuk menyelesaikan verifikasi kolektif di gerbang mitra prioritas.",
              },
              {
                id: "escrow-guarantee",
                q: "Bagaimana keamanan uang muka (DP 40%) yang saya bayarkan?",
                a: "Seluruh dana DP disimpan di rekening escrow resmi NusaTrip dan baru disalurkan kepada pihak vendor mitra setelah kontrak operasional H-7 terkunci. Jika terjadi keadaan kahar (force majeure), dana terjamin aman sesuai klausul kontrak resmi berfaktur pajak.",
              },
            ].map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[var(--text-primary)] hover:text-indigo-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-indigo-600" : "text-[var(--text-muted)]"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white text-center space-y-5 shadow-xl relative overflow-hidden border border-indigo-800">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 inline-block">
              Siap Memulai Perjalanan Rombongan Anda?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black max-w-2xl mx-auto">
              Rencanakan Event Kantor atau Liburan Komunitas Anda Bersama NusaTrip
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Konsultasikan jadwal, peroleh estimasi anggaran matematis berbasis DSS, dan nikmati kepastian layanan 4 kru berlisensi.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/kustom-trip">
                <Button size="lg" variant="gradient" className="gap-2 text-xs sm:text-sm font-bold">
                  <span>Mulai Rancang Trip Mandiri</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              {customerAuth ? (
                <Link href="/pelanggan">
                  <Button size="lg" variant="outline" className="text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <span>Akses Dasbor Pelanggan</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <span>Masuk Dasbor Pelanggan</span>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      {isGoogleModalOpen && (
        <GoogleSSOModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
        />
      )}
    </div>
  );
}
