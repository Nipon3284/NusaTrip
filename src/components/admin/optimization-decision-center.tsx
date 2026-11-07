"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Merge,
  PieChart,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminTab } from "./admin-sidebar";

interface OptimizationDecisionCenterProps {
  onSelectTab: (tab: AdminTab) => void;
}

export function OptimizationDecisionCenter({
  onSelectTab,
}: OptimizationDecisionCenterProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"Mingguan" | "Bulanan">(
    "Mingguan"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Category savings breakdown data
  const costBreakdown = [
    {
      category: "Transportasi Armada (Bus & Hiace)",
      baseline: 280_000_000,
      optimized: 215_000_000,
      savings: 65_000_000,
      percentage: 23.2,
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
    },
    {
      category: "Akomodasi & Hotel Rekanan",
      baseline: 245_000_000,
      optimized: 205_000_000,
      savings: 40_000_000,
      percentage: 16.3,
      color: "bg-cyan-500",
      lightColor: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300",
    },
    {
      category: "Katering Prasmanan & Konsumsi",
      baseline: 116_050_000,
      optimized: 94_000_000,
      savings: 22_050_000,
      percentage: 18.9,
      color: "bg-purple-500",
      lightColor: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
    },
    {
      category: "Tiket Atraksi & Destinasi",
      baseline: 95_800_000,
      optimized: 80_000_000,
      savings: 15_800_000,
      percentage: 16.5,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    },
  ];

  const totalBaseline = costBreakdown.reduce((sum, item) => sum + item.baseline, 0);
  const totalOptimized = costBreakdown.reduce((sum, item) => sum + item.optimized, 0);
  const totalSavings = totalBaseline - totalOptimized;
  const overallEfficiency = ((totalSavings / totalBaseline) * 100).toFixed(1);

  // Status 5 Mesin Solver Riset Operasi
  const solverPipeline = [
    {
      id: "supply-chain" as AdminTab,
      name: "Rantai Pasok (Simplex)",
      status: "Optimal",
      timeMs: 14,
      detail: "12 Vendor terpilih, pagu aman",
      icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
      badge: "indigo" as const,
    },
    {
      id: "consolidation" as AdminTab,
      name: "Konsolidasi Kuota (Tiered LP)",
      status: "Optimal",
      timeMs: 22,
      detail: "Diskon tier 35% tercapai",
      icon: <Merge className="w-3.5 h-3.5 text-cyan-500" />,
      badge: "cyan" as const,
    },
    {
      id: "portfolio" as AdminTab,
      name: "Portofolio Event (Knapsack)",
      status: "Optimal",
      timeMs: 8,
      detail: "8 Paket terpilih (Modal Rp 500jt)",
      icon: <PieChart className="w-3.5 h-3.5 text-purple-500" />,
      badge: "purple" as const,
    },
    {
      id: "assignment" as AdminTab,
      name: "Penugasan Kru (Hungarian)",
      status: "Optimal",
      timeMs: 11,
      detail: "38/40 Kru aktif, 0 bentrok",
      icon: <Users className="w-3.5 h-3.5 text-emerald-500" />,
      badge: "emerald" as const,
    },
    {
      id: "itinerary-catering" as AdminTab,
      name: "Itinerary & Katering (Bounded LP)",
      status: "Optimal",
      timeMs: 16,
      detail: "Skor kepuasan 94.6 / 100",
      icon: <Compass className="w-3.5 h-3.5 text-amber-500" />,
      badge: "indigo" as const,
    },
  ];

  // Rekomendasi Aksi Cepat DSS
  const actionableRecommendations = [
    {
      id: "rec-1",
      title: "Peluang Diskon Tier 3 Bus Eksekutif",
      desc: "Gabungkan PO Haryanto untuk 2 rombongan Yogyakarta & Solo (Total 48 pax) sebelum 12 Nov untuk menghemat Rp 14.500.000.",
      impact: "Hemat Rp 14.500.000",
      targetTab: "consolidation" as AdminTab,
      actionText: "Buka Konsolidasi",
      badgeText: "Prioritas Tinggi",
    },
    {
      id: "rec-2",
      title: "Penugasan Tour Guide Bahasa Mandarin",
      desc: "Event Sunset Phinisi Labuan Bajo (VIP) memerlukan pemandu berlisensi HPI dengan keahlian Mandarin. 2 kandidat optimal tersedia.",
      impact: "Skor Kecocokan 98%",
      targetTab: "assignment" as AdminTab,
      actionText: "Tinjau Kru",
      badgeText: "Konfirmasi Jadwal",
    },
    {
      id: "rec-3",
      title: "Substitusi Paket Menu Prasmanan Resto",
      desc: "Substitusi prasmanan Bromo Tour ke Resto Rawon Nguling menghemat Rp 18.000/pax tanpa menurunkan variasi gizi dan rating rasa.",
      impact: "Hemat Rp 2.160.000",
      targetTab: "itinerary-catering" as AdminTab,
      actionText: "Tinjau Katering",
      badgeText: "Efisiensi Menu",
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main DSS Decision Cockpit Card */}
      <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-7 shadow-[var(--shadow-card)]">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                Pusat Analisis & Efisiensi Solusi Riset Operasi
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Perbandingan komparatif pagu anggaran konvensional terhadap hasil optimasi matematis DSS
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Period Segmented Control */}
            <div className="flex items-center p-1 rounded-xl bg-[var(--surface-page)] border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setSelectedPeriod("Mingguan")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedPeriod === "Mingguan"
                    ? "bg-[var(--surface-card)] text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("Bulanan")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedPeriod === "Bulanan"
                    ? "bg-[var(--surface-card)] text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Bulanan
              </button>
            </div>

            {/* Refresh State Button */}
            <button
              type="button"
              onClick={handleRefresh}
              title="Hitung ulang evaluasi constraint"
              className="p-2 rounded-xl border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Cost Comparison High-Level Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6 border-b border-[var(--border-subtle)]">
          {/* Baseline Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Pagu Anggaran Tradisional
            </span>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Rp {totalBaseline.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-[var(--text-subtle)] mt-0.5 block">
                Total estimasi vendor tanpa integrasi solver
              </span>
            </div>
          </div>

          {/* Optimized Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-cyan-50/30 dark:from-indigo-950/20 dark:to-cyan-950/10 border border-indigo-100 dark:border-indigo-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                Solusi Teroptimasi LP DSS
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Feasible
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-bold text-indigo-900 dark:text-indigo-200">
                Rp {totalOptimized.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 mt-0.5 block">
                Alokasi vendor minimalis matematis
              </span>
            </div>
          </div>

          {/* Net Savings & Efficiency Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100 dark:border-emerald-900/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Net Penghematan Biaya
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3.5 h-3.5" />
                {overallEfficiency}%
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                Rp {totalSavings.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 block">
                Dana operasional terselamatkan
              </span>
            </div>
          </div>
        </div>

        {/* Category-Level Cost Savings Disparity Bars */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Disparitas Penghematan per Kategori Layanan
            </h3>
            <span className="text-xs text-[var(--text-subtle)]">
              Target efisiensi tercapai di semua lini
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {costBreakdown.map((item, idx) => {
              const currentSavedPercent = (
                ((item.baseline - item.optimized) / item.baseline) *
                100
              ).toFixed(1);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] hover:bg-[var(--surface-subtle)]/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[220px] sm:max-w-xs">
                      {item.category}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      -{currentSavedPercent}%
                    </span>
                  </div>

                  {/* Visual Ratio Progress Bar */}
                  <div className="w-full bg-[var(--surface-subtle)] h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{
                        width: `${(item.optimized / item.baseline) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2">
                    <span>
                      Optimal: Rp {(item.optimized / 1_000_000).toFixed(1)} jt
                    </span>
                    <span className="text-[var(--text-subtle)] line-through">
                      Pagu: Rp {(item.baseline / 1_000_000).toFixed(1)} jt
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Hemat Rp {(item.savings / 1_000_000).toFixed(1)} jt
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Section: Solver Pipeline Status & Actionable DSS Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Solver Operational Pipeline Health (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                  Status Pipeline 5 Solver DSS
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Konvergensi algoritma optimasi & batasan matematis
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Semua Konvergen
              </span>
            </div>

            <div className="space-y-3">
              {solverPipeline.map((solver) => (
                <div
                  key={solver.id}
                  onClick={() => onSelectTab(solver.id)}
                  className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-2xs">
                      {solver.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {solver.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate">
                        {solver.detail}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono text-[var(--text-subtle)]">
                      {solver.timeMs}ms
                    </span>
                    <Badge variant={solver.badge} size="sm">
                      {solver.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-subtle)] flex items-center justify-between">
            <span>Standar Solusi: Toleransi ε &lt; 10⁻⁵</span>
            <span>Iterasi Simplex: Selesai</span>
          </div>
        </div>

        {/* Right Column: Actionable Recommendations from Active Solvers (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                Rekomendasi Tindakan DSS Aktif
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Direktif bernilai tertinggi yang disarankan oleh mesin optimasi untuk segera dieksekusi
              </p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              3 Rekomendasi
            </span>
          </div>

          <div className="space-y-3.5">
            {actionableRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                      {rec.title}
                    </h4>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                      {rec.badgeText}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {rec.desc}
                  </p>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                    Dampak: {rec.impact}
                  </div>
                </div>

                <div className="flex-shrink-0 self-end sm:self-center">
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => onSelectTab(rec.targetTab)}
                    className="flex items-center gap-1.5 text-xs whitespace-nowrap shadow-xs"
                  >
                    <span>{rec.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
