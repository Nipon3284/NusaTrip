"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  Download,
  Share2,
  Navigation,
  Radio,
  Star,
  Users,
  ShieldCheck,
  Building2,
  ArrowRight,
  Phone,
  QrCode,
  SlidersHorizontal,
  MapPin,
  Lock,
  PlusCircle,
  FileCheck2,
  LogIn,
  LogOut,
  User,
  Award,
  Briefcase,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { CustomSelect } from "@/components/ui/select";
import {
  useCustomerAuth,
  useCustomerLeads,
  updateLeadDetails,
  updateRepaymentStatus,
  submitComponentRating,
  sendNegotiationMessage,
  saveCustomerProfile,
  logoutCustomer,
  type CustomerLeadItem,
} from "@/lib/data/tour-store";
import { GoogleSSOModal } from "@/components/auth/google-sso-modal";

const INSTANCE_CATEGORIES = [
  { value: "Perusahaan (Corporate B2B)", label: "Perusahaan (Corporate B2B)" },
  { value: "Sekolah / Kampus (Study Tour)", label: "Sekolah / Kampus (Study Tour)" },
  { value: "Komunitas / Klub Hobi", label: "Komunitas / Klub Hobi" },
  { value: "Instansi Medis / Rumah Sakit", label: "Instansi Medis / Rumah Sakit" },
  { value: "Keluarga & Rombongan Pribadi", label: "Keluarga & Rombongan Pribadi" },
];

function EmptyTabNotice({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] flex items-center justify-center">
        <Icon className="w-7 h-7" />
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {desc}
        </p>
      </div>
      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
        <Link href="/kustom-trip">
          <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-bold shadow-xs">
            <PlusCircle className="w-4 h-4" />
            <span>Rancang Trip Baru Sekarang</span>
          </Button>
        </Link>
        <Link href="/paket-wisata">
          <Button size="sm" variant="outline" className="text-xs font-semibold border-[var(--border-default)]">
            <span>Lihat Paket Wisata</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

const getRealActivePhase = (
  lead: CustomerLeadItem
): "masa_tunggu" | "h7_terbuka" | "hari_h_berjalan" | "selesai_h1" => {
  if (lead.commandCenterPhase) return lead.commandCenterPhase;
  if (lead.status === "selesai") return "selesai_h1";

  if (lead.departureDate) {
    const now = new Date();
    const dep = new Date(lead.departureDate);
    const diffDays = Math.ceil((dep.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const tripDays = lead.days || 2;

    if (diffDays > 7) return "masa_tunggu";
    if (diffDays >= 1 && diffDays <= 7) return "h7_terbuka";
    if (diffDays <= 0 && diffDays >= -tripDays) return "hari_h_berjalan";
    if (diffDays < -tripDays) return "selesai_h1";
  }

  if (lead.status === "final_h7") return "h7_terbuka";
  return "masa_tunggu";
};

export default function CustomerDashboardPage() {
  const customerAuth = useCustomerAuth();
  const leads = useCustomerLeads();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "pesanan" | "command_center" | "negosiasi" | "dokumen" | "rating"
  >("pesanan");

  // Profile completion recommendation states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profilePicName, setProfilePicName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileInstitution, setProfileInstitution] = useState("");
  const [profilePicRole, setProfilePicRole] = useState("Ketua Panitia Rombongan");
  const [profileCategory, setProfileCategory] = useState("Perusahaan (Corporate B2B)");
  const [profileCity, setProfileCity] = useState("Yogyakarta");
  const [profileNotes, setProfileNotes] = useState("");

  // Auto-prompt profile completion if logged in but incomplete
  React.useEffect(() => {
    if (customerAuth) {
      setProfilePicName(customerAuth.picName || customerAuth.name || "");
      setProfilePhone(customerAuth.phone || "");
      setProfileInstitution(customerAuth.institution || "");
      setProfilePicRole(customerAuth.picRole || "Ketua Panitia Rombongan");
      setProfileCategory(customerAuth.institutionCategory || "Perusahaan (Corporate B2B)");
      setProfileCity(customerAuth.city || "Yogyakarta");
      setProfileNotes(customerAuth.notes || "");

      if (!customerAuth.isProfileComplete) {
        setIsProfileModalOpen(true);
      }
    }
  }, [customerAuth]);

  // Selected order for command center / negotiation
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [commandPhase, setCommandPhase] = useState<
    "masa_tunggu" | "h7_terbuka" | "hari_h_berjalan" | "selesai_h1"
  >("hari_h_berjalan");

  // Negotiation state
  const [negoBidInput, setNegoBidInput] = useState<number>(45000000);
  const [negoMessageInput, setNegoMessageInput] = useState("");

  // Rating state
  const [ratingHotel, setRatingHotel] = useState(5);
  const [ratingResto, setRatingResto] = useState(5);
  const [ratingBus, setRatingBus] = useState(5);
  const [ratingTL, setRatingTL] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingFeedbackMsg, setRatingFeedbackMsg] = useState<string | null>(null);

  // Format currency
  const formatRupiah = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter pesanan khusus untuk akun pelanggan yang sedang login (isolasi data antar akun)
  const userLeads = React.useMemo(() => {
    if (!customerAuth) return [];
    const authEmail = (customerAuth.email || "").toLowerCase().trim();
    const authId = (customerAuth.id || customerAuth.uid || "").toLowerCase().trim();

    return leads.filter((lead) => {
      const leadEmail = (lead.userEmail || "").toLowerCase().trim();
      const leadId = (lead.userId || "").toLowerCase().trim();
      if (leadEmail && authEmail && leadEmail === authEmail) return true;
      if (leadId && authId && leadId === authId) return true;
      return false;
    });
  }, [leads, customerAuth]);

  // Find selected active lead from user's own orders
  const activeLead = React.useMemo(() => {
    if (userLeads.length === 0) return null;
    return userLeads.find((l) => l.id === selectedOrderId) || userLeads[0] || null;
  }, [userLeads, selectedOrderId]);

  // Auto-sync selectedOrderId when activeLead changes
  React.useEffect(() => {
    if (activeLead && activeLead.id !== selectedOrderId) {
      setSelectedOrderId(activeLead.id);
      setNegoBidInput(activeLead.customerBid || activeLead.budget || 45000000);
      setCommandPhase(getRealActivePhase(activeLead));
    }
  }, [activeLead, selectedOrderId]);

  const handleSelectOrder = (lead: CustomerLeadItem) => {
    setSelectedOrderId(lead.id);
    setNegoBidInput(lead.customerBid || lead.budget || 45000000);
    setCommandPhase(getRealActivePhase(lead));
  };

  const handleSendNego = () => {
    if (!negoMessageInput.trim() || !activeLead) return;
    sendNegotiationMessage(activeLead.id, negoMessageInput.trim(), negoBidInput, "pelanggan");
    setNegoMessageInput("");
  };

  const handlePayRepayment = (leadId: string) => {
    updateRepaymentStatus(leadId, true);
    alert("Pelunasan 60% berhasil diverifikasi ke rekening escrow NusaTrip!");
  };

  const handleRatingSubmit = () => {
    if (!activeLead) return;
    submitComponentRating(activeLead.id, {
      ratingHotel,
      ratingRestoran: ratingResto,
      ratingBus,
      ratingTourLeader: ratingTL,
      ulasan: ratingComment,
    });
    setRatingFeedbackMsg("Evaluasi berhasil dikirim! Masukan Anda menjadi acuan prioritas solver LP NusaTrip.");
    setTimeout(() => setRatingFeedbackMsg(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {!customerAuth ? (
          <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 flex items-center justify-center shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block">
                Akses Terproteksi Khusus Pelanggan
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Masuk untuk Mengakses Dasbor Pelanggan & Event Rombongan
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
                Halaman ini memuat dokumen legal event rombongan, tagihan termin DP 40%, ruang negosiasi B2B, dan Pusat Kendali Perjalanan H-7.
                Silakan masuk dengan akun Google terdaftar dan lengkapi data instansi penanggung jawab (PIC).
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Button
                size="lg"
                variant="gradient"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full sm:w-auto gap-2 font-bold shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk dengan Akun Google</span>
              </Button>

              <Link href="/kustom-trip" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full gap-2 text-xs">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Rancang Trip Baru</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Authenticated Customer Profile Header */}
            <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
                  {customerAuth.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                      {customerAuth.name}
                    </h1>
                    <Badge variant="brand" size="sm">
                      {customerAuth.institution || "Profil Belum Lengkap"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    {customerAuth.email} &bull; Akun Pelanggan Terverifikasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <Link href="/kustom-trip">
                  <Button size="sm" variant="gradient" className="gap-1.5 text-xs">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Rancang Trip Baru</span>
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={logoutCustomer} className="gap-1 text-xs">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </Button>
              </div>
            </div>

            {/* Rekomendasi Lengkapi Data Diri & Profil Instansi */}
            {!customerAuth.isProfileComplete && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-100 block">
                      Rekomendasi: Lengkapi Data Diri & Profil Instansi
                    </strong>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      Lengkapi data penanggung jawab (PIC) dan profil lembaga Anda untuk mengaktifkan penerbitan resmi Surat Perintah Kerja (SPK), Faktur Pajak, dan Kartu VIP Clearance.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-xs font-bold shrink-0 h-9 px-4"
                >
                  <span>Lengkapi Data Sekarang</span>
                </Button>
              </div>
            )}

        {/* Top Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Total Pesanan Rombongan</span>
            </span>
            <strong className="text-xl sm:text-2xl font-black text-[var(--text-primary)] block">
              {userLeads.length} Event
            </strong>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              Semua terjamin keutuhan kuota
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Trip Aktif / Siaga H-7</span>
            </span>
            <strong className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
              {userLeads.filter((l) => l.status === "final_h7" || l.status === "proses_dss").length} Trip
            </strong>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Vendor resmi & rundown siap
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rekening Escrow DP Terjamin</span>
            </span>
            <strong className="text-xl sm:text-2xl font-black text-emerald-600 block">
              100% Aman
            </strong>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Proteksi dana uang muka agregator
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>4 Kru Ber-SPK Lengkap</span>
            </span>
            <strong className="text-xl sm:text-2xl font-black text-purple-600 block">
              Terverifikasi
            </strong>
            <span className="text-[10px] text-[var(--text-muted)] block">
              TL, Drone, Medis, Pengawas Mutu
            </span>
          </div>
        </div>

        {/* Dashboard Nav Tabs */}
        <div className="border-b border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "pesanan", label: "Pesanan Saya", count: userLeads.length },
            { id: "command_center", label: "Travel Command Center H-7 & Hari-H" },
            { id: "negosiasi", label: "Ruang Nego B2B" },
            { id: "dokumen", label: "Dompet Dokumen & LPJ" },
            { id: "rating", label: "Evaluasi & Rating Komponen" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-indigo-600"
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === t.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: DAFTAR PESANAN SAYA */}
        {activeTab === "pesanan" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Daftar Pesanan & Status Perjalanan Rombongan
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Pantau setiap tahap pesanan mulai dari negosiasi anggaran, penguncian DP, verifikasi H-7, hingga hari-H.
                </p>
              </div>
              <Link href="/kustom-trip">
                <Button size="sm" variant="gradient" className="text-xs gap-1">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Tambah Trip</span>
                </Button>
              </Link>
            </div>

            {userLeads.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] flex items-center justify-center shadow-inner">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    Belum Ada Pesanan Perjalanan
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Halo, <strong className="text-[var(--text-primary)]">{customerAuth?.name || "Pelanggan"}</strong>! Akun Anda siap digunakan. Anda belum memiliki pesanan atau pengajuan perjalanan rombongan aktif.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Link href="/kustom-trip">
                    <Button size="md" variant="gradient" className="gap-2 text-xs font-bold shadow-md">
                      <PlusCircle className="w-4 h-4" />
                      <span>Rancang Trip Kustom B2B Baru</span>
                    </Button>
                  </Link>
                  <Link href="/paket-wisata">
                    <Button size="md" variant="outline" className="gap-2 text-xs font-semibold border-[var(--border-default)]">
                      <SlidersHorizontal className="w-4 h-4 text-[var(--brand-primary)]" />
                      <span>Jelajahi Paket Wisata Populer</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userLeads.map((item) => {
                  const isSelected = activeLead?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition-all text-xs space-y-3 bg-[var(--surface-card)] ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                          : "border-[var(--border-subtle)] hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                              {item.id}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {item.destination} &bull; {item.pax} Pax ({item.days} Hari)
                            </span>
                          </div>
                          <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                            {item.institution || item.name}
                          </h3>
                        </div>

                        <Badge
                          variant={
                            item.status === "final_h7"
                              ? "emerald"
                              : item.status === "selesai"
                              ? "neutral"
                              : item.status === "negosiasi"
                              ? "warning"
                              : "brand"
                          }
                          size="sm"
                        >
                          {item.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] text-[11px]">
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Total Kontrak:</span>
                          <strong className="text-indigo-600 dark:text-indigo-400">
                            {formatRupiah(item.budget || 0)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">DP 40%:</span>
                          <strong className="text-emerald-600">
                            {formatRupiah(item.dpAmount || Math.round((item.budget || 0) * 0.4))}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Pelunasan 60%:</span>
                          <strong className="text-amber-600">
                            {formatRupiah(item.repaymentAmount || Math.round((item.budget || 0) * 0.6))}
                          </strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectOrder(item);
                            setActiveTab("command_center");
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Buka Command Center</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {item.status === "negosiasi" && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectOrder(item);
                                setActiveTab("negosiasi");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-semibold text-[11px] hover:bg-amber-600 transition-colors"
                            >
                              Masuk Ruang Nego
                            </button>
                          )}
                          {!item.isRepaymentPaid && item.status === "final_h7" && (
                            <button
                              type="button"
                              onClick={() => handlePayRepayment(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition-colors"
                            >
                              Bayar Pelunasan 60%
                            </button>
                          )}
                          {item.status === "selesai" && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectOrder(item);
                                setActiveTab("rating");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[11px] hover:bg-indigo-100 transition-colors"
                            >
                              Beri Rating
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRAVEL COMMAND CENTER TERPADU */}
        {activeTab === "command_center" && activeLead && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[var(--text-muted)] text-[11px]">Sedang Menampilkan:</span>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                  {activeLead.institution || activeLead.name} ({activeLead.id})
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {activeLead.destination} &bull; {activeLead.pax} Peserta &bull; {activeLead.days} Hari
                </p>
              </div>

              {/* Selector to switch which lead to view */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">Ganti Pesanan:</span>
                <CustomSelect
                  value={selectedOrderId}
                  onChange={(val) => {
                    const found = userLeads.find((l) => l.id === val);
                    if (found) handleSelectOrder(found);
                  }}
                  options={userLeads.map((l) => ({
                    value: l.id,
                    label: `${l.id} - ${l.institution || l.name} (${l.destination})`,
                  }))}
                  buttonClassName="h-8 text-xs font-bold min-w-[220px]"
                />
              </div>
            </div>

            {/* Real-time Timeline Stepper */}
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)]">
                  Progres Tahapan Waktu Perjalanan Riil:
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Fase Berjalan: {getRealActivePhase(activeLead).replace("_", " ").toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: "masa_tunggu", label: "1. H-30 s/d H-8", desc: "Masa Tunggu & Blind" },
                  { id: "h7_terbuka", label: "2. Fase H-7", desc: "Buka Vendor & SPK Kru" },
                  { id: "hari_h_berjalan", label: "3. Eksekusi Hari-H", desc: "VIP Clearance & Live GPS" },
                  { id: "selesai_h1", label: "4. Fase H+1", desc: "LPJ Pajak & Rating Komponen" },
                ].map((ph) => {
                  const isRealActive = getRealActivePhase(activeLead) === ph.id;
                  const isViewing = commandPhase === ph.id;
                  return (
                    <button
                      key={ph.id}
                      type="button"
                      onClick={() => setCommandPhase(ph.id as any)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isViewing
                          ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 shadow-xs font-bold"
                          : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-white/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="block font-bold">{ph.label}</span>
                        {isRealActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <span className="text-[10px] block opacity-80">{ph.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FASE 1: H-30 S/D H-8 (Masa Tunggu) */}
            {commandPhase === "masa_tunggu" && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Status Keuangan & Rekening Escrow DP 40%</span>
                    </span>
                    <Badge variant="emerald" size="sm">DP 40% TERKUNCI AMAN</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                      <span className="text-[10px] text-[var(--text-muted)] block">Total Kontrak Event</span>
                      <strong className="text-indigo-700 dark:text-indigo-300">{formatRupiah(activeLead.budget || 0)}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                      <span className="text-[10px] text-[var(--text-muted)] block">DP 40% (Escrow Terjamin)</span>
                      <strong className="text-emerald-600">{formatRupiah(activeLead.dpAmount || Math.round((activeLead.budget || 0) * 0.4))}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                      <span className="text-[10px] text-[var(--text-muted)] block">Pelunasan 60% (Jatuh Tempo H-7)</span>
                      <strong className="text-amber-600">{formatRupiah(activeLead.repaymentAmount || Math.round((activeLead.budget || 0) * 0.6))}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                    <Lock className="w-4 h-4" />
                    <span>Itinerary Sementara & Standar Blind Vendor Terjamin</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-[var(--text-secondary)] space-y-2">
                    <p><strong>Akomodasi:</strong> Hotel Setaraf {activeLead.hotel || "Bintang 3"} Zona {activeLead.destination} (Identitas resmi dibuka H-7)</p>
                    <p><strong>Konsumsi:</strong> Restoran Prasmanan Tradisional Higienis (Identitas resmi dibuka H-7)</p>
                    <p><strong>Armada:</strong> Bus Pariwisata Eksekutif {activeLead.pax} Seat + AC Dingin + Driver Berlisensi</p>
                    <p><strong>Titik Kunjungan:</strong> {activeLead.selectedSpots?.join(", ") || "Wisata Budaya, Alam & Rekreasi"}</p>
                  </div>
                  <p className="text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
                    Sistem agregator sedang mengunci alokasi kuota terbaik tanpa kursi kosong (*zero idle capacity*).
                    Identitas resmi vendor akan terbuka otomatis pada H-7.
                  </p>
                </div>
              </div>
            )}

            {/* FASE 2: H-7 TERBUKA (Unmasking) */}
            {commandPhase === "h7_terbuka" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Identitas Mitra Vendor Resmi (Terbuka Penuh H-7)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 font-mono px-2 py-0.5 rounded font-bold">
                      H-7 UNMASKED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                      <strong className="block text-indigo-700 dark:text-indigo-300">Hotel Terverifikasi:</strong>
                      <span>Grand Keisha Yogyakarta</span>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Jl. Affandi No.9, Gejayan ({Math.ceil(activeLead.pax / 2)} Kamar Twin Bed Siaga)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                      <strong className="block text-indigo-700 dark:text-indigo-300">Restoran Rekanan:</strong>
                      <span>RM Bale Raos Keraton</span>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Prasmanan Tradisional Raja ({activeLead.pax} Porsi Siap Saji)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                      <strong className="block text-indigo-700 dark:text-indigo-300">Armada Bus Pariwisata:</strong>
                      <span>PO Haryanto (Jetbus 5 Eksekutif)</span>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Plat: AB 7788 CD &bull; AC Dingin, Audio, Reclining Seat</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                      <strong className="block text-indigo-700 dark:text-indigo-300">Pusat Oleh-Oleh:</strong>
                      <span>Bakpia Pathok 25 Yogyakarta</span>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Voucher Diskon Rombongan 15% Siap Digunakan</p>
                    </div>
                  </div>
                </div>

                {/* 4 Kru Lapangan Mutlak dengan Tombol Unduh Dokumen */}
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Profil 4 Kru Lapangan yang Bertugas (Single Source of Truth Admin):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { role: "Tour Leader", name: "Budi Santoso, S.Par", cert: "Lisensi HPI-DIY-2021" },
                      { role: "Dokumentasi", name: "Reza Mahendra", cert: "Pilot Drone 4K FPV" },
                      { role: "Tim Medis", name: "Ns. Maya Indah, S.Kep", cert: "P3K K3 Kemenkes Terverifikasi" },
                      { role: "Pengawas Mutu", name: "Aris Munandar", cert: "Koordinator Kontrol Lapangan" },
                    ].map((kru, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[var(--text-primary)] block">{kru.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{kru.role} &bull; {kru.cert}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="emerald" size="sm">SPK & Sehat</Badge>
                          <button
                            type="button"
                            onClick={() => alert(`Mengunduh SPK & Surat Sehat ${kru.name}...`)}
                            className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            <Download className="w-2.5 h-2.5" /> Unduh Dokumen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tagihan Pelunasan 60% */}
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">Tagihan Pelunasan 60%:</span>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Nominal: <strong>{formatRupiah(activeLead.repaymentAmount || Math.round((activeLead.budget || 0) * 0.6))}</strong> &bull; Status:{" "}
                      <span className={activeLead.isRepaymentPaid ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
                        {activeLead.isRepaymentPaid ? "LUNAS 100%" : "MENUNGGU PEMBAYARAN"}
                      </span>
                    </p>
                  </div>
                  {!activeLead.isRepaymentPaid ? (
                    <Button size="sm" variant="gradient" onClick={() => handlePayRepayment(activeLead.id)}>
                      Bayar Pelunasan 60% (Escrow)
                    </Button>
                  ) : (
                    <Badge variant="emerald" size="md">LUNAS 100% TERVERIFIKASI</Badge>
                  )}
                </div>
              </div>
            )}

            {/* FASE 3: HARI-H EKSEKUSI (VIP Clearance & Live GPS) */}
            {commandPhase === "hari_h_berjalan" && (
              <div className="space-y-4">
                {/* Kartu Status Lunas VIP (VIP Group Clearance) */}
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Award className="w-36 h-36" />
                  </div>
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="font-extrabold text-sm tracking-wider uppercase text-amber-300">
                          Kartu Status Lunas VIP (Group Clearance)
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono font-extrabold text-[11px]">
                        {activeLead.vipClearanceCode || "VIP-CLR-4491-ID"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-amber-200/80 block">Nama Instansi / Rombongan:</span>
                        <strong className="text-base font-extrabold text-white">
                          {activeLead.institution || activeLead.name}
                        </strong>
                        <p className="text-[11px] text-amber-200 mt-0.5">
                          Kapasitas: <strong>{activeLead.pax} Peserta Terdaftar</strong>
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-200/80 block">Protokol Akses Masuk Destinasi:</span>
                        <span className="font-bold text-emerald-400 block">
                          Bebas Antre Scan Barcode Perorangan
                        </span>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          Tour Leader menyelesaikan verifikasi kolektif di loket prioritas mitra NusaTrip.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-amber-400/30 flex items-center justify-between text-[11px]">
                      <span className="text-amber-200">Status Operasional Hari-H:</span>
                      <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        ROMBONGAN AKTIF DI LOKASI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Tracking GPS Bus (Web-Beacon) */}
                <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${activeLead.webBeacon ? "text-emerald-600 animate-pulse" : "text-slate-400"}`} />
                      <span className="font-bold text-indigo-950 dark:text-indigo-200">
                        Live Tracking GPS Bus (Web-Beacon Real-Time)
                      </span>
                    </div>
                    {activeLead.webBeacon ? (
                      <Badge variant="emerald" size="sm">GPS AKTIF</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">STANDBY</Badge>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Sumber Koordinat:</span>
                      <strong className="text-[var(--text-primary)]">
                        {activeLead.webBeacon?.driverPhone ||
                          (activeLead.assignedCrew?.tourLeader
                            ? `Ponsel TL: ${activeLead.assignedCrew.tourLeader.name} (${activeLead.assignedCrew.tourLeader.phone})`
                            : "Ponsel Tour Leader Ber-SPK")}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Kecepatan Armada:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {activeLead.webBeacon?.speedKmh ? `${activeLead.webBeacon.speedKmh} km/jam` : "0 km/jam (Siaga)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Titik Koordinat:</span>
                      <span className="font-mono text-xs text-indigo-600">
                        {activeLead.webBeacon?.busLat
                          ? `${activeLead.webBeacon.busLat}, ${activeLead.webBeacon.busLng}`
                          : "Menunggu transmisi GPS aktif"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)]">
                      <strong>Posisi Terkini:</strong>{" "}
                      {activeLead.webBeacon?.statusRundown ||
                        "Armada dan kru berada dalam persiapan siaga keberangkatan."}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="gradient"
                      className="flex-1 gap-2 text-xs"
                      onClick={() => {
                        const shareUrl = `https://nusatrip.id/lacak-pesanan?id=${activeLead.id}`;
                        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `Pantau posisi rombongan ${activeLead.institution || activeLead.name} di NusaTrip Live GPS: ${shareUrl}`
                        )}`;
                        window.open(waUrl, "_blank");
                      }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan Link Pelacakan ke WhatsApp</span>
                    </Button>
                    <Link href={`/lacak-pesanan?id=${activeLead.id}`}>
                      <Button size="sm" variant="outline" className="gap-2 text-xs w-full sm:w-auto">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Buka Layar Penuh</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* FASE 4: H+1 PASCA ACARA (LPJ & Rating) */}
            {commandPhase === "selesai_h1" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Laporan Pertanggungjawaban (LPJ) & Dokumen Pajak Resmi</span>
                    </span>
                    <Badge variant="emerald" size="sm">TERVERIFIKASI AUDIT</Badge>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Dokumen administratif resmi instansi Anda telah diverifikasi dan siap diunduh:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh Invoice Lunas INV-${activeLead.id}-FINAL.pdf...`)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 text-left hover:border-emerald-500 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <strong className="block text-[var(--text-primary)]">Invoice Lunas</strong>
                        <span className="text-[10px] text-[var(--text-muted)]">Kwitansi Bermaterai</span>
                      </div>
                      <Download className="w-4 h-4 text-emerald-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh Faktur Pajak FP-${activeLead.id}.pdf...`)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 text-left hover:border-emerald-500 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <strong className="block text-[var(--text-primary)]">Faktur Pajak</strong>
                        <span className="text-[10px] text-[var(--text-muted)]">PPN / PPh Resmi</span>
                      </div>
                      <Download className="w-4 h-4 text-emerald-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh Berita Acara Perjalanan BAP-${activeLead.id}.pdf...`)}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 text-left hover:border-emerald-500 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <strong className="block text-[var(--text-primary)]">Berita Acara</strong>
                        <span className="text-[10px] text-[var(--text-muted)]">Presensi 4 Kru Lapangan</span>
                      </div>
                      <Download className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "command_center" && !activeLead && (
          <EmptyTabNotice
            icon={QrCode}
            title="Belum Ada Perjalanan untuk Command Center"
            desc="Fitur pemantauan H-7, pelacakan live armada bus, dan rincian kontak 4 kru ber-SPK aktif ketika Anda memiliki pesanan perjalanan."
          />
        )}

        {/* TAB 3: RUANG NEGOSIASI B2B */}
        {activeTab === "negosiasi" && activeLead && (
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Ruang Negosiasi Penawaran B2B: {activeLead.id}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Diskusi penyesuaian fasilitas dan anggaran rombongan berpandu sistem DSS NusaTrip.
                </p>
              </div>
              <Badge variant="warning" size="sm">TAHAP NEGOSIASI AKTIF</Badge>
            </div>

            {/* Negotiation Feed */}
            <div className="p-4 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] space-y-3 max-h-80 overflow-y-auto">
              {(activeLead.negotiationMessages || [
                {
                  id: "msg-init",
                  sender: "pelanggan",
                  message: `Halo NusaTrip, kami mengajukan rencana ${activeLead.category} untuk ${activeLead.pax} Pax ke ${activeLead.destination} dengan anggaran ${formatRupiah(activeLead.budget)}.`,
                  timestamp: "09:00 WIB",
                },
                {
                  id: "msg-dss",
                  sender: "sistem_dss",
                  message: `Kalkulasi DSS: Anggaran Rp ${formatRupiah(activeLead.budget)} telah kami evaluasi terhadap batas modal dasar vendor terdekat. Rekomendasi deal optimal kami kunci di ${formatRupiah(Math.round((activeLead.bottomLineCost || 40000000) * 1.18))}.`,
                  timestamp: "09:05 WIB",
                },
              ]).map((m, idx) => (
                <div
                  key={m.id || idx}
                  className={`p-3 rounded-xl max-w-lg text-xs ${
                    m.sender === "pelanggan"
                      ? "ml-auto bg-indigo-600 text-white"
                      : m.sender === "admin"
                      ? "mr-auto bg-slate-200 dark:bg-slate-800 text-[var(--text-primary)]"
                      : "mx-auto bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-80 mb-1">
                    <span className="font-bold uppercase">{m.sender.replace("_", " ")}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>

            {/* Input Form for New Offer */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-56">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    step={500000}
                    value={negoBidInput}
                    onChange={(e) => setNegoBidInput(Number(e.target.value))}
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-bold"
                    placeholder="Nominal tawaran..."
                  />
                </div>
                <input
                  type="text"
                  value={negoMessageInput}
                  onChange={(e) => setNegoMessageInput(e.target.value)}
                  placeholder="Ketik pesan atau permohonan fasilitas tambahan..."
                  className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs"
                />
                <Button size="sm" variant="gradient" onClick={handleSendNego} className="shrink-0 text-xs">
                  Kirim Tawaran
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "negosiasi" && !activeLead && (
          <EmptyTabNotice
            icon={SlidersHorizontal}
            title="Belum Ada Ruang Negosiasi Aktif"
            desc="Ruang negosiasi penawaran B2B dan kalkulasi shadow price DSS otomatis terbuka saat Anda mengajukan pesanan paket trip baru."
          />
        )}

        {/* TAB 4: DOMPET DOKUMEN & LPJ DIGITAL */}
        {activeTab === "dokumen" && activeLead && (
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Dompet Dokumen Resmi & Arsip LPJ: {activeLead.institution || activeLead.name}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Semua dokumen berizin resmi dapat diunduh kapan saja untuk keperluan audit kantor atau universitas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: "Invoice Pelunasan 100%", sub: `INV-${activeLead.id}-FINAL.pdf`, desc: "Kwitansi lunas bermaterai resmi", icon: FileCheck2 },
                { title: "Faktur Pajak Pertambahan Nilai", sub: `FP-${activeLead.id}.pdf`, desc: "Faktur pajak PPN / PPh instansi", icon: FileText },
                { title: "Berita Acara Perjalanan", sub: `BAP-${activeLead.id}.pdf`, desc: "Presensi 4 kru berlisensi", icon: Users },
                { title: "SPK Tour Leader", sub: `SPK-TL-${activeLead.id}.pdf`, desc: "Budi Santoso, S.Par (HPI)", icon: Award },
                { title: "Surat Jalan Armada Bus", sub: `SJ-BUS-${activeLead.id}.pdf`, desc: "PO Haryanto (Plat AB 7788 CD)", icon: MapPin },
                { title: "Voucher PO Hotel & Restoran", sub: `PO-MITRA-${activeLead.id}.pdf`, desc: "Grand Keisha & RM Bale Raos", icon: QrCode },
              ].map((doc, idx) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-[var(--text-primary)] block">{doc.title}</strong>
                        <span className="text-[10px] text-indigo-600 font-mono block">{doc.sub}</span>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{doc.desc}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-[11px] h-7 gap-1 mt-1"
                      onClick={() => alert(`Mengunduh berkas ${doc.sub}...`)}
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh Dokumen</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "dokumen" && !activeLead && (
          <EmptyTabNotice
            icon={FileText}
            title="Dompet Dokumen & LPJ Masih Kosong"
            desc="Invoice resmi, kwitansi DP/pelunasan, SPK kru lapangan, faktur pajak PPN, dan dokumen LPJ akan otomatis terbit di sini."
          />
        )}

        {/* TAB 5: EVALUASI & RATING KOMPONEN */}
        {activeTab === "rating" && activeLead && (
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Audit Kepuasan Komponen Trip: {activeLead.institution || activeLead.name}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Penilaian Anda akan langsung menjadi bobot penalti atau reward bagi mitra di kalkulasi solver LP berikutnya.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Kenyamanan & Kebersihan Hotel (1-5)", val: ratingHotel, set: setRatingHotel },
                { label: "Kelezatan & Porsi Restoran Prasmanan (1-5)", val: ratingResto, set: setRatingResto },
                { label: "Kelayakan Bus & Keamanan Supir (1-5)", val: ratingBus, set: setRatingBus },
                { label: "Kecakapan Tour Leader & Tim Medis (1-5)", val: ratingTL, set: setRatingTL },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)]">
                  <span className="font-semibold text-[var(--text-primary)] block mb-1.5">{item.label}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => item.set(st)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                          item.val >= st
                            ? "bg-amber-500 text-white shadow-2xs"
                            : "bg-slate-200 dark:bg-slate-800 text-[var(--text-muted)]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Catatan Ulasan & Rekomendasi Rombongan:
              </label>
              <textarea
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Ceritakan kepuasan rombongan atau hal yang perlu ditingkatkan di perjalanan berikutnya..."
                className="w-full p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
              />
            </div>

            {ratingFeedbackMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {ratingFeedbackMsg}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button size="sm" variant="gradient" onClick={handleRatingSubmit} className="text-xs">
                Kirim Evaluasi & Nilai Komponen
              </Button>
            </div>
          </div>
        )}

        {activeTab === "rating" && !activeLead && (
          <EmptyTabNotice
            icon={Star}
            title="Belum Ada Evaluasi Perjalanan"
            desc="Audit kepuasan dan rating komponen trip (hotel, bus, resto, tour leader) akan aktif setelah perjalanan rombongan Anda selesai terlaksana."
          />
        )}
          </>
        )}
      </main>

      <PublicFooter />

      {isGoogleModalOpen && (
        <GoogleSSOModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
        />
      )}

      {/* Modal Rekomendasi Lengkapi Data Diri */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Rekomendasi: Lengkapi Data Diri & Profil Instansi"
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!profilePicName.trim() || !profilePhone.trim() || !profileInstitution.trim()) {
                alert("Mohon lengkapi Nama Penanggung Jawab, Nomor WhatsApp, dan Nama Instansi.");
                return;
              }
              saveCustomerProfile({
                picName: profilePicName.trim(),
                name: profilePicName.trim(),
                phone: profilePhone.trim(),
                institution: profileInstitution.trim(),
                picRole: profilePicRole.trim(),
                institutionCategory: profileCategory,
                city: profileCity.trim(),
                notes: profileNotes.trim(),
              });
              setIsProfileModalOpen(false);
            }}
            className="space-y-3.5 text-xs"
          >
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-[11px] text-[var(--text-secondary)]">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                Selamat Datang di NusaTrip, {customerAuth?.name || "Pelanggan"}!
              </span>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Data resmi di bawah ini diperlukan untuk penerbitan Surat Perintah Kerja (SPK), Faktur Pajak, dan Kartu VIP rombongan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Nama Penanggung Jawab (PIC) *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={profilePicName}
                    onChange={(e) => setProfilePicName(e.target.value)}
                    placeholder="Nama lengkap PIC"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-bold focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Nomor WhatsApp PIC Aktif *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-bold focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Nama Instansi / Lembaga / Sekolah *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={profileInstitution}
                    onChange={(e) => setProfileInstitution(e.target.value)}
                    placeholder="Contoh: PT Telkom Akses"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-bold focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Jabatan / Posisi PIC
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={profilePicRole}
                    onChange={(e) => setProfilePicRole(e.target.value)}
                    placeholder="Contoh: HRD Manager / Panitia"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kategori Instansi / Rombongan
                </label>
                <CustomSelect
                  value={profileCategory}
                  onChange={setProfileCategory}
                  options={INSTANCE_CATEGORIES}
                  buttonClassName="w-full h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kota Domisili Instansi
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan / Bandung"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Catatan / Kebutuhan Khusus Rombongan (Opsional)
              </label>
              <textarea
                rows={2}
                value={profileNotes}
                onChange={(e) => setProfileNotes(e.target.value)}
                placeholder="Preferensi konsumsi halal, bus eksekutif, armada cadangan..."
                className="w-full p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-xs"
              >
                Nanti Saja
              </Button>
              <Button
                type="submit"
                variant="gradient"
                size="sm"
                className="text-xs font-bold gap-1"
              >
                <span>Simpan Data Diri</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
