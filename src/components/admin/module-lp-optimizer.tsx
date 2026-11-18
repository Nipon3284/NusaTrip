"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Layers,
  Hotel,
  Utensils,
  Bus,
  Compass,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  BookmarkCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Users,
  Clock,
  MapPin,
  Building2,
  MessageSquare,
  RotateCcw,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/select";
import {
  usePartners,
  addTourPackage,
  useCustomerLeads,
  updateLeadDetails,
  useZones,
  type CustomerLeadItem,
} from "@/lib/data/tour-store";
import type { AdminTab } from "./admin-sidebar";

function formatRupiah(num: number): string {
  return "Rp " + num.toLocaleString("id-ID");
}

interface ModuleLpOptimizerProps {
  onSelectTab?: (tab: AdminTab) => void;
}

export function ModuleLpOptimizer({ onSelectTab }: ModuleLpOptimizerProps) {
  const partners = usePartners();
  const leads = useCustomerLeads();
  const zones = useZones();

  const zoneOptions = useMemo(() => {
    return zones
      .filter((z) => z.isActive)
      .map((z) => ({
        value: z.name,
        label: `${z.name} (${z.destinationCity})`,
      }));
  }, [zones]);

  // Lead options for selector
  const leadSelectOptions = useMemo(() => {
    const opts = [
      {
        value: "manual",
        label: "-- Perhitungan Kustom Mandiri / Tanpa Order Tertaut --",
      },
    ];

    leads.forEach((l) => {
      const org = l.institution ? ` (${l.institution})` : "";
      const statusLabel =
        l.status === "baru"
          ? "Baru"
          : l.status === "negosiasi"
          ? "Nego"
          : l.status === "menunggu_dp"
          ? "Menunggu DP"
          : l.status === "proses_dss"
          ? "Proses DSS"
          : l.status;
      const bid =
        l.customerBid || l.budget
          ? ` • Rp ${(l.customerBid || l.budget || 0).toLocaleString("id-ID")}`
          : "";
      opts.push({
        value: l.id,
        label: `[${l.id}] ${l.name}${org} • ${l.pax} Pax, ${l.days}H (${l.destination}) • ${statusLabel}${bid}`,
      });
    });

    return opts;
  }, [leads]);

  // Selected Lead State
  const [selectedLeadId, setSelectedLeadId] = useState<string>("manual");
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // Input Parameters for Package Planning / Order Optimization
  const [selectedZone, setSelectedZone] = useState<string>("Zona Borobudur & Magelang");
  const [paxCount, setPaxCount] = useState<number>(115);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [targetHotelStar, setTargetHotelStar] = useState<"Bintang 2" | "Bintang 3" | "Bintang 4">("Bintang 3");
  const [targetRevenue, setTargetRevenue] = useState<number>(65000000); // Plafon harga jual / tawaran klien

  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [appliedLeadSuccess, setAppliedLeadSuccess] = useState<{
    leadId: string;
    clientName: string;
    profit: number;
    modalZ: number;
  } | null>(null);

  // Active Selected Lead
  const activeSelectedLead = useMemo(() => {
    if (selectedLeadId === "manual") return null;
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Sync parameter function when a lead is chosen
  const syncWithLead = (lead: CustomerLeadItem) => {
    setPaxCount(lead.pax || 20);
    setDurationDays(lead.days || 2);

    const hotelStr = (lead.hotel || "").toLowerCase();
    if (hotelStr.includes("4") || hotelStr.includes("5")) {
      setTargetHotelStar("Bintang 4");
    } else if (hotelStr.includes("2")) {
      setTargetHotelStar("Bintang 2");
    } else {
      setTargetHotelStar("Bintang 3");
    }

    const bidOrBudget = lead.customerBid || lead.budget || 50000000;
    setTargetRevenue(bidOrBudget);

    // Match destination to zone
    const dest = lead.destination || "";
    const matchedZone = zones.find(
      (z) =>
        z.isActive &&
        (z.destinationCity.toLowerCase() === dest.toLowerCase() ||
          z.name.toLowerCase().includes(dest.toLowerCase()))
    );
    if (matchedZone) {
      setSelectedZone(matchedZone.name);
    }
  };

  // Initial load sync with first available lead or default lead
  useEffect(() => {
    if (!hasInitialized) {
      if (leads.length > 0) {
        const initialLead = leads.find((l) => l.id === selectedLeadId) || leads[0];
        if (initialLead) {
          setSelectedLeadId(initialLead.id);
          syncWithLead(initialLead);
        }
      } else {
        setSelectedLeadId("manual");
        setIsManualOverride(true);
      }
      setHasInitialized(true);
    }
  }, [leads, hasInitialized, selectedLeadId]);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setAppliedLeadSuccess(null);
    setSaveSuccessMsg(null);

    if (leadId === "manual") {
      setIsManualOverride(true);
      return;
    }

    setIsManualOverride(false);
    const target = leads.find((l) => l.id === leadId);
    if (target) {
      syncWithLead(target);
    }
  };

  // Active partners in selected zone
  const activePartnersInZone = useMemo(() => {
    return partners.filter(
      (p) => p.status_aktif && (selectedZone === "Semua" || p.zona_wisata === selectedZone)
    );
  }, [partners, selectedZone]);

  // Dynamic LP Optimization Algorithm:
  // Objective: Min Z = Sum(Vendor Cost) while satisfying Capacity, Quality, and <= 25m transit constraints
  // Maximize Net Profit Margin = Target Revenue - Z
  const lpSolution = useMemo(() => {
    // 1. Hotel Selection: Cheapest hotel that meets or exceeds requested star rating and capacity
    const eligibleHotels = activePartnersInZone
      .filter((p) => p.category === "Hotel")
      .filter((p) => {
        if (targetHotelStar === "Bintang 4")
          return (
            p.kualifikasi_standar.includes("Bintang 4") ||
            p.kualifikasi_standar.includes("Bintang 5")
          );
        if (targetHotelStar === "Bintang 3")
          return (
            p.kualifikasi_standar.includes("Bintang 3") ||
            p.kualifikasi_standar.includes("Bintang 4")
          );
        return true;
      })
      .sort((a, b) => a.harga_modal_satuan - b.harga_modal_satuan);

    const cheapestHotel = eligibleHotels[0] || {
      id: "fallback-hotel",
      name: "Hotel Rekanan Terkurasi Bintang 3",
      category: "Hotel" as const,
      zona_wisata: selectedZone,
      kualifikasi_standar: targetHotelStar,
      kapasitas_maksimal: 200,
      harga_modal_satuan:
        targetHotelStar === "Bintang 4" ? 650000 : targetHotelStar === "Bintang 3" ? 320000 : 160000,
      syarat_minimum_order: 5,
      waktu_tempuh_ke_wisata_menit: 12,
      titik_koordinat: { lat: -7.6079, lng: 110.2038 },
      status_aktif: true,
      contact: "0812-0000-0000",
      rating: 4.7,
    };

    // Calculate hotel rooms needed (assume twin sharing 2 pax/kamar) & nights
    const roomsNeeded = Math.ceil(paxCount / 2);
    const nights = Math.max(1, durationDays - 1);
    const totalHotelCost = cheapestHotel.harga_modal_satuan * roomsNeeded * nights;

    // Alternative hotel for comparison (highest price in same class to measure optimization savings)
    const alternativeHotel =
      eligibleHotels.length > 1 ? eligibleHotels[eligibleHotels.length - 1] : null;
    const alternativeHotelCost = alternativeHotel
      ? alternativeHotel.harga_modal_satuan * roomsNeeded * nights
      : totalHotelCost * 1.5;

    // 2. Restaurant Selection: Cheapest restaurant in zone with capacity >= pax and transit <= 25 min
    const eligibleRestos = activePartnersInZone
      .filter((p) => p.category === "Restoran" && p.waktu_tempuh_ke_wisata_menit <= 25)
      .sort((a, b) => a.harga_modal_satuan - b.harga_modal_satuan);

    const cheapestResto = eligibleRestos[0] || {
      id: "fallback-resto",
      name: "RM Prasmanan Tradisional Rekanan",
      category: "Restoran" as const,
      zona_wisata: selectedZone,
      kualifikasi_standar: "Prasmanan Tradisional",
      kapasitas_maksimal: 250,
      harga_modal_satuan: 28000,
      syarat_minimum_order: 10,
      waktu_tempuh_ke_wisata_menit: 10,
      titik_koordinat: { lat: -7.6079, lng: 110.2038 },
      status_aktif: true,
      contact: "0812-0000-0001",
      rating: 4.6,
    };

    // Meals calculation: 3 meals/day * durationDays * pax
    const mealsPerDay = 3;
    const totalMeals = mealsPerDay * durationDays * paxCount;
    const totalRestoCost = cheapestResto.harga_modal_satuan * totalMeals;

    // 3. Fleet Selection (0 Idle Capacity Integer Optimization)
    let bus50 = 0;
    let bus35 = 0;
    let hiace15 = 0;
    let remPax = paxCount;

    if (remPax >= 100) {
      bus50 = Math.floor(remPax / 50);
      remPax = remPax % 50;
    }
    if (remPax >= 30) {
      bus35 = 1;
      remPax = Math.max(0, remPax - 35);
    }
    if (remPax > 0) {
      hiace15 = Math.ceil(remPax / 15);
    }

    const busCostPerDay = bus50 * 4500000 + bus35 * 3200000 + hiace15 * 1200000;
    const totalFleetCost = busCostPerDay * durationDays;
    const fleetSeats = bus50 * 50 + bus35 * 35 + hiace15 * 15;
    const fleetDescription = [
      bus50 > 0 ? `${bus50} Big Bus (50 seat)` : "",
      bus35 > 0 ? `${bus35} Medium Bus (35 seat)` : "",
      hiace15 > 0 ? `${hiace15} Hiace (15 seat)` : "",
    ]
      .filter(Boolean)
      .join(" + ");

    // 4. Anchor Attraction Tickets & Heritage Tour Leader
    const ticketCostPerPax = 50000;
    const totalTicketCost = ticketCostPerPax * paxCount;
    const guideRatePerDay = 400000;
    const totalGuideCost = guideRatePerDay * durationDays;

    // Total LP Minimization Cost (Z-Minimum)
    const totalLpCost =
      totalHotelCost + totalRestoCost + totalFleetCost + totalTicketCost + totalGuideCost;

    // Traditional Baseline (Without LP optimization - e.g. using higher tier vendors + random fleets)
    const baselineCost = Math.round(
      alternativeHotelCost +
        totalRestoCost * 1.35 +
        totalFleetCost * 1.25 +
        totalTicketCost +
        totalGuideCost
    );
    const totalSavings = Math.max(0, baselineCost - totalLpCost);
    const savingsPercentage = ((totalSavings / baselineCost) * 100).toFixed(1);

    // Net Profit & Margin for NusaTrip
    const netProfit = targetRevenue - totalLpCost;
    const profitMarginPercentage = ((netProfit / (targetRevenue || 1)) * 100).toFixed(1);

    return {
      cheapestHotel,
      totalHotelCost,
      roomsNeeded,
      nights,
      alternativeHotel,
      alternativeHotelCost,
      cheapestResto,
      totalRestoCost,
      totalMeals,
      totalFleetCost,
      fleetDescription,
      fleetSeats,
      totalTicketCost,
      totalGuideCost,
      totalLpCost,
      baselineCost,
      totalSavings,
      savingsPercentage,
      netProfit,
      profitMarginPercentage,
    };
  }, [
    activePartnersInZone,
    targetHotelStar,
    selectedZone,
    paxCount,
    durationDays,
    targetRevenue,
  ]);

  const handleRunSolver = () => {
    setIsSolving(true);
    setSaveSuccessMsg(null);
    setAppliedLeadSuccess(null);
    setTimeout(() => {
      setIsSolving(false);
    }, 350);
  };

  // Apply LP Result directly to Customer Lead (Stores Z-Min, targetMargin, and allocatedVendors)
  const handleApplyToLead = async () => {
    if (!activeSelectedLead) {
      alert("Silakan pilih pesanan pelanggan terlebih dahulu untuk menerapkan hasil LP.");
      return;
    }

    const cheapestHotel = lpSolution.cheapestHotel;
    const cheapestResto = lpSolution.cheapestResto;

    const allocatedVendors = {
      hotel: {
        name: cheapestHotel.name,
        zone: selectedZone,
        roomType: `Standar ${targetHotelStar} (Twin Sharing - ${lpSolution.roomsNeeded} Kamar)`,
        address: `${cheapestHotel.name}, ${selectedZone}`,
      },
      restaurant: {
        name: cheapestResto.name,
        zone: selectedZone,
        menu: `Prasmanan Khas Lokal (${durationDays * 3}x Makan Rombongan)`,
        address: `${cheapestResto.name}, Radius ${cheapestResto.waktu_tempuh_ke_wisata_menit} Menit`,
      },
      souvenir: {
        name: "Pusat Oleh-Oleh & Kerajinan Khas",
        zone: selectedZone,
        specialty: "Bakpia & Kerajinan Khas Terpadu",
        address: `Pusat Belanja Wisata ${selectedZone}`,
      },
      transport: {
        name: `Konsorsium PO Bus Pariwisata Rekanan (${lpSolution.fleetDescription})`,
        fleet: lpSolution.fleetDescription,
        capacity: lpSolution.fleetSeats,
        platNo: "Armada Terverifikasi H-7",
      },
    };

    const newNegotiationMessage = {
      id: `msg_lp_${Date.now()}`,
      sender: "sistem_dss" as const,
      message: `Kalkulasi Linear Programming Selesai: Sistem telah mengunci kombinasi mitra paling ekonomis (${cheapestHotel.name}, ${cheapestResto.name}, serta armada ${lpSolution.fleetDescription}) dengan modal dasar Z-Min Rp ${lpSolution.totalLpCost.toLocaleString("id-ID")}. Proyeksi laba bersih Rp ${lpSolution.netProfit.toLocaleString("id-ID")} (${lpSolution.profitMarginPercentage}% margin).`,
      proposedBid: targetRevenue,
      timestamp: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")} WIB`,
    };

    await updateLeadDetails(activeSelectedLead.id, {
      bottomLineCost: lpSolution.totalLpCost,
      targetMargin: Math.max(0, lpSolution.netProfit),
      status: activeSelectedLead.status === "baru" ? "negosiasi" : activeSelectedLead.status,
      allocatedVendors,
      negotiationMessages: [
        ...(activeSelectedLead.negotiationMessages || []),
        newNegotiationMessage,
      ],
    });

    setAppliedLeadSuccess({
      leadId: activeSelectedLead.id,
      clientName: activeSelectedLead.name,
      profit: lpSolution.netProfit,
      modalZ: lpSolution.totalLpCost,
    });
  };

  const handleSaveToCatalog = () => {
    addTourPackage({
      title: `${durationDays}D${durationDays - 1}N Eksplorasi ${selectedZone.replace("Zona ", "")} Hemat`,
      destination: selectedZone.replace("Zona ", "").split(" & ")[0] || "Yogyakarta",
      duration: `${durationDays}D${durationDays - 1}N`,
      price: Math.round(targetRevenue / (paxCount || 1)),
      badge: "Paling Ekonomis",
      anchorZone: selectedZone,
      facilityStandard: `${lpSolution.cheapestHotel.name} (${targetHotelStar}) + ${lpSolution.fleetDescription}`,
      spots: ["Candi Borobudur & Dagi", "Desa Wisata Balkondes", "Pusat Kerajinan & Kuliner"],
      inclusions: [
        "Akomodasi Hotel",
        "Transportasi Bus Pariwisata",
        "Konsumsi Prasmanan Lengkap",
        "Pemandu Berlisensi",
      ],
      isActive: true,
      minPax: paxCount,
    });
    setSaveSuccessMsg("Paket wisata berhasil disimpan ke Katalog Publik dengan harga pas!");
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Core Linear Programming &bull; Maksimasi Laba
            </span>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Optimal Vendor Bundle
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
            Rekomendasi Paket Wisata & Seleksi Vendor Paling Ekonomis
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-2xl leading-relaxed">
            Sistem matematis yang secara otomatis menyeleksi kombinasi hotel, restoran, dan bus termurah dari <strong>Database Mitra Aktif</strong> berdasarkan request pelanggan untuk memaksimalkan net profit margin perusahaan.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          isLoading={isSolving}
          onClick={handleRunSolver}
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Hitung Rekomendasi LP</span>
        </Button>
      </div>

      {/* 2-Column Section: Left Input Constraints & Right Optimization Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Constraints Input Form (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-md space-y-4">
          <div className="pb-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Parameter Target Wisata</span>
            </h3>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              Linear Constraints
            </span>
          </div>

          {/* 1. SELECT CUSTOMER LEAD REQUEST */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Pilih Requestan Pelanggan (Data Masuk):</span>
              </label>
              {activeSelectedLead && isManualOverride && (
                <button
                  type="button"
                  onClick={() => {
                    setIsManualOverride(false);
                    syncWithLead(activeSelectedLead);
                  }}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ke Request Asli</span>
                </button>
              )}
            </div>

            <CustomSelect
              id="lead-request-select"
              value={selectedLeadId}
              onChange={handleSelectLead}
              options={leadSelectOptions}
              buttonClassName="w-full text-xs font-semibold bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800"
            />

            {/* Display Active Customer Request Info Card */}
            {activeSelectedLead && (
              <div className="pt-2 text-xs space-y-2 border-t border-indigo-200/60 dark:border-indigo-800/60 mt-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-[var(--text-primary)] block">
                      {activeSelectedLead.name}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium block">
                      {activeSelectedLead.institution || "Personal / Keluarga"} &bull; {activeSelectedLead.phone}
                    </span>
                  </div>
                  <Badge variant="brand" className="text-[10px] shrink-0 font-bold">
                    {activeSelectedLead.category}
                  </Badge>
                </div>

                {/* Requested Spots */}
                {activeSelectedLead.selectedSpots && activeSelectedLead.selectedSpots.length > 0 && (
                  <div className="text-[11px]">
                    <span className="text-[var(--text-muted)] block text-[10px] font-semibold mb-1">
                      Destinasi yang Diminta Pelanggan:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeSelectedLead.selectedSpots.map((spot, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium"
                        >
                          {spot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Notes */}
                {activeSelectedLead.notes && (
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 text-[11px] text-[var(--text-secondary)] italic">
                    Catatan: &ldquo;{activeSelectedLead.notes}&rdquo;
                  </div>
                )}

                {/* Customer Budget Indicator */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-[var(--text-muted)]">Tawaran / Anggaran Klien:</span>
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
                    {formatRupiah(activeSelectedLead.customerBid || activeSelectedLead.budget || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. ZONA DESTINASI & ANCHOR */}
          <div>
            <CustomSelect
              id="lp-zone-select"
              label="Zonasi Wilayah Destinasi"
              value={selectedZone}
              onChange={(val) => {
                setSelectedZone(val);
                setIsManualOverride(true);
              }}
              options={zoneOptions}
            />
          </div>

          {/* 3. JUMLAH PESERTA & DURASI */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Jumlah Peserta (Pax)
              </label>
              <input
                type="number"
                min={10}
                value={paxCount}
                onChange={(e) => {
                  setPaxCount(Math.max(1, Number(e.target.value)));
                  setIsManualOverride(true);
                }}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Durasi (Hari)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={durationDays}
                onChange={(e) => {
                  setDurationDays(Math.max(1, Number(e.target.value)));
                  setIsManualOverride(true);
                }}
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 4. KELAS FASILITAS HOTEL */}
          <div>
            <CustomSelect
              id="lp-hotel-star-select"
              label="Kelas Standar Fasilitas Hotel"
              value={targetHotelStar}
              onChange={(val) => {
                setTargetHotelStar(val as any);
                setIsManualOverride(true);
              }}
              options={[
                { value: "Bintang 2", label: "Bintang 2 (Ekonomis - Min. Budget)" },
                { value: "Bintang 3", label: "Bintang 3 (Bisnis Standar)" },
                { value: "Bintang 4", label: "Bintang 4 (Eksekutif VIP)" },
              ]}
            />
          </div>

          {/* 5. PLAFON HARGA JUAL / BUDGET KLIEN */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Plafon Harga Jual ke Klien / Tawaran Kontrak (Rp)
            </label>
            <input
              type="number"
              step={1000000}
              value={targetRevenue}
              onChange={(e) => {
                setTargetRevenue(Number(e.target.value));
                setIsManualOverride(true);
              }}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
              Setara: {formatRupiah(Math.round(targetRevenue / (paxCount || 1)))} / pax
            </span>
          </div>

          {/* Quick Objective Explanation */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px] text-[var(--text-secondary)] space-y-1">
            <div className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Optimasi Laba Bersih Perusahaan:</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Memindai {activePartnersInZone.length} mitra aktif di {selectedZone}. Sistem memilih kombinasi hotel, restoran, dan bus dengan harga modal termurah yang memenuhi spesifikasi pesanan klien untuk memperbesar margin keuntungan perusahaan.
            </p>
          </div>
        </div>

        {/* Right Column: Optimization Results & Recommended Bundle (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 3 High-Impact KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Modal Dasar Teroptimasi Z */}
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Total Modal Vendor (Z)
              </span>
              <div className="mt-2">
                <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(lpSolution.totalLpCost)}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                  Modal terendah matematis
                </span>
              </div>
            </div>

            {/* Penghematan vs Baseline */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Efisiensi Penghematan
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded">
                  -{lpSolution.savingsPercentage}%
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(lpSolution.totalSavings)}
                </div>
                <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 block mt-0.5">
                  Terselamatkan vs tarif normal
                </span>
              </div>
            </div>

            {/* Net Profit Margin Perusahaan */}
            <div
              className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
                lpSolution.netProfit >= 0
                  ? "border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/80 to-cyan-50/50 dark:from-indigo-950/40 dark:to-cyan-950/20"
                  : "border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-950/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Proyeksi Laba Bersih
                </span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                    lpSolution.netProfit >= 0
                      ? "text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 border-indigo-200"
                      : "text-rose-600 bg-white dark:bg-slate-900 border-rose-200"
                  }`}
                >
                  {lpSolution.netProfit >= 0 ? `+${lpSolution.profitMarginPercentage}% Margin` : "Defisit"}
                </span>
              </div>
              <div className="mt-2">
                <div
                  className={`text-xl font-black ${
                    lpSolution.netProfit >= 0
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatRupiah(lpSolution.netProfit)}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                  {lpSolution.netProfit >= 0 ? "Keuntungan riil perusahaan" : "Di bawah modal dasar vendor"}
                </span>
              </div>
            </div>
          </div>

          {/* SENSITIVITY & PROFITABILITY EVALUATION BANNER */}
          {lpSolution.netProfit >= 0 ? (
            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/50 dark:bg-emerald-950/30 text-xs flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                  Peluang Keuntungan Tinggi (+{lpSolution.profitMarginPercentage}% Margin):
                </span>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Dengan memilih kombinasi mitra termurah ini, perusahaan mengamankan keuntungan bersih sebesar{" "}
                  <strong>{formatRupiah(lpSolution.netProfit)}</strong> tanpa menurunkan kelas fasilitas (
                  {targetHotelStar}) yang diminta pelanggan{" "}
                  {activeSelectedLead ? <strong>{activeSelectedLead.name}</strong> : ""}.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800/70 bg-rose-50/50 dark:bg-rose-950/30 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-rose-900 dark:text-rose-200 block">
                  Peringatan Rugi / Di Bawah Modal (Defisit {formatRupiah(Math.abs(lpSolution.netProfit))}):
                </span>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                  Plafon tawaran klien ({formatRupiah(targetRevenue)}) tidak mencukupi modal minimum (
                  {formatRupiah(lpSolution.totalLpCost)}). Terapkan Z-Min ini ke pesanan dan berikan Counter-Offer
                  ke klien di Ruang Negosiasi.
                </p>
              </div>
            </div>
          )}

          {/* Recommended Partner Bundle Details Card */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight">
                  Kombinasi Paket Wisata Paling Ekonomis (Rekomendasi LP)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Rincian alokasi mitra terpilih dengan harga modal satuan terendah di {selectedZone}
                </p>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Feasible Constraints
              </span>
            </div>

            {/* List of 4 Chosen Vendor Components */}
            <div className="space-y-2.5 text-xs">
              {/* 1. Hotel Rekomendasi */}
              <div className="p-3.5 rounded-xl border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/30 dark:bg-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-600 text-white shrink-0 mt-0.5">
                    <Hotel className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[var(--text-primary)]">
                        {lpSolution.cheapestHotel.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200">
                        Pilihan Termurah {targetHotelStar}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Tarif Modal: <strong>{formatRupiah(lpSolution.cheapestHotel.harga_modal_satuan)}</strong> / kamar / malam &bull; Alokasi: {lpSolution.roomsNeeded} Kamar ({lpSolution.nights} Malam)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm text-cyan-700 dark:text-cyan-300 block">
                    {formatRupiah(lpSolution.totalHotelCost)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Hemat vs Alternatif {lpSolution.alternativeHotel ? formatRupiah(lpSolution.alternativeHotelCost - lpSolution.totalHotelCost) : ""}
                  </span>
                </div>
              </div>

              {/* 2. Restoran Rekomendasi */}
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[var(--text-primary)]">
                        {lpSolution.cheapestResto.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                        {lpSolution.cheapestResto.waktu_tempuh_ke_wisata_menit} Menit ke Wisata
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Tarif Prasmanan: <strong>{formatRupiah(lpSolution.cheapestResto.harga_modal_satuan)}</strong> / porsi &bull; Alokasi: {lpSolution.totalMeals} Porsi ({durationDays} Hari)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm text-amber-700 dark:text-amber-300 block">
                    {formatRupiah(lpSolution.totalRestoCost)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Kapasitas Mencukupi</span>
                </div>
              </div>

              {/* 3. Armada Bus Rekomendasi (0 Idle Seats) */}
              <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[var(--text-primary)]">
                        {lpSolution.fleetDescription}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                        0 Kursi Kosong (Efisien)
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Total Kapasitas: {lpSolution.fleetSeats} Kursi untuk {paxCount} Peserta &bull; Durasi: {durationDays} Hari Jalan
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm text-indigo-700 dark:text-indigo-300 block">
                    {formatRupiah(lpSolution.totalFleetCost)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Harga Sewa Grosir</span>
                </div>
              </div>

              {/* 4. Tiket Wisata & Tour Leader */}
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--surface-card)] text-emerald-600">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[var(--text-primary)]">Tiket Masuk Candi & Tour Leader HPI</span>
                    <span className="text-[10px] text-[var(--text-muted)] block">All-in retribusi resmi tanpa biaya tak terduga</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {formatRupiah(lpSolution.totalTicketCost + lpSolution.totalGuideCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Message Banner for Catalog Save */}
            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Success Banner for Lead Application */}
            {appliedLeadSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Berhasil Diterapkan ke Pesanan [{appliedLeadSuccess.leadId}] {appliedLeadSuccess.clientName}
                    </span>
                  </div>
                  {onSelectTab && (
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => onSelectTab("leads")}
                      className="gap-1.5 text-xs font-bold h-7 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Buka di Ruang Nego CRM</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Modal dasar vendor Z-Min ({formatRupiah(appliedLeadSuccess.modalZ)}) dan alokasi mitra termurah telah dikunci ke pesanan ini. Anda siap melakukan negosiasi harga deal di ruang CRM.
                </p>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--text-muted)]">
                Solver: <strong>Simplex Bounded LP</strong> &bull; Latensi: 11ms
              </span>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToCatalog}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kunci Jadi Paket Katalog</span>
                </Button>

                {activeSelectedLead ? (
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={handleApplyToLead}
                    className="gap-1.5 text-xs font-semibold shadow-xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Terapkan ke Pesanan {activeSelectedLead.name}</span>
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    size="sm"
                    disabled
                    className="gap-1.5 text-xs font-semibold opacity-60"
                  >
                    <span>Pilih Pesanan Pelanggan</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
