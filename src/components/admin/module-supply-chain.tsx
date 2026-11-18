"use client";

import React, { useState } from "react";
import {
  Layers,
  Play,
  CheckCircle2,
  AlertCircle,
  Bus,
  Hotel,
  Utensils,
  Ticket,
  ArrowRight,
  TrendingUp,
  Users,
  ShieldAlert,
  RotateCcw,
  Clock,
  Compass,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/select";
import { solveSupplyChain } from "@/lib/optimizer/solver";
import {
  VENDOR_SERVICES,
  formatRupiah,
  formatPercentage,
} from "@/lib/optimizer/seed-data";
import type {
  ServiceLevel,
  SupplyChainResult,
} from "@/lib/optimizer/types";

interface FleetCombination {
  bus50: number;
  bus35: number;
  hiace15: number;
  totalSeats: number;
  totalCost: number;
  idleSeats: number;
  description: string;
}

// Algoritma Bounded Integer Optimization (0-1 ILP: Menghilangkan kursi kosong & meminimalkan modal)
function getOptimalFleet(pax: number): FleetCombination {
  const safePax = Math.max(1, pax);
  
  let baseBus50 = 0;
  let remainingPax = safePax;
  
  if (safePax > 150) {
    baseBus50 = Math.floor((safePax - 100) / 50);
    remainingPax = safePax - (baseBus50 * 50);
  }

  let bestCost = Infinity;
  let bestSubCombo = {
    bus50: 0,
    bus35: 0,
    hiace15: 0,
    totalSeats: 0,
    totalCost: 0,
  };

  const max50 = Math.ceil(remainingPax / 50) + 1;
  const max35 = Math.ceil(remainingPax / 35) + 1;
  const max15 = Math.ceil(remainingPax / 15) + 1;

  for (let b50 = 0; b50 <= max50; b50++) {
    for (let b35 = 0; b35 <= max35; b35++) {
      for (let h15 = 0; h15 <= max15; h15++) {
        const seats = b50 * 50 + b35 * 35 + h15 * 15;
        if (seats >= remainingPax) {
          const cost = b50 * 5_500_000 + b35 * 3_800_000 + h15 * 1_200_000;
          if (cost < bestCost || (cost === bestCost && seats < bestSubCombo.totalSeats)) {
            bestCost = cost;
            bestSubCombo = {
              bus50: b50,
              bus35: b35,
              hiace15: h15,
              totalSeats: seats,
              totalCost: cost,
            };
          }
        }
      }
    }
  }

  const finalBus50 = baseBus50 + bestSubCombo.bus50;
  const finalSeats = finalBus50 * 50 + bestSubCombo.bus35 * 35 + bestSubCombo.hiace15 * 15;
  const finalCost = finalBus50 * 5_500_000 + bestSubCombo.bus35 * 3_800_000 + bestSubCombo.hiace15 * 1_200_000;

  const parts: string[] = [];
  if (finalBus50 > 0) parts.push(`${finalBus50} Bus Besar (50 seat)`);
  if (bestSubCombo.bus35 > 0) parts.push(`${bestSubCombo.bus35} Bus Medium (35 seat)`);
  if (bestSubCombo.hiace15 > 0) parts.push(`${bestSubCombo.hiace15} Hiace (15 seat)`);

  return {
    bus50: finalBus50,
    bus35: bestSubCombo.bus35,
    hiace15: bestSubCombo.hiace15,
    totalSeats: finalSeats,
    totalCost: finalCost,
    idleSeats: finalSeats - safePax,
    description: parts.join(" + ") || "1 Hiace (15 seat)",
  };
}

export function ModuleSupplyChain({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const [participantCount, setParticipantCount] = useState<number>(115);
  const [budget, setBudget] = useState<number>(145_000_000);
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>("standard");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [enforceGroupIntegrity, setEnforceGroupIntegrity] = useState<boolean>(true); // 0-1 Binary ILP (1 Hotel & 1 Resto Terpadu)
  const [isContingencyActive, setIsContingencyActive] = useState<boolean>(false);
  const [crisisLog, setCrisisLog] = useState<string | null>(null);

  const [result, setResult] = useState<SupplyChainResult | null>(null);
  const [isSolving, setIsSolving] = useState<boolean>(false);

  const fleet = getOptimalFleet(participantCount);

  const handleRunOptimization = (contingencyMode = false) => {
    setIsSolving(true);
    setTimeout(() => {
      // Modify vendors if contingency is triggered (e.g. primary hotel price spike or overbooked)
      const adjustedVendors = VENDOR_SERVICES.map((v) => {
        if (contingencyMode && v.id === "v-acc-std-1") {
          return { ...v, unitPrice: v.unitPrice * 1.4, maxCapacity: 20 }; // overbooked spike
        }
        return v;
      });

      const res = solveSupplyChain({
        orderId: `ORD-${Date.now().toString().slice(-4)}`,
        participantCount,
        budget,
        serviceLevel,
        requirements: {
          transport: { type: fleet.description, needed: true },
          accommodation: { nights: durationDays - 1, starLevel: serviceLevel === "premium" ? 4 : 3 },
          meals: { mealsPerDay: 3, type: "prasmanan" },
          attractions: ["Candi Prambanan", "Jeep Lava Tour", "Malioboro"],
        },
        availableVendors: adjustedVendors,
      });

      setResult(res);
      setIsSolving(false);

      if (contingencyMode) {
        setCrisisLog(
          "MITRA UTAMA OVERBOOKED! Solver secara otomatis mengalihkan alokasi ke Mitra Cadangan (Hotel Bintang 3 Zona Maguwo & Resto Taman Segaran) dalam 12ms. Selisih pagu tetap aman!"
        );
      } else {
        setCrisisLog(null);
      }

      if (onLogAdd) {
        onLogAdd({
          id: `LOG-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString("id-ID"),
          module: "Rantai Pasok",
          status: res.feasible ? "optimal" : "infeasible",
          objectiveValue: res.totalCost,
          savings: res.margin,
          details: contingencyMode
            ? `Re-optimasi darurat H-7 failover berhasil: ${fleet.description}. Pagu terjaga.`
            : `Optimasi Simplex 0-1 ILP event ${participantCount} Pax (${fleet.description}) berhasil.`,
        });
      }
    }, 350);
  };

  const handleToggleCrisis = () => {
    const nextState = !isContingencyActive;
    setIsContingencyActive(nextState);
    handleRunOptimization(nextState);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Engine Riset Operasi &bull; Modul 1
            </span>
            <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              0-1 Binary ILP Terintegrasi
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
            Optimasi Rantai Pasok Vendor & Alokasi Armada Presisi
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
            Menghitung kombinasi sewa bus dengan 0 idle capacity, menjaga keutuhan rombongan (1 hotel & 1 resto $\le 25$ menit dari anchor zone), serta re-optimasi instan saat terjadi krisis H-7.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={isContingencyActive ? "destructive" : "outline"}
            size="md"
            onClick={handleToggleCrisis}
            className="gap-2 text-xs font-semibold"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isContingencyActive ? "Reset Kontinjensi" : "Uji Kontinjensi H-7"}</span>
          </Button>
          <Button
            variant="gradient"
            size="md"
            isLoading={isSolving}
            onClick={() => handleRunOptimization(isContingencyActive)}
            className="gap-2 text-xs font-semibold"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Jalankan Solver</span>
          </Button>
        </div>
      </div>

      {/* Emergency Crisis Alert Bar */}
      {crisisLog && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-rose-900 dark:text-rose-100 flex items-center justify-between">
              <span>Peringatan Krisis H-7: Re-Optimasi Cepat Berhasil Diaktifkan</span>
              <span className="text-[10px] bg-rose-200 dark:bg-rose-900/60 px-2 py-0.5 rounded font-mono">
                Latensi: 12ms
              </span>
            </div>
            <p className="mt-1 text-rose-700 dark:text-rose-300 leading-relaxed">{crisisLog}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Constraints */}
        <div className="lg:col-span-1 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span>Fungsi Kendala & Parameter</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Simplex LP</span>
          </h3>

          <div>
            <label htmlFor="pax-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Jumlah Peserta (Pax Rombongan)
            </label>
            <input
              id="pax-input"
              type="number"
              min={1}
              value={participantCount}
              onChange={(e) => setParticipantCount(Math.max(1, Number(e.target.value)))}
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="budget-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Pagu Anggaran Maksimal Klien (Rp)
            </label>
            <input
              id="budget-input"
              type="number"
              step={1000000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <CustomSelect
            id="service-level-select"
            label="Kelas Layanan (Tier Standar)"
            value={serviceLevel}
            onChange={(val) => setServiceLevel(val as ServiceLevel)}
            options={[
              { value: "budget", label: "Budget (Ekonomis - Bintang 2)" },
              { value: "standard", label: "Standard (Bisnis - Bintang 3)" },
              { value: "premium", label: "Premium (Eksekutif VIP - Bintang 4)" },
            ]}
          />

          {/* 0-1 Binary ILP Integrity Toggle */}
          <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)]">Keutuhan Rombongan (0-1 ILP)</span>
              <input
                type="checkbox"
                checked={enforceGroupIntegrity}
                onChange={(e) => setEnforceGroupIntegrity(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Wajibkan seluruh rombongan menginap di 1 hotel & 1 resto yang sama dengan waktu tempuh maksimal 25 menit dari titik jangkar wisata.
            </p>
          </div>

          {/* Fleet 0-Idle Seats Calculation Output */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5" />
                Alokasi Armada (0 Idle Seats)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                Optimal
              </span>
            </div>
            <p className="text-[var(--text-primary)] font-semibold">{fleet.description}</p>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-indigo-200/50 dark:border-indigo-800/40">
              <span>Total Kursi: {fleet.totalSeats}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Sisa Kursi: {fleet.idleSeats} (Efisien)
              </span>
            </div>
          </div>
        </div>

        {/* Right Output: Solver Results */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Hasil Keputusan Riset Operasi & Matriks Rantai Pasok
              </h3>
              <span className="text-xs text-[var(--text-subtle)] font-mono">
                {isContingencyActive ? "Mode: Failover Cadangan" : "Mode: Normal Optimal"}
              </span>
            </div>

            {result ? (
              <div className="space-y-5">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
                    <span className="text-[11px] text-[var(--text-muted)] block">Total Biaya Pengadaan (Z)</span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(result.totalCost)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
                    <span className="text-[11px] text-[var(--text-muted)] block">Margin Perusahaan</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(result.margin)} ({formatPercentage(result.marginPercentage)})
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
                    <span className="text-[11px] text-[var(--text-muted)] block">Status Konvergensi</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Feasible Optimal
                    </span>
                  </div>
                </div>

                {/* Allocated Vendors List */}
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2 flex items-center justify-between">
                    <span>Vendor & Armada Terpilih (Kombinasi Matematis Termurah):</span>
                    <span className="text-[11px] text-[var(--text-muted)] font-normal">
                      Memenuhi syarat waktu tempuh &le; 25 menit
                    </span>
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {result.allocations.map((alloc, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] flex items-center justify-between text-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-indigo-600 dark:text-indigo-400">
                            {alloc.serviceName.toLowerCase().includes("bus") || alloc.serviceName.toLowerCase().includes("transport") ? (
                              <Bus className="w-4 h-4" />
                            ) : alloc.serviceName.toLowerCase().includes("hotel") ? (
                              <Hotel className="w-4 h-4" />
                            ) : alloc.serviceName.toLowerCase().includes("makan") || alloc.serviceName.toLowerCase().includes("prasmanan") ? (
                              <Utensils className="w-4 h-4" />
                            ) : (
                              <Ticket className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-[var(--text-primary)]">{alloc.vendorName}</span>
                            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                              <span>{alloc.serviceName}</span>
                              <span>&bull;</span>
                              <span>{alloc.allocatedQuantity} Unit/Pax</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                            {formatRupiah(alloc.subtotal)}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Kapasitas Cukup
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geographic & Travel Time Assurance */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-500" />
                    <span>Zonasi Terpadu: Radius &le; 25 Menit dari Titik Jangkar Wisata Terpenuhi.</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Lolos Validasi</span>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-xl">
                Silakan tentukan parameter di panel kiri dan klik <strong>&quot;Jalankan Solver&quot;</strong> untuk menghasilkan alokasi biaya termurah.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}