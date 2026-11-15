"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  Building2,
  GraduationCap,
  Heart,
  Tent,
  Award,
  Send,
  Check,
  MapPin,
  Users,
  Compass,
  Plane,
  Calendar,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Quote,
  Bus,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/select";
import { Logo } from "@/components/ui/logo";
import { useTourPackages, addCustomerLead, type TourPackageItem } from "@/lib/data/tour-store";

const DESTINATIONS = [
  {
    id: "jogja",
    name: "Yogyakarta",
    tagline: "Budaya, Alam, & Candi Megah",
    packageCount: "18 Paket",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bali",
    name: "Bali",
    tagline: "Pantai Eksotis & Kemewahan Tropis",
    packageCount: "24 Paket",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bromo",
    name: "Bromo & Malang",
    tagline: "Sunrise Kaldera & Petik Apel",
    packageCount: "14 Paket",
    image: "https://images.unsplash.com/photo-1609137144822-7772186835a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bandung",
    name: "Bandung",
    tagline: "Kesejukan Dataran Tinggi & Kuliner",
    packageCount: "12 Paket",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "lombok",
    name: "Lombok & Gili",
    tagline: "Keindahan Bawah Laut & Rinjani",
    packageCount: "10 Paket",
    image: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "banyuwangi",
    name: "Banyuwangi",
    tagline: "Api Biru Ijen & Savana Baluran",
    packageCount: "8 Paket",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
  },
];

const EO_SERVICES = [
  {
    id: "gathering",
    icon: <Building2 className="w-6 h-6 text-indigo-400" />,
    title: "Company Gathering & Outing Kantor",
    desc: "Perjalanan apresiasi karyawan dengan outbound team-building, gala dinner bertema, dan fasilitas bus eksekutif berstandar pariwisata.",
  },
  {
    id: "study",
    icon: <GraduationCap className="w-6 h-6 text-indigo-400" />,
    title: "Study Tour & Wisata Edukasi Kampus",
    desc: "Program kunjungan industri, museum bersejarah, dan observasi cagar budaya alam yang berizin resmi dengan pendampingan profesional.",
  },
  {
    id: "family",
    icon: <Heart className="w-6 h-6 text-indigo-400" />,
    title: "Family Trip & Liburan Komunitas",
    desc: "Itinerary ramah lansia dan anak, private transport tanpa digabung rombongan lain, serta fleksibilitas jadwal sesuai kenyamanan keluarga.",
  },
  {
    id: "outbound",
    icon: <Tent className="w-6 h-6 text-indigo-400" />,
    title: "Outbound Training & Leadership Camp",
    desc: "Instruktur bersertifikasi BNSP dengan modul motivasi, team coordination, arung jeram, dan simulasi pemecahan masalah kelompok.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Pilih Destinasi & Kategori",
    desc: "Tentukan kota tujuan wisata, perkiraan jumlah peserta rombongan, serta konsep kegiatan (family trip, outing kantor, atau study tour).",
    icon: <MapPin className="w-6 h-6 text-indigo-600" />,
  },
  {
    step: "02",
    title: "Konsultasi & Alokasi Anggaran",
    desc: "Dapatkan simulasi itinerary teroptimasi, alokasi armada bus pariwisata yang tepat, dan rekomendasi hotel terbaik sesuai pagu anggaran.",
    icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
  },
  {
    step: "03",
    title: "Berangkat & Nikmati Perjalanan",
    desc: "Perjalanan dikawal oleh tour leader berlisensi HPI, dokumentasi profesional, fasilitas lengkap, dan jaminan kenyamanan tanpa repot.",
    icon: <Plane className="w-6 h-6 text-indigo-600" />,
  },
];

const WHY_US_PILLARS = [
  {
    title: "Armada Bus Ber-KPS Resmi",
    desc: "Medium bus dan big bus terawat dengan kartu pengawasan resmi Kemenhub, AC dingin, reclining seat, dan supir berpengalaman rute pariwisata.",
    icon: <Bus className="w-6 h-6 text-indigo-600" />,
  },
  {
    title: "Hotel Bintang Terkurasi",
    desc: "Rekanan hotel bintang 3 hingga 5 dengan standar kebersihan prima, lokasi strategis dekat objek wisata, dan sarapan buffet terjamin.",
    icon: <Building2 className="w-6 h-6 text-indigo-600" />,
  },
  {
    title: "Pemandu Berlisensi HPI",
    desc: "Tour leader dan pemandu lokal berlisensi resmi HPI yang komunikatif, menguasai sejarah budaya, serta dibekali pelatihan P3K tanggap darurat.",
    icon: <Award className="w-6 h-6 text-indigo-600" />,
  },
  {
    title: "Transparansi Biaya Tanpa Hidden Fees",
    desc: "Rincian biaya all-in mencakup tiket masuk seluruh objek wisata, retribusi parkir, BBM, tol, dan konsumsi sesuai perjanjian tertulis.",
    icon: <CheckCircle2 className="w-6 h-6 text-indigo-600" />,
  },
];

const TESTIMONIALS = [
  {
    name: "Bambang Setiawan",
    role: "Head of HRD PT Tirta Makmur",
    trip: "Company Outing Yogyakarta 120 Pax",
    comment:
      "Outing tahunan 120 karyawan di Yogyakarta berjalan sangat mulus. Koordinasi armada bus on-time, rundown kegiatan seimbang tidak terburu-buru, dan gala dinner di Tebing Breksi diatur sangat megah. Sangat direkomendasikan untuk corporate trip.",
  },
  {
    name: "Ratna Kusuma Dewi",
    role: "Ketua Paguyuban Alumni SMAN 1",
    trip: "Family Gathering Bromo-Malang 45 Pax",
    comment:
      "Perjalanan keluarga besar ke Bromo dan Malang menyenangkan sekali. Anak-anak dan lansia merasa nyaman karena driver sangat hati-hati dan guide ramah serta sangat sabar memandu sepanjang rute.",
  },
  {
    name: "Hendra Wijaya",
    role: "Procurement Manager TechCorp",
    trip: "Study Tour & Gathering Bali 60 Pax",
    comment:
      "Tertib administrasi dengan invoice resmi, NPWP, dan legalitas yang lengkap. NusaTrip memudahkan kepatuhan administrasi perusahaan kami tanpa ada biaya tersembunyi.",
  },
];

const CORPORATE_CLIENTS = [
  "PT Bank Mandiri",
  "Telkom Indonesia",
  "Astra International",
  "Pertamina Group",
  "Universitas Gadjah Mada",
];

const FAQS = [
  {
    id: "custom-itin",
    question: "Apakah bisa mengajukan custom itinerary dan memilih objek wisata sendiri?",
    answer:
      "Tentu saja. Anda bebas menentukan destinasi wisata yang ingin dikunjungi, durasi hari, preferensi kelas hotel (Bintang 3/4/5), jenis armada kendaraan, hingga konsep acara khusus seperti gala dinner atau outbound training.",
  },
  {
    id: "min-pax",
    question: "Berapa batas minimal jumlah peserta untuk reservasi tour?",
    answer:
      "Untuk paket rombongan privat (gathering/study tour), kami melayani mulai dari 10 pax (menggunakan Toyota Hiace/Isuzu Elf) hingga ratusan peserta menggunakan konvoi Big Bus Pariwisata.",
  },
  {
    id: "payment-terms",
    question: "Bagaimana sistem pembayaran dan kepastian jadwal perjalanan?",
    answer:
      "Pemesanan dilakukan dengan uang muka (DP) sebesar 30% untuk penguncian armada dan akomodasi hotel. Sisa pembayaran dapat diangsur dan diselesaikan sebelum hari keberangkatan sesuai kesepakatan penawaran resmi.",
  },
  {
    id: "insurance-allin",
    question: "Apakah harga penawaran sudah all-in termasuk tiket masuk dan asuransi?",
    answer:
      "Ya. Seluruh penawaran NusaTrip bersifat all-in mencakup tiket masuk seluruh objek wisata sesuai itinerary, akomodasi hotel, konsumsi, armada transportasi, BBM, parkir, retribusi jalan tol, dan asuransi perjalanan.",
  },
];

const DEST_SELECT_OPTIONS = [
  { value: "Yogyakarta", label: "Yogyakarta" },
  { value: "Bali", label: "Bali" },
  { value: "Bromo - Malang", label: "Bromo - Malang" },
  { value: "Bandung", label: "Bandung" },
  { value: "Lombok", label: "Lombok" },
  { value: "Banyuwangi", label: "Banyuwangi" },
];

const CATEGORY_SELECT_OPTIONS = [
  { value: "Company Gathering & Outing", label: "Company Gathering & Outing" },
  { value: "Study Tour & Kunjungan Edukasi", label: "Study Tour & Kunjungan Edukasi" },
  { value: "Family Gathering", label: "Family Gathering" },
  { value: "Outbound & Team Building", label: "Outbound & Team Building" },
  { value: "Private Trip Keluarga", label: "Private Trip Keluarga" },
];

const HOTEL_SELECT_OPTIONS = [
  { value: "Bintang 3", label: "Hotel Bintang 3" },
  { value: "Bintang 4", label: "Hotel Bintang 4" },
  { value: "Bintang 5", label: "Hotel Bintang 5" },
  { value: "Resort / Villa Private", label: "Resort / Villa Private" },
  { value: "Tanpa Hotel (Day Tour)", label: "Tanpa Hotel (Day Tour)" },
];

export default function LandingPage() {
  const allPackages = useTourPackages();
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>("custom-itin");

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadDestination, setLeadDestination] = useState("Yogyakarta");
  const [leadCategory, setLeadCategory] = useState("Company Gathering & Outing");
  const [leadPax, setLeadPax] = useState<number>(30);
  const [leadDays, setLeadDays] = useState<number>(3);
  const [leadHotel, setLeadHotel] = useState("Bintang 4");
  const [leadNotes, setLeadNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activePackages = allPackages.filter((p) => p.isActive);

  const filterPackages = activePackages.filter((pkg) => {
    if (selectedDuration === "all") return true;
    return pkg.duration.toLowerCase().includes(selectedDuration.toLowerCase());
  });

  const handleSelectPackageToBook = (pkg: TourPackageItem) => {
    setLeadDestination(pkg.destination);
    setLeadNotes(`Tertarik memesan paket: "${pkg.title}" (${pkg.duration}) - Estimasi harga ${formatRupiah(pkg.price)}/pax`);
    const customSection = document.getElementById("custom-trip");
    if (customSection) {
      customSection.scrollIntoView({ behavior: "smooth" });
      const nameInput = document.getElementById("lead-client-name");
      nameInput?.focus();
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;

    addCustomerLead({
      name: leadName,
      phone: leadPhone,
      destination: leadDestination,
      category: leadCategory,
      pax: Number(leadPax),
      days: Number(leadDays),
      hotel: leadHotel,
      notes: leadNotes,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setLeadName("");
      setLeadPhone("");
      setLeadNotes("");
    }, 4000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] selection:bg-indigo-500 selection:text-white">
      {/* Header Navigasi Publik */}
      <header className="sticky top-0 z-40 bg-[var(--surface-card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <Logo size="md" subtitle="Tour & Event Organizer" />

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#destinasi" className="hover:text-indigo-600 transition-colors">
              Destinasi Wisata
            </a>
            <a href="#paket-wisata" className="hover:text-indigo-600 transition-colors">
              Paket Tour Pilihan
            </a>
            <a href="#keunggulan" className="hover:text-indigo-600 transition-colors">
              Keunggulan Kami
            </a>
            <a href="#event-organizer" className="hover:text-indigo-600 transition-colors">
              Layanan EO
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#custom-trip"
              className="inline-flex items-center justify-center h-10 px-4 sm:px-5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Minta Penawaran
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section dengan Trajektori Penerbangan Vektor, Ambient Mesh & Floating Badges */}
      <section className="relative pt-12 pb-24 sm:pt-16 sm:pb-32 overflow-hidden border-b border-[var(--border-subtle)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.16),transparent_75%)]">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 -right-32 w-96 h-96 bg-gradient-to-bl from-amber-400/15 to-rose-400/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle Travel Dot Matrix Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] dark:bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" />

        {/* Trajectory Flight Path Graphic SVG */}
        <div className="absolute top-10 left-1/4 right-10 h-72 pointer-events-none hidden lg:block overflow-visible opacity-30">
          <svg className="w-full h-full" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 20 180 C 220 20, 520 220, 750 40"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray="6 8"
            />
            <circle cx="20" cy="180" r="4" fill="#6366f1" />
            <circle cx="750" cy="40" r="5" fill="#6366f1" />
          </svg>
          <div className="absolute top-7 right-8 text-indigo-600">
            <Plane className="w-6 h-6 rotate-45" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/50 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-sm backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Partner Resmi Tour & Gathering Perusahaan</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.15]">
                Wujudkan Liburan & Event Perjalanan Tanpa Beban
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
                NusaTrip melayani paket tour nusantara terkurasi, family gathering, outing kantor, dan study tour dengan jaminan fasilitas hotel terverifikasi dan pemandu berpengalaman.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <a
                  href="#paket-wisata"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span>Eksplorasi Paket Wisata</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#custom-trip"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]/90 backdrop-blur-sm text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
                >
                  Rancang Custom Trip
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Izin & Legalitas Resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Kru & Guide Berlisensi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span>Rating 4.9/5.0 Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* Visual Column dengan Layering & Floating Badges */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute -inset-3 bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-amber-500/10 rounded-[2.5rem] blur-2xl opacity-75 pointer-events-none" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                <img
                  src="https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1000&q=80"
                  alt="Wisata Budaya Candi Yogyakarta"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="p-6 bg-[var(--surface-card)] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Top Destination
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-semibold">Mulai Rp 275.000 / pax</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Paket Istimewa Yogyakarta 3D2N Heritage
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Kombinasi Candi Borobudur, Lava Tour Merapi, Desa Wisata, dan Malioboro dengan fasilitas makan dan bus AC.
                  </p>
                </div>
              </div>

              {/* Floating Badge 1 - Top Left */}
              <div className="absolute -left-4 sm:-left-6 top-6 sm:top-10 backdrop-blur-md bg-white/95 dark:bg-neutral-900/95 border border-white/60 dark:border-white/10 shadow-xl rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-tight">100% Terverifikasi</span>
                  <span className="text-[10px] text-[var(--text-secondary)] block">ASITA & Kemenparekraf</span>
                </div>
              </div>

              {/* Floating Badge 2 - Bottom Right */}
              <div className="absolute -right-4 sm:-right-6 bottom-16 sm:bottom-20 backdrop-blur-md bg-white/95 dark:bg-neutral-900/95 border border-white/60 dark:border-white/10 shadow-xl rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 border border-amber-200 shrink-0">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-tight">Rating 4.9 / 5.0</span>
                  <span className="text-[10px] text-[var(--text-secondary)] block">1.200+ Corporate Klien</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bar Metrik Prestasi & Jaminan Mutu */}
      <section className="relative -mt-10 sm:-mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)]/95 backdrop-blur-md p-6 sm:p-8 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block tracking-tight">15.000+</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">Wisatawan Berangkat</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800 flex items-center justify-center text-violet-600 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block tracking-tight">250+</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">Gathering Perusahaan</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block tracking-tight">10 Kota</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">Destinasi Utama</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block tracking-tight">99.4%</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">Indeks Kepuasan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Alur & Cara Pemesanan Tour (3 Langkah Mudah) */}
      <section className="py-24 relative overflow-hidden border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
              Alur Pemesanan Tour
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-1">
              3 Langkah Praktis Wujudkan Liburan Anda
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Proses cepat, transparan, dan terencana dari awal konsultasi hingga hari kepulangan rombongan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS_STEPS.map((item, index) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-black text-indigo-600/30 group-hover:text-indigo-600 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2.5">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Katalog Destinasi Kota */}
      <section id="destinasi" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-indigo-50/20 to-transparent border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
                Eksplorasi Kota Favorit
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-1">Mau Berwisata ke Mana Hari Ini?</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              Pilihan kota terbaik di Indonesia dengan pemandu berpengalaman dan akomodasi terstandarisasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                className="group relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-52 overflow-hidden relative">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-600/90 text-white inline-block mb-1 shadow-sm backdrop-blur-sm">
                      {dest.packageCount}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight">{dest.name}</h3>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">{dest.tagline}</span>
                  <a href="#paket-wisata" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Paket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Katalog Paket Wisata Terpopuler */}
      <section id="paket-wisata" className="py-24 bg-[var(--surface-subtle)]/70 relative overflow-hidden border-b border-[var(--border-subtle)]">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
              Pilihan Paket Terpopuler
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-1">Rekomendasi Paket Wisata Siap Berangkat</h2>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {[
                { id: "all", label: "Semua Durasi" },
                { id: "1 Hari", label: "1 Hari City Tour" },
                { id: "2D1N", label: "2 Hari 1 Malam" },
                { id: "3D2N", label: "3 Hari 2 Malam" },
                { id: "4D3N", label: "4 Hari 3 Malam" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDuration(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedDuration === tab.id
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-indigo-50/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900">
                      {pkg.destination}
                    </span>
                    {pkg.badge && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 line-clamp-2">
                    {pkg.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Mulai dari</span>
                    <span className="text-xl font-extrabold text-indigo-600">{formatRupiah(pkg.price)}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">/ pax</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">
                      Destinasi Dikunjungi:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                      {pkg.spots.map((spot, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{spot}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">
                      Fasilitas Termasuk:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.inclusions.map((inc, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-medium border border-[var(--border-subtle)]">
                          {inc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)]">
                  <Button
                    variant="gradient"
                    size="md"
                    type="button"
                    onClick={() => handleSelectPackageToBook(pkg)}
                    className="w-full text-xs font-bold shadow-sm"
                  >
                    Pesan Paket Ini
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filterPackages.length === 0 && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)]">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Belum ada paket wisata aktif untuk filter ini</p>
            </div>
          )}
        </div>
      </section>

      {/* 4 Pilar Keunggulan Standar Layanan NusaTrip */}
      <section id="keunggulan" className="py-24 relative overflow-hidden border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
              Standar Layanan Unggul
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-1">
              Kenapa Memilih NusaTrip untuk Perjalanan Anda?
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Dedikasi penuh pada keselamatan, transparansi harga, dan kenyamanan fasilitas selama kegiatan tour berlangsung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US_PILLARS.map((p, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{p.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layanan EO Berkelas Korporat */}
      <section id="event-organizer" className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-y border-indigo-950">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest px-3.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/80 inline-block mb-3">
              Solusi Perjalanan Korporat
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Layanan Event Organizer Wisata NusaTrip
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Kami menangani keseluruhan perencanaan event mulai dari rundown, perizinan, gala dinner, hingga simulasi anggaran efisien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EO_SERVICES.map((srv) => (
              <div
                key={srv.id}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 hover:border-indigo-400/40 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {srv.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni & Klien Korporat Kami */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-indigo-50/20 via-white to-transparent border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
              Dipercaya Ratusan Klien
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-1">
              Apa Kata Klien Tentang NusaTrip?
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              {CORPORATE_CLIENTS.map((corp, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs font-semibold text-[var(--text-secondary)] shadow-sm"
                >
                  {corp}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed italic mb-6">
                    "{t.comment}"
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[var(--text-primary)] block">{t.name}</span>
                    <span className="text-[11px] text-[var(--text-secondary)] block">{t.role}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900">
                    {t.trip}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pertanyaan yang Sering Diajukan (FAQ Accordion) */}
      <section id="faq" className="py-24 relative overflow-hidden border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
              Tanya Jawab
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-1">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Informasi lengkap seputar mekanisme reservasi, ketentuan custom trip, dan kepastian fasilitas perjalanan.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-indigo-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)]/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formulir Permintaan Kustom dengan Tombol Kirim Horizontal Kokoh */}
      <section id="custom-trip" className="py-24 relative overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 dark:from-indigo-950/20 dark:via-neutral-950 dark:to-neutral-900 border-b border-[var(--border-subtle)]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl border border-indigo-100/90 dark:border-indigo-900/50 bg-[var(--surface-card)] p-8 sm:p-12 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
                Rancang Perjalanan Anda
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1">Konsultasikan Kebutuhan Wisata Anda</h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
                Isi form berikut untuk mendapatkan estimasi penawaran terbaik dari tim NusaTrip.
              </p>
            </div>

            {isSubmitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Terima kasih! Permintaan trip Anda telah tercatat di sistem kami. Tim NusaTrip akan segera menghubungi Anda melalui WhatsApp.</span>
              </div>
            )}

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-client-name" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Nama Pemesan / Instansi
                  </label>
                  <input
                    id="lead-client-name"
                    name="clientName"
                    type="text"
                    required
                    placeholder="Contoh: PT Sumber Berkah (Bpk. Ryan)"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lead-client-phone" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    id="lead-client-phone"
                    name="clientPhone"
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  id="lead-dest-select"
                  label="Kota Tujuan Wisata"
                  value={leadDestination}
                  onChange={(val) => setLeadDestination(val)}
                  options={DEST_SELECT_OPTIONS}
                />

                <CustomSelect
                  id="lead-cat-select"
                  label="Kategori Kegiatan"
                  value={leadCategory}
                  onChange={(val) => setLeadCategory(val)}
                  options={CATEGORY_SELECT_OPTIONS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="lead-pax-count" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Perkiraan Peserta (Pax)
                  </label>
                  <input
                    id="lead-pax-count"
                    name="paxCount"
                    type="number"
                    min={2}
                    value={leadPax}
                    onChange={(e) => setLeadPax(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lead-days-count" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Durasi Wisata (Hari)
                  </label>
                  <input
                    id="lead-days-count"
                    name="daysCount"
                    type="number"
                    min={1}
                    value={leadDays}
                    onChange={(e) => setLeadDays(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <CustomSelect
                  id="lead-hotel-select"
                  label="Akomodasi Hotel"
                  value={leadHotel}
                  onChange={(val) => setLeadHotel(val)}
                  options={HOTEL_SELECT_OPTIONS}
                />
              </div>

              <div>
                <label htmlFor="lead-additional-notes" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  id="lead-additional-notes"
                  name="additionalNotes"
                  rows={3}
                  placeholder="Ceritakan preferensi spot wisata, katering khusus, atau agenda gala dinner..."
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Tombol Kirim Rencana Wisata dengan Horizontal Flexbox Kokoh */}
              <div className="pt-2">
                <Button
                  variant="gradient"
                  size="lg"
                  type="submit"
                  leftIcon={<Send className="w-4 h-4 shrink-0" />}
                  className="w-full h-12 text-sm font-bold shadow-lg shadow-indigo-500/25 flex flex-row items-center justify-center gap-2.5"
                >
                  <span>Kirimkan Rencana Wisata Saya</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer Proporsional */}
      <footer className="py-12 bg-[var(--surface-card)] border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" subtitle="Tour & Event Organizer" />
          <p>© 2026 NusaTrip Tour & Event Organizer. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <span>Yogyakarta, Indonesia</span>
            <span>Kontak: info@nusatrip.id</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
