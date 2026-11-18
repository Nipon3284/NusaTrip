"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Search,
  MapPin,
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
  Calendar,
  Lock,
  Award,
  FileCheck2,
  LogIn,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useCustomerLeads,
  useCustomerAuth,
  updateLeadDetails,
  updateRepaymentStatus,
  submitComponentRating,
  type CustomerLeadItem,
} from "@/lib/data/tour-store";
import { GoogleSSOModal } from "@/components/auth/google-sso-modal";

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

function LacakPesananContent() {
  const searchParams = useSearchParams();
  const leads = useCustomerLeads();
  const [lookupOrderId, setLookupOrderId] = useState("");
  const [searchedLead, setSearchedLead] = useState<CustomerLeadItem | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [activeCommandPhase, setActiveCommandPhase] = useState<
    "masa_tunggu" | "h7_terbuka" | "hari_h_berjalan" | "selesai_h1"
  >("masa_tunggu");

  // Nego state in customer room
  const [customerBidInput, setCustomerBidInput] = useState<number>(0);
  const [bidSubmitted, setBidSubmitted] = useState<boolean>(false);

  // State Rating Komponen (Fase H+1)
  const [ratingHotel, setRatingHotel] = useState<number>(5);
  const [ratingResto, setRatingResto] = useState<number>(5);
  const [ratingBus, setRatingBus] = useState<number>(5);
  const [ratingTL, setRatingTL] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  const formatRupiah = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleLookup = (idToSearch?: string) => {
    const target = (idToSearch || lookupOrderId).trim().toLowerCase();
    if (!target) return;

    const found = leads.find((l) => l.id.toLowerCase() === target);
    if (found) {
      setSearchedLead(found);
      setLookupError("");
      setCustomerBidInput(found.customerBid || found.budget || 0);
      setActiveCommandPhase(getRealActivePhase(found));
    } else {
      setSearchedLead(null);
      setLookupError(`Nomor pesanan "${target}" tidak ditemukan. Pastikan format ID sesuai.`);
    }
  };

  // Auto lookup if ID is in URL query (?id=...) or from first real lead
  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      setLookupOrderId(urlId);
      handleLookup(urlId);
    } else if (leads.length > 0) {
      setLookupOrderId(leads[0].id);
      handleLookup(leads[0].id);
    } else {
      setSearchedLead(null);
      setLookupError("");
    }
  }, [searchParams, leads]);

  const handleSendCustomerCounterBid = () => {
    if (!searchedLead || customerBidInput <= 0) return;
    updateLeadDetails(searchedLead.id, {
      customerBid: customerBidInput,
    });
    setBidSubmitted(true);
    setTimeout(() => setBidSubmitted(false), 3000);
  };

  const handlePayRepayment = () => {
    if (!searchedLead) return;
    updateRepaymentStatus(searchedLead.id, true);
    setSearchedLead((prev) => (prev ? { ...prev, isRepaymentPaid: true } : null));
    alert("Pelunasan 60% berhasil diverifikasi! Seluruh dokumen SPK kru dan kartu VIP aktif.");
  };

  const handleSendComponentRating = () => {
    if (!searchedLead) return;
    submitComponentRating(searchedLead.id, {
      ratingHotel,
      ratingRestoran: ratingResto,
      ratingBus,
      ratingTourLeader: ratingTL,
      ulasan: ratingComment,
    });
    setRatingSuccessMsg("Terima kasih! Penilaian komponen berhasil dikirim ke audit mutu NusaTrip.");
    setTimeout(() => setRatingSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-3 shadow-xs">
        <label className="block text-xs font-bold text-[var(--text-primary)]">
          Cari Berdasarkan Nomor Pesanan / Lead ID:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan Nomor Order (contoh: LEAD-1234)..."
            value={lookupOrderId}
            onChange={(e) => setLookupOrderId(e.target.value)}
            className="flex-1 h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-mono font-bold"
          />
          <Button size="md" variant="gradient" onClick={() => handleLookup()} className="text-xs font-bold shrink-0">
            Cari Pesanan
          </Button>
        </div>

        {/* Quick Lead Selection */}
        {leads.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-[var(--text-muted)] font-semibold mr-1">Pesanan Anda:</span>
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => {
                  setLookupOrderId(lead.id);
                  handleLookup(lead.id);
                }}
                className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] hover:border-indigo-500 hover:text-indigo-600 font-mono transition-colors"
              >
                <strong>{lead.id}</strong> ({lead.institution || lead.name})
              </button>
            ))}
          </div>
        )}
      </div>

      {!searchedLead && !lookupError && (
        <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Command Center Perjalanan & Lacak Event Rombongan
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Masukkan ID pesanan Anda pada kotak pencarian di atas untuk memantau status persiapan H-7, verifikasi 4 kru, dan posisi GPS bus secara real-time.
          </p>
        </div>
      )}

      {lookupError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{lookupError}</span>
        </div>
      )}

      {/* Result Command Center View */}
      {searchedLead && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {searchedLead.id}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {searchedLead.destination} &bull; {searchedLead.pax} Pax ({searchedLead.days} Hari)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {searchedLead.institution || searchedLead.name}
              </h2>
            </div>

            <div className="text-right self-start sm:self-auto">
              <span className="text-[10px] text-[var(--text-muted)] block">Tahapan Pesanan:</span>
              <span className="font-bold text-xs uppercase px-3 py-1 rounded-full bg-indigo-600 text-white inline-block mt-0.5">
                {searchedLead.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Real-time Timeline Stepper */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-secondary)]">
                Progres Tahapan Waktu Perjalanan Riil:
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Fase Berjalan: {getRealActivePhase(searchedLead).replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: "masa_tunggu", label: "1. H-30 s/d H-8", desc: "Masa Tunggu & Blind" },
                { id: "h7_terbuka", label: "2. Fase H-7", desc: "Buka Vendor & SPK Kru" },
                { id: "hari_h_berjalan", label: "3. Eksekusi Hari-H", desc: "VIP Clear & Live GPS" },
                { id: "selesai_h1", label: "4. Fase H+1", desc: "LPJ & Rating Komponen" },
              ].map((ph) => {
                const isRealActive = getRealActivePhase(searchedLead) === ph.id;
                const isViewing = activeCommandPhase === ph.id;
                return (
                  <button
                    key={ph.id}
                    type="button"
                    onClick={() => setActiveCommandPhase(ph.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isViewing
                        ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 shadow-2xs font-bold"
                        : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-white/50"
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

          {/* VIEW 1: FASE MASA TUNGGU */}
          {activeCommandPhase === "masa_tunggu" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Status Keuangan & Uang Muka (DP 40%)</span>
                  </span>
                  <Badge variant="emerald" size="sm">
                    {searchedLead.status === "baru" || searchedLead.status === "negosiasi"
                      ? "Tahap Negosiasi"
                      : "DP 40% Terkunci di Escrow"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-[var(--text-muted)] block">Total Kontrak Event</span>
                    <strong className="text-indigo-700 dark:text-indigo-300 text-sm">
                      {formatRupiah(searchedLead.budget || 0)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-[var(--text-muted)] block">DP 40% (Escrow Terjamin)</span>
                    <strong className="text-emerald-600 text-sm">
                      {formatRupiah(searchedLead.dpAmount || Math.round((searchedLead.budget || 0) * 0.4))}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900">
                    <span className="text-[10px] text-[var(--text-muted)] block">Pelunasan 60% (Jatuh Tempo H-7)</span>
                    <strong className="text-amber-600 text-sm">
                      {formatRupiah(
                        searchedLead.repaymentAmount || Math.round((searchedLead.budget || 0) * 0.6)
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {searchedLead.status === "negosiasi" && (
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                    <Receipt className="w-4 h-4" />
                    <span>Ruang Negosiasi Pelanggan NusaTrip</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Penawaran awal Anda: <strong>{formatRupiah(searchedLead.budget || 0)}</strong>.
                  </p>
                  {searchedLead.counterOffer && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800">
                      <span className="font-bold text-[11px] text-amber-700 block mb-0.5">
                        Tawaran Penyesuaian dari NusaTrip:
                      </span>
                      <p className="text-xs italic text-[var(--text-primary)]">{searchedLead.counterOffer}</p>
                    </div>
                  )}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center">
                    <div className="relative flex-1 w-full">
                      <span className="text-xs absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-semibold">
                        Rp
                      </span>
                      <input
                        type="number"
                        step={500000}
                        value={customerBidInput}
                        onChange={(e) => setCustomerBidInput(Number(e.target.value))}
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                    <Button size="md" variant="gradient" onClick={handleSendCustomerCounterBid} className="text-xs shrink-0">
                      Ajukan Tawaran Balik
                    </Button>
                  </div>
                  {bidSubmitted && (
                    <span className="text-[11px] font-semibold text-emerald-600 block">
                      Tawaran Anda berhasil dikirim ke Admin untuk dievaluasi terhadap pagu modal LP!
                    </span>
                  )}
                </div>
              )}

              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                  <Lock className="w-4 h-4" />
                  <span>Itinerary Sementara & Standar Blind Vendor Terjamin</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-[var(--text-secondary)] space-y-2">
                  <p><strong>Akomodasi:</strong> Hotel Setaraf {searchedLead.hotel || "Bintang 3"} Zona {searchedLead.destination} (Identitas resmi dibuka H-7)</p>
                  <p><strong>Konsumsi:</strong> Restoran Prasmanan Khas Tradisional (Identitas resmi dibuka H-7)</p>
                  <p><strong>Armada:</strong> Bus Pariwisata Eksekutif {searchedLead.pax} Seat + AC Dingin + Driver Berlisensi</p>
                  <p><strong>Titik Kunjungan Rencana:</strong> {searchedLead.selectedSpots?.join(", ") || "Wisata Candi, Alam & Heritage"}</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: FASE H-7 TERBUKA */}
          {activeCommandPhase === "h7_terbuka" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Identitas Vendor Resmi (Terbuka Penuh H-7)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 font-mono px-2 py-0.5 rounded font-bold">
                    H-7 UNMASKED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <strong className="block text-indigo-700 dark:text-indigo-300">Hotel Terverifikasi:</strong>
                    <span>Grand Keisha Yogyakarta</span>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Jl. Affandi No.9, Gejayan ({Math.ceil(searchedLead.pax / 2)} Kamar Twin Bed)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <strong className="block text-indigo-700 dark:text-indigo-300">Restoran Rekanan:</strong>
                    <span>RM Bale Raos Keraton</span>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Prasmanan Tradisional Raja ({searchedLead.pax} Porsi Siap Saji)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <strong className="block text-indigo-700 dark:text-indigo-300">Armada Bus Pariwisata:</strong>
                    <span>PO Haryanto (Bus Eksekutif Jetbus 5)</span>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Plat: AB 7788 CD &bull; AC, USB Port, Reclining Seat</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <strong className="block text-indigo-700 dark:text-indigo-300">Pusat Oleh-Oleh:</strong>
                    <span>Bakpia Pathok 25 Yogyakarta</span>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Voucher Diskon Rombongan 15% Siaga</p>
                  </div>
                </div>
              </div>

              {/* 4 Kru Lapangan */}
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Profil 4 Kru Lapangan yang Bertugas:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    { role: "Tour Leader", name: "Budi Santoso, S.Par", cert: "Lisensi HPI-DIY-2021" },
                    { role: "Tim Dokumentasi", name: "Reza Mahendra", cert: "Pilot Drone 4K FPV" },
                    { role: "Tim Medis", name: "Ns. Maya Indah, S.Kep", cert: "P3K K3 Kemenkes" },
                    { role: "Tim Pengawas Mutu", name: "Aris Munandar", cert: "Koordinator Lapangan" },
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

              {/* Pelunasan 60% */}
              <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">Tagihan Pelunasan 60%:</span>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Nominal: <strong>{formatRupiah(searchedLead.repaymentAmount || Math.round((searchedLead.budget || 0) * 0.6))}</strong> &bull; Status:{" "}
                    <span className={searchedLead.isRepaymentPaid ? "font-bold text-emerald-600" : "font-bold text-amber-600"}>
                      {searchedLead.isRepaymentPaid ? "LUNAS 100%" : "MENUNGGU PEMBAYARAN"}
                    </span>
                  </p>
                </div>
                {!searchedLead.isRepaymentPaid ? (
                  <Button size="sm" variant="gradient" onClick={handlePayRepayment}>
                    Bayar Pelunasan 60% (Escrow)
                  </Button>
                ) : (
                  <Badge variant="emerald" size="md">Lunas 100% Terverifikasi</Badge>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: FASE HARI-H */}
          {activeCommandPhase === "hari_h_berjalan" && (
            <div className="space-y-4">
              {/* VIP Group Clearance Card */}
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
                      {searchedLead.vipClearanceCode || "VIP-CLR-4491-ID"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-amber-200/80 block">Nama Instansi / Rombongan:</span>
                      <strong className="text-base font-extrabold text-white">
                        {searchedLead.institution || searchedLead.name}
                      </strong>
                      <p className="text-[11px] text-amber-200 mt-0.5">
                        Kapasitas: <strong>{searchedLead.pax} Peserta Terdaftar</strong>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-200/80 block">Protokol Akses Masuk Destinasi:</span>
                      <span className="font-bold text-emerald-400 block">
                        Bebas Antre Scan Barcode Perorangan
                      </span>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        Tour Leader ber-SPK menyelesaikan verifikasi kolektif di gerbang khusus mitra.
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

              {/* Live Tracking GPS Bus */}
              <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${searchedLead.webBeacon ? "text-emerald-600 animate-pulse" : "text-slate-400"}`} />
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">
                      Live Tracking GPS Bus (Web-Beacon Real-Time)
                    </span>
                  </div>
                  {searchedLead.webBeacon ? (
                    <Badge variant="emerald" size="sm">GPS AKTIF</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">STANDBY</Badge>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Sumber Koordinat:</span>
                    <strong className="text-[var(--text-primary)]">
                      {searchedLead.webBeacon?.driverPhone ||
                        (searchedLead.assignedCrew?.tourLeader
                          ? `Ponsel TL: ${searchedLead.assignedCrew.tourLeader.name} (${searchedLead.assignedCrew.tourLeader.phone})`
                          : "Ponsel Tour Leader Ber-SPK")}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Kecepatan Armada:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {searchedLead.webBeacon?.speedKmh ? `${searchedLead.webBeacon.speedKmh} km/jam` : "0 km/jam (Siaga)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">Titik Koordinat:</span>
                    <span className="font-mono text-xs text-indigo-600">
                      {searchedLead.webBeacon?.busLat
                        ? `${searchedLead.webBeacon.busLat}, ${searchedLead.webBeacon.busLng}`
                        : "Menunggu transmisi GPS aktif"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)]">
                    <strong>Posisi Terkini:</strong>{" "}
                    {searchedLead.webBeacon?.statusRundown ||
                      "Armada dan kru berada dalam persiapan siaga keberangkatan."}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    size="md"
                    variant="gradient"
                    className="flex-1 gap-2 text-xs"
                    onClick={() => {
                      const shareUrl = `https://nusatrip.id/lacak-pesanan?id=${searchedLead.id}`;
                      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `Pantau posisi rombongan ${searchedLead.institution || searchedLead.name} di NusaTrip Live GPS: ${shareUrl}`
                      )}`;
                      window.open(waUrl, "_blank");
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan Link Pelacakan ke WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: FASE H+1 PASCA ACARA */}
          {activeCommandPhase === "selesai_h1" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>Laporan Pertanggungjawaban (LPJ) & Pajak Resmi</span>
                  </span>
                  <Badge variant="emerald" size="sm">TERVERIFIKASI AUDIT</Badge>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Seluruh dokumen administratif resmi siap diunduh untuk keperluan pertanggungjawaban instansi / perusahaan Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh Invoice Lunas INV-${searchedLead.id}-FINAL.pdf...`)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 text-left hover:border-emerald-500 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <strong className="block text-[var(--text-primary)]">Invoice Lunas</strong>
                      <span className="text-[10px] text-[var(--text-muted)]">Format PDF Resmi</span>
                    </div>
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh Faktur Pajak FP-${searchedLead.id}.pdf...`)}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 text-left hover:border-emerald-500 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <strong className="block text-[var(--text-primary)]">Faktur Pajak</strong>
                      <span className="text-[10px] text-[var(--text-muted)]">Kuitansi Bermaterai</span>
                    </div>
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh Berita Acara Perjalanan BAP-${searchedLead.id}.pdf...`)}
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

              {/* Form Rating */}
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">
                    Audit Kepuasan Komponen (Evaluasi Pasca-Acara)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {[
                    { label: "Kenyamanan Hotel (1-5)", val: ratingHotel, set: setRatingHotel },
                    { label: "Katering Prasmanan (1-5)", val: ratingResto, set: setRatingResto },
                    { label: "Armada Bus & Supir (1-5)", val: ratingBus, set: setRatingBus },
                    { label: "Tour Leader & Medis (1-5)", val: ratingTL, set: setRatingTL },
                  ].map((it, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)]">
                      <span className="font-semibold text-[var(--text-primary)] block mb-1.5">{it.label}</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => it.set(s)}
                            className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                              it.val >= s ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-[var(--text-muted)]"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Komentar & Catatan Masukan:
                  </label>
                  <textarea
                    rows={2}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Ceritakan kepuasan rombongan atau hal yang perlu ditingkatkan..."
                    className="w-full p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                  />
                </div>

                {ratingSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                    {ratingSuccessMsg}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <Button size="sm" variant="gradient" onClick={handleSendComponentRating}>
                    Kirim Evaluasi & Masukan Komponen
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LacakPesananPage() {
  const customerAuth = useCustomerAuth();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {!customerAuth ? (
          <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 flex items-center justify-center shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block">
                Akses Terproteksi Khusus Pelanggan
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Masuk untuk Melacak Pesanan & Travel Command Center
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto">
                Untuk melindungi privasi rombongan, koordinat GPS armada bus, manifes kru SPK, dan kartu bebas antre VIP Clearance, pelacakan pesanan hanya dapat diakses oleh akun pelanggan terdaftar.
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
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block">
                Pusat Kendali Perjalanan Pelanggan
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
                Travel Command Center & Pelacak Pesanan
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Pantau status pesanan rombongan, identitas vendor H-7, kartu VIP Clearance bebas antre, dan posisi GPS bus real-time.
              </p>
            </div>

            <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-muted)]">Memuat data pesanan...</div>}>
              <LacakPesananContent />
            </Suspense>
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
    </div>
  );
}
