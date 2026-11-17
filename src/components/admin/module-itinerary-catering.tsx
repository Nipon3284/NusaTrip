"use client";

import React, { useState } from "react";
import {
  Compass,
  UtensilsCrossed,
  Play,
  CheckCircle2,
  Star,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { solveItinerary, solveCatering } from "@/lib/optimizer/solver";
import {
  ATTRACTIONS,
  CATERING_ITEMS,
  formatRupiah,
} from "@/lib/optimizer/seed-data";
import type {
  ItineraryResult,
  CateringResult,
} from "@/lib/optimizer/types";

export function ModuleItineraryCatering({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const [subTab, setSubTab] = useState<"itinerary" | "catering">("itinerary");

  // Itinerary Knapsack State
  const [days, setDays] = useState<number>(3);
  const [budgetPerPerson, setBudgetPerPerson] = useState<number>(200_000);
  const [participantCount, setParticipantCount] = useState<number>(50);
  const [maxHours, setMaxHours] = useState<number>(8);
  const [isSolvingItinerary, setIsSolvingItinerary] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<ItineraryResult | null>(null);

  // Catering Diet Problem State
  const [budgetPerPortion, setBudgetPerPortion] = useState<number>(25_000);
  const [cateringPax, setCateringPax] = useState<number>(80);
  const [isSolvingCatering, setIsSolvingCatering] = useState(false);
  const [cateringResult, setCateringResult] = useState<CateringResult | null>(null);

  // Solve Itinerary
  const handleSolveItinerary = () => {
    setIsSolvingItinerary(true);
    setTimeout(() => {
      const solverOutput = solveItinerary({
        days,
        budgetPerPerson,
        participantCount,
        locationArea: "Yogyakarta",
        availableAttractions: ATTRACTIONS,
        maxHoursPerDay: maxHours,
      });

      setItineraryResult(solverOutput);
      setIsSolvingItinerary(false);

      if (onLogAdd) {
        onLogAdd({
          id: `log-${Date.now()}`,
          orderId: "ITINERARY-KNAPSACK",
          type: "itinerary",
          input: { days, budgetPerPerson, maxHours },
          result: {
            totalCost: solverOutput.totalCost,
            rating: solverOutput.overallRating,
            budgetRemaining: solverOutput.budgetRemaining,
          },
          feasible: solverOutput.feasible,
          totalOptimizedCost: solverOutput.totalCost,
          marginAchieved: solverOutput.budgetRemaining * participantCount,
          solverTimeMs: solverOutput.solverTimeMs,
          createdAt: new Date().toLocaleTimeString("id-ID"),
          createdBy: "Admin Operasional",
        });
      }
    }, 400);
  };

  // Solve Catering
  const handleSolveCatering = () => {
    setIsSolvingCatering(true);
    setTimeout(() => {
      const solverOutput = solveCatering({
        budgetPerPortion,
        participantCount: cateringPax,
        minimumCategories: ["protein", "vegetable", "carb", "fruit", "drink"],
        availableMenuItems: CATERING_ITEMS,
      });

      setCateringResult(solverOutput);
      setIsSolvingCatering(false);

      if (onLogAdd) {
        onLogAdd({
          id: `log-${Date.now()}`,
          orderId: "CATERING-DIET-PROBLEM",
          type: "catering",
          input: { budgetPerPortion, participantCount: cateringPax },
          result: {
            costPerPortion: solverOutput.costPerPortion,
            budgetRemaining: solverOutput.budgetRemaining,
            rating: solverOutput.averageRating,
          },
          feasible: solverOutput.feasible,
          totalOptimizedCost: solverOutput.totalCost,
          marginAchieved: solverOutput.budgetRemaining * cateringPax,
          solverTimeMs: solverOutput.solverTimeMs,
          createdAt: new Date().toLocaleTimeString("id-ID"),
          createdBy: "Admin Operasional",
        });
      }
    }, 400);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Compass className="w-4 h-4" />
            <span>Knapsack & Diet Problem</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Itinerary & Katering Berbatas Biaya
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl">
            Maksimalkan kepuasan atraksi wisata dan menu gizi katering di bawah batas pagu klien.
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setSubTab("itinerary")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subTab === "itinerary"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Itinerary Wisata (Knapsack)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("catering")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subTab === "catering"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu Katering (Diet Problem)</span>
          </button>
        </div>
      </div>

      {/* ── Sub-tab 1: Itinerary Generator ── */}
      {subTab === "itinerary" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader
              title="Batasan Budget & Durasi Wisata"
              subtitle="Formulasi Knapsack berdasar preferensi klien"
            />

            <div className="flex flex-col gap-4 mt-4">
              {/* Plafon budget per person */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-[var(--text-secondary)]">Plafon Tiket Per Orang</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-xs">
                    {formatRupiah(budgetPerPerson)}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="300000"
                  step="25000"
                  value={budgetPerPerson}
                  onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
                  className="w-full accent-[var(--brand-primary)] cursor-pointer"
                />
              </div>

              {/* Days duration */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-[var(--text-secondary)]">Durasi Hari Tur</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-xs">
                    {days} Hari
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-[var(--brand-primary)] cursor-pointer"
                />
              </div>

              {/* Max hours per day */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-[var(--text-secondary)]">Batas Waktu Per Hari</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-xs">
                    {maxHours} Jam Operasional
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="1"
                  value={maxHours}
                  onChange={(e) => setMaxHours(Number(e.target.value))}
                  className="w-full accent-[var(--brand-primary)] cursor-pointer"
                />
              </div>

              <Button
                variant="primary"
                isLoading={isSolvingItinerary}
                onClick={handleSolveItinerary}
                className="w-full mt-2"
                leftIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Generate Itinerary Optimal
              </Button>
            </div>
          </Card>

          {/* Generated Schedule View */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Rencana Perjalanan (Itinerary) Hasil Optimasi LP"
              subtitle="Memaksimalkan rating kepuasan wisatawan di bawah plafon tiket dan jam logis"
              action={
                itineraryResult && (
                  <Badge variant="brand" icon={<Star className="w-3 h-3 fill-amber-400 text-amber-400" />}>
                    Rating {itineraryResult.overallRating} / 5.0
                  </Badge>
                )
              }
            />

            {itineraryResult ? (
              <div className="flex flex-col gap-4 mt-4">
                {/* Summary Banner */}
                <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--text-muted)]">Realisasi Tiket: </span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formatRupiah(itineraryResult.totalCostPerPerson)} / orang
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Sisa Budget Terjaga: </span>
                    <span className="font-bold text-[var(--status-success-text)]">
                      +{formatRupiah(itineraryResult.budgetRemaining)} / orang
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Schedule */}
                <div className="space-y-4">
                  {itineraryResult.dailySchedule.map((dayPlan) => (
                    <div
                      key={dayPlan.day}
                      className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]"
                    >
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-subtle)]">
                        <span className="font-bold text-xs text-[var(--brand-primary-text)] uppercase tracking-wider">
                          Hari ke-{dayPlan.day}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>{dayPlan.totalHours} Jam Kegiatan</span>
                          <span className="font-semibold text-[var(--text-primary)]">
                            Tiket: {formatRupiah(dayPlan.totalTicketCost)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {dayPlan.attractions.map((attr, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[var(--surface-subtle)] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-card)] border border-[var(--border-subtle)] font-bold text-[var(--text-primary)]">
                                {attr.startTime} - {attr.endTime}
                              </span>
                              <span className="font-semibold text-[var(--text-primary)]">
                                {attr.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-current" />
                                {attr.rating}
                              </span>
                              <span className="text-[var(--text-muted)]">
                                {formatRupiah(attr.ticketPrice)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-xl mt-4">
                Klik <span className="font-semibold text-[var(--text-primary)]">"Generate Itinerary Optimal"</span> untuk menyusun rute wisata berbasis Knapsack Solver.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Sub-tab 2: Catering Diet Problem ── */}
      {subTab === "catering" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader
              title="Diet Problem: Plafon Katering"
              subtitle="Pencarian kombinasi gizi lengkap di bawah budget"
            />

            <div className="flex flex-col gap-4 mt-4">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-[var(--text-secondary)]">Plafon Modal Per Porsi</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-xs">
                    {formatRupiah(budgetPerPortion)}
                  </span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="40000"
                  step="2500"
                  value={budgetPerPortion}
                  onChange={(e) => setBudgetPerPortion(Number(e.target.value))}
                  className="w-full accent-[var(--brand-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                  <span>Rp 15.000</span>
                  <span>Rp 25.000 (Kasus Uji)</span>
                  <span>Rp 40.000</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs">
                <span className="font-semibold text-[var(--text-primary)] block mb-1.5">
                  Syarat Wajib Gizi (Constraints):
                </span>
                <ul className="space-y-1 text-[11px] text-[var(--text-secondary)]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Lauk Utama (Protein Hewani)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sayur Segar</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Karbohidrat (Nasi)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Buah Cuci Mulut</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Minuman Segar</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="primary"
                isLoading={isSolvingCatering}
                onClick={handleSolveCatering}
                className="w-full mt-2"
                leftIcon={<Play className="w-4 h-4 fill-current" />}
              >
                Pecahkan Diet Problem
              </Button>
            </div>
          </Card>

          {/* Catering Solution View */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Komposisi Menu Hasil Optimasi LP Diet Problem"
              subtitle="Kombinasi lauk dari vendor katering terpilih yang memenuhi 100% gizi di bawah plafon"
              action={
                cateringResult && (
                  <Badge variant="brand">
                    {cateringResult.categoriesCovered.length} Unsur Gizi Terpenuhi
                  </Badge>
                )
              }
            />

            {cateringResult ? (
              <div className="flex flex-col gap-4 mt-4">
                <div className="p-4 rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success-subtle)]/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--status-success-text)] font-semibold block">
                      Harga Pokok Modal: {formatRupiah(cateringResult.costPerPortion)} / porsi
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      Total Biaya {cateringPax} Porsi: {formatRupiah(cateringResult.totalCost)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[var(--text-muted)] block">Hemat Keuntungan</span>
                    <span className="text-base font-bold text-[var(--status-success-text)]">
                      +{formatRupiah(cateringResult.budgetRemaining)} / porsi
                    </span>
                  </div>
                </div>

                {/* Selected menu items table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Kategori</th>
                        <th className="py-2.5 px-3">Menu Terpilih</th>
                        <th className="py-2.5 px-3">Vendor Katering</th>
                        <th className="py-2.5 px-3 text-center">Rating</th>
                        <th className="py-2.5 px-3 text-right">Harga Porsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {cateringResult.selectedMenu.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-subtle)]/60">
                          <td className="py-2.5 px-3 capitalize font-semibold text-[var(--brand-primary-text)]">
                            {item.category}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-secondary)]">
                            {item.vendorName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-500">
                            <span className="inline-flex items-center gap-1 justify-center">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{item.rating}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[var(--text-primary)]">
                            {formatRupiah(item.pricePerPortion)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-xl mt-4">
                Klik <span className="font-semibold text-[var(--text-primary)]">"Pecahkan Diet Problem"</span> untuk mencari racikan lauk gizi terlengkap di bawah Rp {formatRupiah(budgetPerPortion)}.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
