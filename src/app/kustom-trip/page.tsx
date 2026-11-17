"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  ShieldCheck,
  Building2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  Bus,
  Hotel,
  Users,
  Check,
  LogIn,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useCustomerAuth,
  addCustomerLead,
  type NegotiationMessageItem,
} from "@/lib/data/tour-store";
import { GoogleSSOModal } from "@/components/auth/google-sso-modal";

const DEST_OPTIONS = [
  { value: "Yogyakarta", label: "Yogyakarta" },
  { value: "Bali", label: "Bali" },
  { value: "Bromo - Malang", label: "Bromo - Malang" },
  { value: "Bandung", label: "Bandung" },
  { value: "Lombok", label: "Lombok" },
  { value: "Banyuwangi", label: "Banyuwangi" },
];

const CATEGORY_OPTIONS = [
  { value: "Company Gathering & Outing", label: "Company Gathering & Outing" },
  { value: "Study Tour & Kunjungan Edukasi", label: "Study Tour & Kunjungan Edukasi" },
  { value: "Family Gathering", label: "Family Gathering" },
  { value: "Outbound & Team Building", label: "Outbound & Team Building" },
  { value: "Private Trip Keluarga", label: "Private Trip Keluarga" },
];

const CITY_SPOTS: Record<string, string[]> = {
  Yogyakarta: [
    "Candi Borobudur & Dagi",
    "Candi Prambanan & Ratu Boko",
    "Malioboro Heritage & Keraton",
    "Jeep Lava Tour Merapi",
    "Tebing Breksi & HeHa Sky View",
    "Taman Sari Water Castle",
    "Hutan Pinus Mangunan",
    "Pantai Timang & Indrayanti",
  ],
  Bali: [
    "Tanjung Benoa Watersport",
    "Pantai Melasti & Sunset Kecak",
    "Garuda Wisnu Kencana (GWK)",
    "Tanah Lot Temple",
    "Kintamani Kaldera Batur",
    "Desa Penglipuran",
    "Ubud Sacred Monkey Forest",
    "Pantai Pandawa",
  ],
  "Bromo - Malang": [
    "Sunrise Point Penanjakan",
    "Kawah Bromo & Pasir Berbisik",
    "Bukit Teletubbies & Savana",
    "Museum Angkut Batu",
    "Jatim Park 3 Dino Park",
    "Petik Apel Agro Kusuma",
    "Air Terjun Coban Rondo",
    "Selecta Flower Garden",
  ],
  Bandung: [
    "Kawah Putih Ciwidey",
    "Floating Market Lembang",
    "Glamping Lakeside Rancabali",
    "Tangkuban Perahu Crater",
    "Orchid Forest Cikole",
    "Jalan Braga Heritage",
    "The Great Asia Africa",
    "Ranca Upas Deer Sanctuary",
  ],
  Lombok: [
    "Snorkeling 3 Gili Trawangan",
    "Sirkuit Internasional Mandalika",
    "Bukit Merese Sunset",
    "Pantai Tanjung Aan",
    "Desa Adat Sade",
    "Air Terjun Sendang Gile",
    "Pantai Pink Lombok",
    "Gili Nanggu Snorkeling",
  ],
  Banyuwangi: [
    "Blue Fire Kawah Ijen",
    "Taman Nasional Baluran",
    "Hutan De Djawatan Benculuk",
    "Pantai Pulau Merah",
    "Bangsring Underwater",
    "Desa Wisata Osing",
    "Teluk Hijau Green Bay",
    "Pantai Sukamade Turtle",
  ],
};

export default function KustomTripPage() {
  const customerAuth = useCustomerAuth();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // 4 Steps Wizard
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardName, setWizardName] = useState("");
  const [wizardInstitution, setWizardInstitution] = useState("");
  const [wizardPhone, setWizardPhone] = useState("");
  const [wizardDestination, setWizardDestination] = useState("Yogyakarta");
  const [wizardCategory, setWizardCategory] = useState("Company Gathering & Outing");
  const [wizardDays, setWizardDays] = useState<number>(3);
  const [wizardPax, setWizardPax] = useState<number>(50);
  const [wizardBudget, setWizardBudget] = useState<number>(45000000);
  const [wizardSelectedSpots, setWizardSelectedSpots] = useState<string[]>([
    "Candi Prambanan & Ratu Boko",
    "Jeep Lava Tour Merapi",
    "Malioboro Heritage & Keraton",
  ]);
  const [wizardHotelStar, setWizardHotelStar] = useState<"Bintang 2" | "Bintang 3" | "Bintang 4">("Bintang 3");
  const [wizardNotes, setWizardNotes] = useState("");
  const [createdSuccessId, setCreatedSuccessId] = useState<string | null>(null);

  // Negotiation state in Step 4
  const [negoInputBid, setNegoInputBid] = useState<number>(45000000);
  const [negoInputMessage, setNegoInputMessage] = useState("");
  const [isDealLocked, setIsDealLocked] = useState(false);
  const [negoMessages, setNegoMessages] = useState<NegotiationMessageItem[]>([]);

  const formatRupiah = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const maxSpotsAllowed = wizardDays === 1 ? 3 : wizardDays === 2 ? 5 : wizardDays === 3 ? 7 : 9;

  const minCostPerPaxDay = {
    "Bintang 2": 220000,
    "Bintang 3": 380000,
    "Bintang 4": 650000,
  };

  const isBintang2Viable = wizardBudget >= wizardPax * wizardDays * minCostPerPaxDay["Bintang 2"];
  const isBintang3Viable = wizardBudget >= wizardPax * wizardDays * minCostPerPaxDay["Bintang 3"];
  const isBintang4Viable = wizardBudget >= wizardPax * wizardDays * minCostPerPaxDay["Bintang 4"];

  const handleToggleSpot = (spot: string) => {
    if (wizardSelectedSpots.includes(spot)) {
      setWizardSelectedSpots(wizardSelectedSpots.filter((s) => s !== spot));
    } else {
      if (wizardSelectedSpots.length >= maxSpotsAllowed) {
        alert(`Batas maksimal untuk durasi ${wizardDays} hari adalah ${maxSpotsAllowed} lokawisata agar perjalanan tidak terburu-buru.`);
        return;
      }
      setWizardSelectedSpots([...wizardSelectedSpots, spot]);
    }
  };

  // Dynamic DSS Bottom Line calculation
  const calculatedBottomLineCost = Math.round(
    wizardPax * wizardDays * (wizardHotelStar === "Bintang 4" ? 520000 : wizardHotelStar === "Bintang 3" ? 280000 : 160000) +
      Math.ceil(wizardPax / 50) * 4500000 * wizardDays +
      wizardPax * wizardDays * 75000 +
      wizardPax * 50000
  );

  const isBudgetFeasible = (negoInputBid || wizardBudget) >= calculatedBottomLineCost;
  const recommendedBid = Math.round(calculatedBottomLineCost * 1.18);

  const handleStep3Next = () => {
    if (wizardSelectedSpots.length === 0) {
      alert("Silakan pilih minimal 1 titik jangkar wisata.");
      return;
    }
    if (!customerAuth) {
      setIsGoogleModalOpen(true);
      return;
    }
    setNegoInputBid(wizardBudget);
    if (negoMessages.length === 0) {
      setNegoMessages([
        {
          id: `msg-${Date.now()}-1`,
          sender: "pelanggan",
          message: `Halo NusaTrip, kami mengajukan rencana ${wizardCategory} untuk ${wizardPax} Pax (${wizardDays} Hari) di ${wizardDestination} dengan estimasi anggaran Rp ${wizardBudget.toLocaleString(
            "id-ID"
          )}.`,
          proposedBid: wizardBudget,
          timestamp: "Baru saja",
        },
        {
          id: `msg-${Date.now()}-2`,
          sender: "sistem_dss",
          message: isBudgetFeasible
            ? `Kalkulasi Evaluasi DSS: Anggaran Anda Rp ${wizardBudget.toLocaleString(
                "id-ID"
              )} memenuhi pagu kelayakan modal dasar (Z-Min: Rp ${calculatedBottomLineCost.toLocaleString(
                "id-ID"
              )}). Tim Admin siap mengunci harga deal.`
            : `Peringatan Evaluasi DSS: Anggaran pengajuan Anda (Rp ${wizardBudget.toLocaleString(
                "id-ID"
              )}) berada di bawah modal penyediaan dasar (Z-Min: Rp ${calculatedBottomLineCost.toLocaleString(
                "id-ID"
              )}). Rekomendasi penawaran aman adalah Rp ${recommendedBid.toLocaleString(
                "id-ID"
              )} atau beralih ke akomodasi Bintang 2.`,
          timestamp: "Baru saja",
        },
      ]);
    }
    setWizardStep(4);
  };

  const handleSendNegoMessage = () => {
    if (!negoInputMessage.trim()) return;
    const newMsg: NegotiationMessageItem = {
      id: `msg-${Date.now()}`,
      sender: "pelanggan",
      message: negoInputMessage.trim(),
      proposedBid: negoInputBid,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };
    setNegoMessages((prev) => [...prev, newMsg]);
    setNegoInputMessage("");

    setTimeout(() => {
      const isAboveFloor = negoInputBid >= calculatedBottomLineCost;
      const adminReply = isAboveFloor
        ? `Admin NusaTrip: Tawaran Rp ${negoInputBid.toLocaleString(
            "id-ID"
          )} disetujui! Kami kunci fasilitas ${wizardHotelStar}, bus eksekutif, dan seluruh titik kunjungan. Silakan klik tombol 'Setujui Harga Deal & Kunci Tagihan DP 40%' untuk menerbitkan tagihan resmi.`
        : `Admin NusaTrip: Tawaran Rp ${negoInputBid.toLocaleString(
            "id-ID"
          )} belum dapat kami setujui karena berada di bawah batas modal dasar vendor DSS (Rp ${calculatedBottomLineCost.toLocaleString(
            "id-ID"
          )}). Kami tawarkan deal kompromi di Rp ${recommendedBid.toLocaleString("id-ID")}.`;
      setNegoMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-adm`,
          sender: "admin",
          message: adminReply,
          proposedBid: isAboveFloor ? negoInputBid : recommendedBid,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        },
      ]);
    }, 600);
  };

  const handleLockDealAndIssueDP = async () => {
    if (!customerAuth) {
      setIsGoogleModalOpen(true);
      return;
    }
    const finalDeal = negoInputBid || wizardBudget;
    const dp40 = Math.round(finalDeal * 0.4);

    const newLeadId = await addCustomerLead({
      name: wizardName || customerAuth.name,
      institution: wizardInstitution || customerAuth.institution || "B2B Rombongan",
      phone: wizardPhone || customerAuth.phone || "081234567890",
      destination: wizardDestination,
      category: wizardCategory,
      pax: wizardPax,
      days: wizardDays,
      hotel: wizardHotelStar,
      budget: finalDeal,
      customerBid: finalDeal,
      bottomLineCost: calculatedBottomLineCost,
      targetMargin: Math.round(finalDeal - calculatedBottomLineCost),
      dpAmount: dp40,
      repaymentAmount: finalDeal - dp40,
      isDealApproved: true,
      orderTrack: "kustom_b2b",
      commandCenterPhase: "masa_tunggu",
      status: "menunggu_dp",
      selectedSpots: wizardSelectedSpots,
      notes: wizardNotes,
      departureDate: "2026-11-28",
      negotiationMessages: negoMessages,
    });

    setIsDealLocked(true);
    setCreatedSuccessId(newLeadId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block">
            Form Kustomisasi Mandiri B2B
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            Rancang Paket Perjalanan Sesuai Kebutuhan Anda
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Dapatkan rekomendasi alokasi hotel dan armada bus tanpa kursi kosong secara instan dengan mesin Decision Support System (DSS) NusaTrip.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { num: 1, label: "1. Profil & Budget" },
              { num: 2, label: "2. Lokawisata" },
              { num: 3, label: "3. Fasilitas" },
              { num: 4, label: "4. Evaluasi & Nego" },
            ].map((st) => (
              <div
                key={st.num}
                className={`p-2.5 rounded-xl border transition-all ${
                  wizardStep === st.num
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs"
                    : wizardStep > st.num
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-medium"
                    : "border-transparent text-[var(--text-muted)]"
                }`}
              >
                <span className="block text-[11px] sm:text-xs">{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xs">
          {createdSuccessId ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                Pengajuan Berhasil Diterbitkan! ID: {createdSuccessId}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                Harga deal telah dikunci bersama sistem DSS. Tagihan DP 40% ({formatRupiah(Math.round((negoInputBid || wizardBudget) * 0.4))}) telah diterbitkan ke rekening escrow resmi NusaTrip.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Link href="/pelanggan">
                  <Button size="md" variant="gradient" className="text-xs font-bold">
                    Buka Dasbor Pelanggan
                  </Button>
                </Link>
                <Link href={`/lacak-pesanan?id=${createdSuccessId}`}>
                  <Button size="md" variant="outline" className="text-xs">
                    Pantau di Command Center
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TAHAP 1 */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Langkah 1: Identitas Rombongan & Estimasi Anggaran</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Nama Pemesan (Penanggung Jawab) *
                      </label>
                      <input
                        type="text"
                        required
                        value={wizardName}
                        onChange={(e) => setWizardName(e.target.value)}
                        placeholder="Contoh: Cindy Permatasari"
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Nama Instansi / Komunitas (Opsional)
                      </label>
                      <input
                        type="text"
                        value={wizardInstitution}
                        onChange={(e) => setWizardInstitution(e.target.value)}
                        placeholder="Contoh: PT Telkom Akses / SMAN 1"
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Nomor WhatsApp Aktif *
                      </label>
                      <input
                        type="text"
                        required
                        value={wizardPhone}
                        onChange={(e) => setWizardPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Kategori Perjalanan *
                      </label>
                      <CustomSelect
                        value={wizardCategory}
                        onChange={setWizardCategory}
                        options={CATEGORY_OPTIONS}
                        buttonClassName="w-full h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Kota Destinasi *
                      </label>
                      <CustomSelect
                        value={wizardDestination}
                        onChange={(val) => {
                          setWizardDestination(val);
                          setWizardSelectedSpots((CITY_SPOTS[val] || []).slice(0, 3));
                        }}
                        options={DEST_OPTIONS}
                        buttonClassName="w-full h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Durasi Wisata (Hari) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={wizardDays}
                        onChange={(e) => setWizardDays(Math.max(1, Number(e.target.value)))}
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Perkiraan Peserta (Pax) *
                      </label>
                      <input
                        type="number"
                        min={5}
                        value={wizardPax}
                        onChange={(e) => setWizardPax(Math.max(5, Number(e.target.value)))}
                        className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Estimasi Pagu Anggaran Rombongan (Rp) *
                      </label>
                      <span className="text-xs font-extrabold text-indigo-600">
                        {formatRupiah(wizardBudget)}
                      </span>
                    </div>
                    <input
                      type="number"
                      step={500000}
                      min={5000000}
                      value={wizardBudget}
                      onChange={(e) => setWizardBudget(Number(e.target.value))}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-bold"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      size="md"
                      variant="gradient"
                      onClick={() => setWizardStep(2)}
                      className="gap-2 text-xs font-bold"
                    >
                      <span>Lanjut: Pilih Lokawisata</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* TAHAP 2 */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span>Langkah 2: Pilih Lokawisata di {wizardDestination}</span>
                    </h3>
                    <span className="text-xs text-[var(--text-muted)]">
                      Terpilih: <strong>{wizardSelectedSpots.length}</strong> / Max {maxSpotsAllowed}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(CITY_SPOTS[wizardDestination] || []).map((spot) => {
                      const isChecked = wizardSelectedSpots.includes(spot);
                      return (
                        <button
                          key={spot}
                          type="button"
                          onClick={() => handleToggleSpot(spot)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isChecked
                              ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-2xs"
                              : "border-[var(--border-subtle)] bg-[var(--surface-page)] text-[var(--text-primary)] hover:border-indigo-300"
                          }`}
                        >
                          <span className="text-xs font-medium">{spot}</span>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isChecked
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-[var(--border-default)] bg-[var(--surface-card)]"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" size="md" onClick={() => setWizardStep(1)} className="gap-2 text-xs">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </Button>
                    <Button variant="gradient" size="md" onClick={() => setWizardStep(3)} className="gap-2 text-xs font-bold">
                      <span>Lanjut: Fasilitas & Hotel</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* TAHAP 3 */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-indigo-600" />
                    <span>Langkah 3: Standar Kelas Fasilitas & Hotel</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { star: "Bintang 2" as const, viable: isBintang2Viable, title: "Ekonomis Bersih", radius: "≤ 25 Menit" },
                      { star: "Bintang 3" as const, viable: isBintang3Viable, title: "Standar Utama Rombongan", radius: "≤ 20 Menit" },
                      { star: "Bintang 4" as const, viable: isBintang4Viable, title: "Premium & Fasilitas Lengkap", radius: "≤ 15 Menit" },
                    ].map((item) => (
                      <div
                        key={item.star}
                        onClick={() => {
                          if (item.viable) setWizardHotelStar(item.star);
                        }}
                        className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                          !item.viable
                            ? "opacity-40 bg-slate-100 dark:bg-slate-800/40 cursor-not-allowed border-dashed"
                            : wizardHotelStar === item.star
                            ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 cursor-pointer shadow-xs"
                            : "border-[var(--border-subtle)] bg-[var(--surface-page)] hover:border-indigo-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-[var(--text-primary)]">{item.star}</strong>
                          {wizardHotelStar === item.star && item.viable && (
                            <Badge variant="brand" size="sm">Pilihan</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)]">{item.title}</p>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Radius: {item.radius}</span>
                        {!item.viable && (
                          <span className="text-[10px] text-rose-600 font-bold block pt-1 border-t border-rose-200">
                            Melebihi Estimasi Anggaran
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Catatan Tambahan & Preferensi Fasilitas (Opsional):
                    </label>
                    <textarea
                      rows={2}
                      value={wizardNotes}
                      onChange={(e) => setWizardNotes(e.target.value)}
                      placeholder="Contoh: Mohon sediakan tour guide berbahasa Inggris, briefing medis tambahan, request armada Jetbus 5..."
                      className="w-full p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" size="md" onClick={() => setWizardStep(2)} className="gap-2 text-xs">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </Button>
                    <Button variant="gradient" size="md" onClick={handleStep3Next} className="gap-2 text-xs font-bold">
                      <span>Lanjut: Cek Evaluasi DSS & Nego</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* TAHAP 4 */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-indigo-600" />
                      <span>Langkah 4: Evaluasi Pagu DSS & Ruang Negosiasi Deal</span>
                    </h3>
                    <Badge variant={isBudgetFeasible ? "emerald" : "warning"} size="sm">
                      {isBudgetFeasible ? "PAGU AMAN" : "PERLU PENYESUAIAN"}
                    </Badge>
                  </div>

                  {/* DSS Verdict Banner */}
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      isBudgetFeasible
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-100"
                        : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-100"
                    }`}
                  >
                    <strong className="block font-bold">
                      {isBudgetFeasible
                        ? "Evaluasi DSS: Anggaran Pengajuan Memenuhi Pagu Modal Vendor Terdekat"
                        : "Peringatan DSS: Anggaran di Bawah Pagu Modal Dasar Penyediaan"}
                    </strong>
                    <p className="text-[11px] leading-relaxed">
                      Modal dasar estimasi (Z-Min): <strong>{formatRupiah(calculatedBottomLineCost)}</strong>.
                      {isBudgetFeasible
                        ? " Seluruh armada bus eksekutif, katering, dan tiket digital dapat dipenuhi secara optimal."
                        : ` Rekomendasi deal aman adalah ${formatRupiah(recommendedBid)} atau beralih ke Hotel Bintang 2.`}
                    </p>
                  </div>

                  {/* Negotiation Messages */}
                  <div className="p-3.5 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] space-y-2 max-h-60 overflow-y-auto">
                    {negoMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl text-xs max-w-md ${
                          msg.sender === "pelanggan"
                            ? "ml-auto bg-indigo-600 text-white"
                            : msg.sender === "admin"
                            ? "mr-auto bg-slate-200 dark:bg-slate-800 text-[var(--text-primary)]"
                            : "mx-auto bg-amber-100 dark:bg-amber-950 border border-amber-300 text-amber-900 dark:text-amber-200 text-center"
                        }`}
                      >
                        <p>{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <div className="relative w-full sm:w-52">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                        Rp
                      </span>
                      <input
                        type="number"
                        step={500000}
                        value={negoInputBid}
                        onChange={(e) => setNegoInputBid(Number(e.target.value))}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-bold"
                      />
                    </div>
                    <input
                      type="text"
                      value={negoInputMessage}
                      onChange={(e) => setNegoInputMessage(e.target.value)}
                      placeholder="Ajukan catatan tawaran harga balik..."
                      className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={handleSendNegoMessage} className="text-xs shrink-0">
                      Tawar Balik
                    </Button>
                  </div>

                  {/* Final Deal Confirmation Button */}
                  <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Button variant="outline" size="md" onClick={() => setWizardStep(3)} className="gap-2 text-xs">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali ke Fasilitas</span>
                    </Button>

                    <Button
                      size="md"
                      variant="gradient"
                      onClick={handleLockDealAndIssueDP}
                      className="gap-2 text-xs font-bold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Setujui Deal & Kunci Tagihan DP 40% ({formatRupiah(Math.round((negoInputBid || wizardBudget) * 0.4))})
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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
