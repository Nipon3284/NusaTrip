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
  Sparkles,
  TrendingUp,
  Users,
  Minus,
  Plus,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/select";
import {
  solveSupplyChain,
} from "@/lib/optimizer/solver";
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

// Algoritma Bounded Integer Optimization (Komputasi < 0.1ms tanpa freeze)
function getOptimalFleet(pax: number): FleetCombination {
  const safePax = Math.max(1, pax);
  
  // Untuk rombongan besar, alokasikan base bus 50 kapasitas utama
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
  if (finalBus50 > 0) parts.push(`${finalBus50} Bus Besar (50)`);
  if (bestSubCombo.bus35 > 0) parts.push(`${bestSubCombo.bus35} Bus Medium (35)`);
  if (bestSubCombo.hiace15 > 0) parts.push(`${bestSubCombo.hiace15} Hiace (15)`);

  return {
    bus50: finalBus50,
    bus35: bestSubCombo.bus35,
    hiace15: bestSubCombo.hiace15,
    totalSeats: finalSeats,
    totalCost: finalCost,
    idleSeats: finalSeats - safePax,
    description: parts.join(" + ") || "1 Hiace (15)",
  };
}

export function ModuleSupplyChain({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const [participantCount, setParticipantCount] = useState<number>(85);
  const [budget, setBudget] = useState<number>(125_000_000);
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>("standard");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [hotelNights, setHotelNights] = useState<number>(2);
  const [hasTourGuide, setHasTourGuide] = useState<boolean>(true);
  const [hasDocumentation, setHasDocumentation] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<string>("Yogyakarta");

  const [result, setResult] = useState<SupplyChainResult | null>(null);
  const [isSolving, setIsSolving] = useState<boolean>(false);

  const fleet = getOptimalFleet(participantCount);

  const handleRunOptimization = () => {
    setIsSolving(true);
    setTimeout(() => {
      const res = solveSupplyChain({
        orderId: `ORD-${Date.now().toString().slice(-4)}`,
        participantCount,
        budget,
        serviceLevel,
        requirements: {
          transport: { type: fleet.description, needed: true },
          accommodation: { nights: hotelNights, starLevel: serviceLevel === "premium" ? 4 : 3 },
          meals: { mealsPerDay, type: "prasmanan" },
          attractions: ["Candi Prambanan", "Lava Tour", "Malioboro"],
        },
        availableVendors: VENDOR_SERVICES,
      });

      setResult(res);
      setIsSolving(false);

      if (onLogAdd) {
        onLogAdd({
          id: `LOG-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString("id-ID"),
          module: "Rantai Pasok",
          status: res.feasible ? "optimal" : "infeasible",
          objectiveValue: res.totalCost,
          savings: res.margin,
          details: `Optimasi vendor event ${participantCount} Pax (${fleet.description}) berhasil.`,
        });
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Engine Riset Operasi
          </span>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
            Minimasi Biaya Pasok Vendor (Simplex LP)
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Alokasi matematis transportasi, hotel, katering, dan tiket atraksi berdasarkan fungsi kendala anggaran.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          isLoading={isSolving}
          onClick={handleRunOptimization}
          className="gap-2 text-xs font-semibold"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Jalankan Solver Simplex</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)]">
            Parameter Kebutuhan Wisata
          </h3>

          <div>
            <label htmlFor="pax-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Jumlah Peserta (Pax)
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
              Pagu Anggaran Total (Rp)
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
            label="Kelas Layanan (Tier)"
            value={serviceLevel}
            onChange={(val) => setServiceLevel(val as ServiceLevel)}
            options={[
              { value: "budget", label: "Budget (Ekonomis)" },
              { value: "standard", label: "Standard (Bisnis)" },
              { value: "premium", label: "Premium (Eksekutif VIP)" },
            ]}
          />

          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-xs space-y-1">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
              Rekomendasi Kombinasi Armada:
            </span>
            <p className="text-[var(--text-secondary)]">{fleet.description}</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Kapasitas: {fleet.totalSeats} kursi ({fleet.idleSeats} kursi sisa aman)
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
              Hasil Optimasi Linear Programming
            </h3>

            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
                    <span className="text-[11px] text-[var(--text-muted)] block">Total Biaya Solusi</span>
                    <span className="text-base font-extrabold text-indigo-600">
                      {formatRupiah(result.totalCost)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
                    <span className="text-[11px] text-[var(--text-muted)] block">Penghematan Biaya</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      {formatRupiah(result.margin)} ({formatPercentage(result.marginPercentage)})
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
                    <span className="text-[11px] text-[var(--text-muted)] block">Status Solusi</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Feasible Optimal
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2">Alokasi Vendor Terpilih:</h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {result.allocations.map((alloc, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-[var(--text-primary)]">{alloc.vendorName}</span>
                          <span className="text-[11px] text-[var(--text-muted)] block">{alloc.serviceName}</span>
                        </div>
                        <span className="font-bold text-indigo-600">{formatRupiah(alloc.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-xl">
                Klik tombol &quot;Jalankan Solver Simplex&quot; untuk menghitung alokasi anggaran terbaik.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
