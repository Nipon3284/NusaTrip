"use client";

import React from "react";
import {
  Layers,
  Merge,
  PieChart,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { OptimizationDecisionCenter } from "./optimization-decision-center";
import { PerformanceTable } from "./performance-table";
import type { AdminTab } from "./admin-sidebar";

export function ModuleOverview({
  onSelectTab,
}: {
  onSelectTab: (tab: AdminTab) => void;
}) {
  const solverShortcuts = [
    {
      id: "supply-chain" as AdminTab,
      title: "Rantai Pasok",
      sub: "Minimasi Biaya Vendor",
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
      tag: "LP Simplex",
    },
    {
      id: "consolidation" as AdminTab,
      title: "Konsolidasi Kuota",
      sub: "Diskon Volume Skala",
      icon: <Merge className="w-4 h-4 text-cyan-500" />,
      tag: "Tiered Volume",
    },
    {
      id: "portfolio" as AdminTab,
      title: "Portofolio Event",
      sub: "Knapsack Peak Season",
      icon: <PieChart className="w-4 h-4 text-purple-500" />,
      tag: "0-1 Knapsack",
    },
    {
      id: "assignment" as AdminTab,
      title: "Penugasan Kru",
      sub: "Assignment SDM & Aset",
      icon: <Users className="w-4 h-4 text-emerald-500" />,
      tag: "Hungarian",
    },
    {
      id: "itinerary-catering" as AdminTab,
      title: "Itinerary & Katering",
      sub: "Kepuasan Maksimal",
      icon: <Compass className="w-4 h-4 text-amber-500" />,
      tag: "Bounded LP",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 4-Up High-Impact DSS Tourism Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Efisiensi Biaya (LP)"
          value="Rp 142.850.000"
          delta={{ value: "+19.4% vs pagu awal", trend: "up" }}
          tooltip="Total penghematan anggaran belanja vendor pariwisata yang berhasil dicapai melalui optimasi matematis."
        />

        <StatCard
          label="Kapasitas Terkonsolidasi"
          value="840 Pax"
          delta={{ value: "+32.5% volume tier", trend: "up" }}
          tooltip="Jumlah peserta rombongan yang berhasil digabungkan rutenya untuk mengamankan diskon skala grosir."
        />

        <StatCard
          label="Proyeksi Margin Peak Season"
          value="Rp 385.400.000"
          delta={{ value: "+18.2% vs target", trend: "up" }}
          tooltip="Estimasi margin keuntungan bersih dari portofolio event terpilih menggunakan algoritma 0-1 Knapsack."
        />

        <StatCard
          label="Utilisasi Kru & Pemandu"
          value="96.2%"
          delta={{ value: "+4.1% kapasitas", trend: "up" }}
          tooltip="Persentase pemandu wisata, fotografer, dan armada yang berhasil dialokasikan optimal tanpa konflik jadwal."
        />
      </div>

      {/* Replaced Obsolete Curve Chart with High-Value DSS Decision Cockpit */}
      <OptimizationDecisionCenter onSelectTab={onSelectTab} />

      {/* Tour & Travel Package Optimization Table */}
      <PerformanceTable />

      {/* Minimalist Operations Research Solver Quick-Launchpad */}
      <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Akses Cepat Modul Optimasi Riset Operasi
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Jalankan simulasi matematis instan untuk tiap lini operasional pariwisata
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>5 Solver Siap</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {solverShortcuts.map((solver) => (
            <button
              key={solver.id}
              type="button"
              onClick={() => onSelectTab(solver.id)}
              className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] hover:border-indigo-200 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all duration-150 group flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 rounded-lg bg-[var(--surface-card)] shadow-2xs border border-[var(--border-subtle)]">
                  {solver.icon}
                </div>
                <span className="text-[10px] font-medium text-[var(--text-subtle)] px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  {solver.tag}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>{solver.title}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-subtle)] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                  {solver.sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
