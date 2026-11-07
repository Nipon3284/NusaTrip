"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Star, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

export interface PackagePerformance {
  id: string;
  name: string;
  category: string;
  categoryBadge: BadgeVariant;
  eventDate: string;
  rating: string;
  optimizationScheme: string;
  pricePerPax: string;
  totalPax: number;
  totalRevenue: string;
  costSavings: string;
  optimizationScore: number;
}

const SAMPLE_PERFORMANCES: PackagePerformance[] = [
  {
    id: "PKG-01",
    name: "Sunset Phinisi Labuan Bajo",
    category: "Bahari",
    categoryBadge: "cyan",
    eventDate: "24 Okt 2024",
    rating: "4.9/5",
    optimizationScheme: "Konsolidasi Kuota",
    pricePerPax: "Rp 3.850.000",
    totalPax: 48,
    totalRevenue: "Rp 184.800.000",
    costSavings: "Rp 24.500.000",
    optimizationScore: 94,
  },
  {
    id: "PKG-02",
    name: "Bromo Midnight Overland",
    category: "Adventure",
    categoryBadge: "rose",
    eventDate: "27 Okt 2024",
    rating: "4.8/5",
    optimizationScheme: "LP Simplex Pasok",
    pricePerPax: "Rp 1.450.000",
    totalPax: 120,
    totalRevenue: "Rp 174.000.000",
    costSavings: "Rp 31.200.000",
    optimizationScore: 88,
  },
  {
    id: "PKG-03",
    name: "Raja Ampat Island Hopping",
    category: "Bahari",
    categoryBadge: "cyan",
    eventDate: "02 Nov 2024",
    rating: "5.0/5",
    optimizationScheme: "Konsolidasi Kuota",
    pricePerPax: "Rp 7.900.000",
    totalPax: 36,
    totalRevenue: "Rp 284.400.000",
    costSavings: "Rp 42.000.000",
    optimizationScore: 96,
  },
  {
    id: "PKG-04",
    name: "Borobudur Heritage VIP Gala",
    category: "Budaya",
    categoryBadge: "purple",
    eventDate: "05 Nov 2024",
    rating: "4.9/5",
    optimizationScheme: "Hungarian Penugasan",
    pricePerPax: "Rp 2.800.000",
    totalPax: 180,
    totalRevenue: "Rp 504.000.000",
    costSavings: "Rp 58.400.000",
    optimizationScore: 91,
  },
  {
    id: "PKG-05",
    name: "Nusa Penida Coastal Escape",
    category: "Adventure",
    categoryBadge: "rose",
    eventDate: "10 Nov 2024",
    rating: "4.7/5",
    optimizationScheme: "Diet LP Katering",
    pricePerPax: "Rp 1.200.000",
    totalPax: 95,
    totalRevenue: "Rp 114.000.000",
    costSavings: "Rp 12.800.000",
    optimizationScore: 78,
  },
  {
    id: "PKG-06",
    name: "Yogyakarta Tech Summit Retreat",
    category: "Corporate",
    categoryBadge: "indigo",
    eventDate: "15 Nov 2024",
    rating: "4.9/5",
    optimizationScheme: "Knapsack Peak Season",
    pricePerPax: "Rp 4.250.000",
    totalPax: 220,
    totalRevenue: "Rp 935.000.000",
    costSavings: "Rp 112.500.000",
    optimizationScore: 92,
  },
  {
    id: "PKG-07",
    name: "Toraja Highland Expedition",
    category: "Budaya",
    categoryBadge: "purple",
    eventDate: "20 Nov 2024",
    rating: "4.8/5",
    optimizationScheme: "Konsolidasi Kuota",
    pricePerPax: "Rp 3.400.000",
    totalPax: 42,
    totalRevenue: "Rp 142.800.000",
    costSavings: "Rp 18.200.000",
    optimizationScore: 82,
  },
];

export function PerformanceTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredItems = SAMPLE_PERFORMANCES.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.optimizationScheme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
            Performa Paket & Status Optimasi Event
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Daftar event aktif pariwisata teroptimasi dengan metrik efisiensi dan alokasi kuota
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari paket, destinasi, atau skema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-3.5 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64 transition-all"
            />
          </div>

          {/* Filter Dropdown Pill */}
          <button
            type="button"
            onClick={() => {
              const categories = ["All", "Bahari", "Adventure", "Budaya", "Corporate"];
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
              <th className="py-3.5 px-3">Nama Paket Wisata</th>
              <th className="py-3.5 px-3">Kategori</th>
              <th className="py-3.5 px-3">Jadwal Event</th>
              <th className="py-3.5 px-3">Rating</th>
              <th className="py-3.5 px-3">Skema Optimasi LP</th>
              <th className="py-3.5 px-3 text-right">Tarif / Pax</th>
              <th className="py-3.5 px-3 text-right">Peserta</th>
              <th className="py-3.5 px-3 text-right">Efisiensi Hemat</th>
              <th className="py-3.5 px-3 text-center">Skor Feasibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[var(--text-muted)]">
                  Tidak ada paket yang sesuai dengan pencarian Anda.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-default"
                >
                  <td className="py-3.5 px-3 font-medium text-[var(--text-primary)]">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge variant={item.categoryBadge} size="sm">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--text-muted)]">
                    {item.eventDate}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1 font-medium text-[var(--text-secondary)]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge variant="indigo" size="sm">
                      {item.optimizationScheme}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-[var(--text-secondary)]">
                    {item.pricePerPax}
                  </td>
                  <td className="py-3.5 px-3 text-right text-[var(--text-secondary)] font-medium">
                    {item.totalPax.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.costSavings}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                        item.optimizationScore >= 90
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : item.optimizationScore >= 80
                          ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {item.optimizationScore}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
