"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, ArrowUpRight, CheckCircle2, Receipt, AlertTriangle } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { useLeads } from "@/lib/data/tour-store";

export interface EventPerformanceItem {
  id: string;
  name: string;
  client: string;
  category: string;
  categoryBadge: BadgeVariant;
  eventDate: string;
  totalPax: number;
  contractRevenue: number;
  vendorCostLP: number;
  fieldExpenses: number;
  netProfit: number;
  optimizationScheme: string;
  optimizationScore: number;
  statusText: string;
}

const STATIC_PERFORMANCES: EventPerformanceItem[] = [
  {
    id: "EVT-2401",
    name: "Sunset Phinisi Labuan Bajo Luxury",
    client: "Alumni Akabri 95",
    category: "Bahari",
    categoryBadge: "cyan",
    eventDate: "24 Okt 2026",
    totalPax: 48,
    contractRevenue: 184800000,
    vendorCostLP: 142300000,
    fieldExpenses: 2850000,
    netProfit: 39650000,
    optimizationScheme: "Konsolidasi Kuota",
    optimizationScore: 94,
    statusText: "Selesai",
  },
  {
    id: "EVT-2402",
    name: "Bromo Midnight Overland Expedition",
    client: "Komunitas Fotografi Jakarta",
    category: "Adventure",
    categoryBadge: "rose",
    eventDate: "27 Okt 2026",
    totalPax: 120,
    contractRevenue: 174000000,
    vendorCostLP: 138500000,
    fieldExpenses: 4300000,
    netProfit: 31200000,
    optimizationScheme: "LP Simplex Pasok",
    optimizationScore: 88,
    statusText: "Selesai",
  },
  {
    id: "EVT-2403",
    name: "Borobudur Heritage VIP Gala & Retret",
    client: "PT Bank Mandiri Region 7",
    category: "Budaya",
    categoryBadge: "purple",
    eventDate: "05 Nov 2026",
    totalPax: 180,
    contractRevenue: 504000000,
    vendorCostLP: 432600000,
    fieldExpenses: 12900000,
    netProfit: 58500000,
    optimizationScheme: "Hungarian Penugasan",
    optimizationScore: 91,
    statusText: "Selesai",
  },
  {
    id: "EVT-2404",
    name: "Yogyakarta Tech Summit Retreat",
    client: "Asosiasi FinTech Indonesia",
    category: "Corporate",
    categoryBadge: "indigo",
    eventDate: "15 Nov 2026",
    totalPax: 220,
    contractRevenue: 935000000,
    vendorCostLP: 812000000,
    fieldExpenses: 10500000,
    netProfit: 112500000,
    optimizationScheme: "Knapsack Peak Season",
    optimizationScore: 92,
    statusText: "Selesai",
  },
];

function formatRupiah(num: number): string {
  return "Rp " + num.toLocaleString("id-ID");
}

export function PerformanceTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const leads = useLeads();

  // Map dynamic leads that have approved deals or final status into performance items
  const dynamicLeadEvents: EventPerformanceItem[] = leads
    .filter((l) => l.isDealApproved || l.status === "final_h7" || l.status === "proses_dss" || l.status === "selesai")
    .map((l) => {
      const revenue = l.customerBid || l.budget || 50000000;
      const vendorCost = l.bottomLineCost || Math.round(revenue * 0.75);
      const incidentalTotal = (l.fieldExpenses || []).reduce((acc, curr) => acc + curr.amount, 0);
      const net = revenue - vendorCost - incidentalTotal;

      let badge: BadgeVariant = "indigo";
      if (l.category.toLowerCase().includes("gathering")) badge = "indigo";
      else if (l.category.toLowerCase().includes("study")) badge = "purple";
      else if (l.category.toLowerCase().includes("family")) badge = "emerald";

      return {
        id: l.id,
        name: l.destination + " - " + l.category,
        client: l.institution ? `${l.name} (${l.institution})` : l.name,
        category: l.category.split(" ")[0] || "Umum",
        categoryBadge: badge,
        eventDate: l.departureDate || "Segera",
        totalPax: l.pax,
        contractRevenue: revenue,
        vendorCostLP: vendorCost,
        fieldExpenses: incidentalTotal,
        netProfit: net,
        optimizationScheme: l.status === "final_h7" ? "DSS H-7 Locked" : "Simplex Multi-Vendor",
        optimizationScore: l.status === "final_h7" ? 97 : 89,
        statusText: l.status === "final_h7" ? "H-7 Aktif" : l.status.toUpperCase(),
      };
    });

  const allItems = [...dynamicLeadEvents, ...STATIC_PERFORMANCES];

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.optimizationScheme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
              Tabel Kinerja Event Aktif & Real-Time P&L
            </h2>
            <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Live Margin Tracking
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Laporan finansial menyeluruh: Nilai Kontrak, Biaya Modal LP, Nota Insidental WhatsApp, dan Margin Bersih Aktual
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari event, klien, atau skema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3.5 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64 transition-all"
            />
          </div>

          {/* Filter Dropdown Pill */}
          <button
            type="button"
            onClick={() => {
              const categories = ["All", "Corporate", "Study", "Bahari", "Budaya", "Adventure"];
              const nextIndex =
                (categories.indexOf(selectedCategory) + 1) % categories.length;
              setSelectedCategory(categories[nextIndex]);
            }}
            className="h-9 px-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>{selectedCategory === "All" ? "Filter Kategori" : selectedCategory}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <th className="py-3.5 px-3">Nama Event & Pemesan</th>
              <th className="py-3.5 px-3">Jadwal & Pax</th>
              <th className="py-3.5 px-3 text-right">Nilai Kontrak (Revenue)</th>
              <th className="py-3.5 px-3 text-right">Biaya Modal Vendor (LP)</th>
              <th className="py-3.5 px-3 text-right">Pengeluaran Insidental (Nota WA)</th>
              <th className="py-3.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-300">Margin Bersih Aktual</th>
              <th className="py-3.5 px-3 text-center">Status / Skor Feasibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                  Tidak ada event aktif yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const marginPercent = Math.round((item.netProfit / item.contractRevenue) * 100);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-default"
                  >
                    <td className="py-3.5 px-3 font-medium text-[var(--text-primary)]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            {item.id}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{item.client}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[var(--text-muted)]">
                      <div className="flex flex-col">
                        <span className="font-medium text-[var(--text-secondary)]">{item.eventDate}</span>
                        <span className="text-[11px] text-[var(--text-subtle)]">{item.totalPax} Peserta</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-[var(--text-primary)]">
                      {formatRupiah(item.contractRevenue)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-[var(--text-secondary)]">
                      {formatRupiah(item.vendorCostLP)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {item.fieldExpenses > 0 ? (
                        <div className="flex items-center justify-end gap-1 font-medium text-amber-600 dark:text-amber-400">
                          <Receipt className="w-3 h-3" />
                          <span>{formatRupiah(item.fieldExpenses)}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-subtle)]">Rp 0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(item.netProfit)}
                        </span>
                        <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-medium">
                          ({marginPercent}% Margin)
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full ${
                            item.optimizationScore >= 90
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                              : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {item.optimizationScore}%
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                          {item.statusText}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}