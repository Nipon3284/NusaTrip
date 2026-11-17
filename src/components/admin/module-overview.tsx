"use client";

import React, { useState } from "react";
import {
  MapPin,
  Layers,
  Merge,
  PieChart,
  Users,
  Compass,
  ArrowRight,
  Cpu,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck2,
  Wallet,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { OptimizationDecisionCenter } from "./optimization-decision-center";
import { PerformanceTable } from "./performance-table";
import type { AdminTab } from "./admin-sidebar";
import { useLeads } from "@/lib/data/tour-store";

export function ModuleOverview({
  onSelectTab,
}: {
  onSelectTab: (tab: AdminTab) => void;
}) {
  const leads = useLeads();
  const [selectedH7Order, setSelectedH7Order] = useState<string | null>(null);

  // Find leads in H-7 window or flagged with h7Alert
  const h7Leads = leads.filter(
    (l) => l.h7Alert || l.status === "final_h7" || (l.departureDate && l.departureDate <= "2026-11-27")
  );

  const urgentH7Count = h7Leads.filter((l) => l.status !== "final_h7" && l.status !== "selesai").length;

  const solverShortcuts = [
    {
      id: "mitra-mapping" as AdminTab,
      title: "Peta Mitra GIS",
      sub: "Kelola Zona & Vendor",
      icon: <MapPin className="w-4 h-4 text-cyan-500" />,
      tag: "Live GIS",
    },
    {
      id: "lp-optimizer" as AdminTab,
      title: "Rekomendasi LP",
      sub: "Paket Wisata Ekonomis",
      icon: <Cpu className="w-4 h-4 text-indigo-500" />,
      tag: "Simplex Min Z",
    },
    {
      id: "supply-chain" as AdminTab,
      title: "Rantai Pasok",
      sub: "Minimasi Biaya Vendor",
      icon: <Layers className="w-4 h-4 text-slate-500" />,
      tag: "Simulasi",
    },
    {
      id: "consolidation" as AdminTab,
      title: "Konsolidasi Kuota",
      sub: "Diskon Volume Skala",
      icon: <Merge className="w-4 h-4 text-slate-500" />,
      tag: "Simulasi",
    },
    {
      id: "assignment" as AdminTab,
      title: "Penugasan Kru",
      sub: "Assignment SDM & Aset",
      icon: <Users className="w-4 h-4 text-slate-500" />,
      tag: "Simulasi",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Widget Radar Peringatan H-7 (H-7 Action Alerts) */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-300 dark:border-amber-700/60 p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500 text-white shadow-md flex-shrink-0 animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Radar Operasional H-7 Keberangkatan
                </span>
                {urgentH7Count > 0 ? (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {urgentH7Count} Event Perlu Aksi Cepat
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Protokol H-7 Terkendali
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-1.5">
                Pusat Kendali Eksekusi H-7: Penguncian Vendor, SPK Kru & Uang Jalan
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
                Event yang memasuki jendela H-7 wajib menyelesaikan 3 parameter kritis: Kunci identitas vendor mitra, terbitkan Surat Perintah Kerja (SPK) 4 kru lapangan tersertifikasi, dan transfer kas kecil (Petty Cash H-2).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
            <button
              type="button"
              onClick={() => onSelectTab("mitra-mapping")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Buka Peta Mitra (GIS)</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("lp-optimizer")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-4 h-4" />
              <span>Rekomendasi Paket LP</span>
            </button>
          </div>
        </div>

        {/* Highlighted H-7 Event Cards */}
        {h7Leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-800/40">
            {h7Leads.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-2xs flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[var(--text-muted)] font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-page)] border border-[var(--border-subtle)]">
                      {item.id}
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      Jadwal: {item.departureDate || "Segera"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-[var(--text-primary)] truncate">
                    {item.institution || item.name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {item.destination} - {item.pax} Peserta ({item.days} Hari)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-[var(--border-subtle)] text-[10px]">
                  <div className="flex flex-col items-center text-center p-1 rounded bg-[var(--surface-page)]">
                    <span className="text-[var(--text-subtle)]">Mitra</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.allocatedVendors ? "Terkunci" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center p-1 rounded bg-[var(--surface-page)]">
                    <span className="text-[var(--text-subtle)]">SPK Kru</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {item.assignedCrew ? "4 Kru Siap" : "Belum"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center p-1 rounded bg-[var(--surface-page)]">
                    <span className="text-[var(--text-subtle)]">Kas H-2</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {item.pettyCashInitial ? "Disalurkan" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-subtle)]">
                    Status: <strong className="text-[var(--text-secondary)]">{item.status.toUpperCase()}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTab("assignment")}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Kelola Dokumen</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <Cpu className="w-3.5 h-3.5" />
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