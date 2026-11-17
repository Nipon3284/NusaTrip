"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Filter,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  useTourPackages,
  addCustomerLead,
  useCustomerAuth,
  type TourPackageItem,
} from "@/lib/data/tour-store";
import { GoogleSSOModal } from "@/components/auth/google-sso-modal";

const DEST_FILTERS = [
  "Semua",
  "Yogyakarta",
  "Bali",
  "Bromo - Malang",
  "Bandung",
  "Lombok",
  "Banyuwangi",
];

const DURATION_FILTERS = ["Semua", "1 Hari", "2D1N", "3D2N", "4D3N"];

export default function PaketWisataPage() {
  const customerAuth = useCustomerAuth();
  const allPackages = useTourPackages();
  const [selectedDest, setSelectedDest] = useState("Semua");
  const [selectedDuration, setSelectedDuration] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Checkout Modal State
  const [selectedPkg, setSelectedPkg] = useState<TourPackageItem | null>(null);
  const [catalogPax, setCatalogPax] = useState<number>(30);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccessId, setCheckoutSuccessId] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const formatRupiah = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredPackages = allPackages.filter((pkg) => {
    if (!pkg.isActive) return false;
    if (selectedDest !== "Semua" && pkg.destination !== selectedDest) return false;
    if (
      selectedDuration !== "Semua" &&
      !pkg.duration.toLowerCase().includes(selectedDuration.toLowerCase())
    )
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = pkg.title.toLowerCase().includes(q);
      const matchDest = pkg.destination.toLowerCase().includes(q);
      const matchSpot = pkg.spots.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDest && !matchSpot) return false;
    }
    return true;
  });

  const handleCheckout = () => {
    if (!selectedPkg) return;
    if (!customerAuth) {
      setIsGoogleModalOpen(true);
      return;
    }
    setIsCheckingOut(true);

    setTimeout(() => {
      const totalContract = selectedPkg.price * catalogPax;
      const dp40 = Math.round(totalContract * 0.4);
      const newOrderId = `ORD-CAT-${Date.now().toString().slice(-4)}`;

      addCustomerLead({
        name: customerAuth.name,
        institution: customerAuth.institution || "Ritel Pelanggan",
        phone: customerAuth.phone || "08123456789",
        destination: selectedPkg.destination,
        category: "Katalog Siap Berangkat",
        pax: catalogPax,
        days: selectedPkg.duration.includes("1 Hari")
          ? 1
          : selectedPkg.duration.includes("2D1N")
          ? 2
          : selectedPkg.duration.includes("3D2N")
          ? 3
          : 4,
        hotel: selectedPkg.facilityStandard || "Bintang 3 (Blind Vendor)",
        budget: totalContract,
        customerBid: totalContract,
        bottomLineCost: Math.round(totalContract * 0.72),
        dpAmount: dp40,
        repaymentAmount: totalContract - dp40,
        isDealApproved: true,
        orderTrack: "katalog_ritel",
        commandCenterPhase: "masa_tunggu",
        status: "menunggu_dp",
        selectedSpots: selectedPkg.spots,
      });

      setIsCheckingOut(false);
      setCheckoutSuccessId(newOrderId);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Title & Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block">
            Katalog Paket Siap Berangkat
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            Eksplorasi Paket Wisata Ritel NusaTrip
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Paket wisata hemat berkonsep <strong>Blind Vendor</strong> dengan standar fasilitas terjamin.
            Nama asli mitra hotel, restoran, bus, serta tiket digital akan terbuka otomatis pada <strong>H-7 Keberangkatan</strong>.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama paket, destinasi, atau lokawisata..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {searchQuery && (
              <Button size="sm" variant="outline" onClick={() => setSearchQuery("")} className="text-xs h-10">
                Reset Pencarian
              </Button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1 shrink-0">Kota:</span>
              {DEST_FILTERS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDest(d)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedDest === d
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-[var(--surface-page)] text-[var(--text-secondary)] hover:text-indigo-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1 shrink-0">Durasi:</span>
              {DURATION_FILTERS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSelectedDuration(dur)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedDuration === dur
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-[var(--surface-page)] text-[var(--text-secondary)] hover:text-indigo-600"
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Menampilkan <strong>{filteredPackages.length}</strong> paket wisata aktif</span>
          <Link href="/kustom-trip" className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
            <span>Tidak menemukan yang sesuai? Rancang Paket Kustom Mandiri</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 group hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--surface-page)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    {pkg.destination}
                  </span>
                  {pkg.badge && (
                    <Badge variant="brand" size="sm">
                      {pkg.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors leading-snug">
                    {pkg.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{pkg.duration}</span>
                  </div>
                </div>

                {/* Blind Vendor Facility Standards */}
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-indigo-950 dark:text-indigo-200">
                      {pkg.anchorZone}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Standar Fasilitas: <strong>{pkg.facilityStandard}</strong>
                  </p>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block italic">
                    Identitas vendor riil dibuka pada H-7 Keberangkatan.
                  </span>
                </div>

                {/* Spots Checklist */}
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1">
                    Titik Kunjungan Utama:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.spots.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">Tarif / Pax (Fixed):</span>
                  <strong className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {formatRupiah(pkg.price)}
                  </strong>
                </div>

                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => {
                    setSelectedPkg(pkg);
                    setCheckoutSuccessId(null);
                  }}
                  className="text-xs font-bold"
                >
                  Pesan Paket Ini
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />

      {/* Checkout Modal */}
      {selectedPkg && (
        <Modal
          isOpen={!!selectedPkg}
          onClose={() => setSelectedPkg(null)}
          title="Simulasi Checkout DP Paket Katalog (Harga Pas / Tanpa Nego)"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {checkoutSuccessId ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                  Pesanan Berhasil Dicatat! ID: {checkoutSuccessId}
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  Simulasi pembayaran DP 40% berhasil diverifikasi ke rekening escrow NusaTrip. Anda dapat melacak progres di Dasbor Pelanggan.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <Link href="/pelanggan">
                    <Button size="sm" variant="gradient">
                      Buka Dasbor Pelanggan
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setSelectedPkg(null)}>
                    Selesai
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text-muted)]">Paket Terpilih:</span>
                    <strong className="text-[var(--text-primary)]">{selectedPkg.title}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--text-muted)]">Tarif / Pax (Fixed):</span>
                    <strong className="text-indigo-600">{formatRupiah(selectedPkg.price)}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Jumlah Peserta (Pax):
                  </label>
                  <input
                    type="number"
                    min={2}
                    value={catalogPax}
                    onChange={(e) => setCatalogPax(Math.max(2, Number(e.target.value)))}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-bold"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Total Nilai Kontrak:</span>
                    <strong className="text-indigo-900 dark:text-indigo-200">
                      {formatRupiah(selectedPkg.price * catalogPax)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-bold pt-1 border-t border-indigo-200">
                    <span>Uang Muka (DP 40% Wajib):</span>
                    <span>{formatRupiah(Math.round(selectedPkg.price * catalogPax * 0.4))}</span>
                  </div>
                  <div className="flex justify-between text-amber-700 dark:text-amber-300 pt-0.5">
                    <span>Pelunasan 60% (Jatuh Tempo H-7):</span>
                    <span>{formatRupiah(Math.round(selectedPkg.price * catalogPax * 0.6))}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPkg(null)}>
                    Batal
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    isLoading={isCheckingOut}
                    onClick={handleCheckout}
                  >
                    Simulasikan Pembayaran DP 40%
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {isGoogleModalOpen && (
        <GoogleSSOModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
        />
      )}
    </div>
  );
}
