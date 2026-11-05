"use client";

import React from "react";
import {
  TrendingUp,
  Layers,
  Merge,
  PieChart,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Bus,
  Cpu,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatPercentage } from "@/lib/optimizer/seed-data";
import type { AdminTab } from "./admin-sidebar";

export function ModuleOverview({
  onSelectTab,
}: {
  onSelectTab: (tab: AdminTab) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Lead Banner with Brand Context */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--surface-card)] via-[var(--surface-subtle)] to-[var(--surface-card)] border border-[var(--brand-primary)]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
            <Cpu className="w-4 h-4" />
            <span>Pusat Kendali Agregator Pariwisata & Acara</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1 tracking-tight">
            NusaTrip DSS Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl leading-relaxed">
            Platform agregator tanpa kepemilikan aset fisik. Seluruh keuntungan bersih didapat dari
            <span className="font-semibold text-[var(--text-primary)]"> Margin Optimasi Riset Operasi (Linear Programming)</span> yang
            menekan modal sewa vendor dan membagi kuota peserta secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => onSelectTab("supply-chain")}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Buka Solver Rantai Pasok
          </Button>
        </div>
      </div>

      {/* KPI Grid with 1 Lead Focal Stat + Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LEAD STAT (1 thing leads) */}
        <StatCard
          isLead={true}
          label="Total Laba Teroptimasi LP"
          value="Rp 124.700.000"
          subValue="dari 18 event aktif bulan ini"
          delta={{ value: "+34.2% vs manual", trend: "up" }}
          icon={<Sparkles className="w-5 h-5 text-white" />}
          className="lg:col-span-2"
        />

        <StatCard
          label="Efisiensi Kursi Armada"
          value="98.4%"
          subValue="hanya 1.6% idle capacity"
          delta={{ value: "+18.5%", trend: "up" }}
          icon={<Bus className="w-4 h-4 text-blue-500" />}
        />

        <StatCard
          label="Rata-rata Waktu Solver"
          value="18 ms"
          subValue="Simplex & Knapsack live"
          delta={{ value: "Ultra Fast", trend: "neutral" }}
          icon={<Clock className="w-4 h-4 text-emerald-500" />}
        />
      </div>

      {/* The 5 LP Decision Pillars (Visual Hub) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              5 Dapur Pacu Riset Operasi (Operations Research Engine)
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Pilih pilar optimasi matematis untuk menjalankan simulasi langsung di lapangan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div
            onClick={() => onSelectTab("supply-chain")}
            className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--brand-primary)]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                  <Layers className="w-5 h-5" />
                </div>
                <Badge variant="brand">Fungsi 1</Badge>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Optimasi Rantai Pasok Vendor
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Menghilangkan kursi kosong armada bus (kasus 115 pax: 2 Bus + 1 Hiace vs 3 Bus),
                alokasi multi-kamar hotel, dan pemilihan tiket bundling vs reguler.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--brand-primary-text)]">
              <span>Buka Modul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => onSelectTab("consolidation")}
            className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--brand-accent)]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-[var(--brand-accent-subtle)] text-[var(--brand-accent)]">
                  <Merge className="w-5 h-5" />
                </div>
                <Badge variant="warning">Fungsi 2</Badge>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Konsolidasi Lintas-Event
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Mengejar diskon volume hingga 40% dengan menggabungkan pesanan makan siang
                4 rombongan kecil berbeda di Yogyakarta pada hari yang sama.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--brand-accent)]">
              <span>Buka Modul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => onSelectTab("portfolio")}
            className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <PieChart className="w-5 h-5" />
                </div>
                <Badge variant="neutral">Fungsi 3</Badge>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Seleksi Portofolio Peak Season
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                0-1 Knapsack solver untuk memilih pesanan study tour mana yang harus diterima vs ditolak/reschedule
                berdasar batasan modal DP dan tim admin operasional.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span>Buka Modul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 4 */}
          <div
            onClick={() => onSelectTab("assignment")}
            className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <Badge variant="success">Fungsi 4</Badge>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Penugasan SDM Berbasis Spesifikasi
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Assignment Problem mencocokkan tour guide berbahasa asing & fotografer bersertifikasi drone
                dengan total honor terendah tanpa menyewa guide premium untuk event lokal biasa.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Buka Modul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 5 */}
          <div
            onClick={() => onSelectTab("itinerary-catering")}
            className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between lg:col-span-2"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                  <Compass className="w-5 h-5" />
                </div>
                <Badge variant="brand">Fungsi 5</Badge>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Generator Itinerary (Knapsack) & Menu Katering (Diet Problem)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Meracik jadwal wisata jam demi jam yang memaksimalkan rating dengan plafon tiket ketat,
                serta menyusun kombinasi lauk gizi daging+sayur+buah di bawah Rp 25.000/porsi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span>Buka Modul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Event Orders Pipeline */}
      <Card padding="none">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Antrean Pesanan Menunggu Eksekusi LP Solver
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Status pesanan sebelum dikunci ke vendor riil di lapangan
            </p>
          </div>
          <Badge variant="brand">4 Pesanan Siap Optimasi</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Instansi / Rombongan</th>
                <th className="py-3 px-4">Destinasi & Pax</th>
                <th className="py-3 px-4">Service Level</th>
                <th className="py-3 px-4 text-right">Nilai Kontrak Klien</th>
                <th className="py-3 px-4 text-center">Rekomendasi LP</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              <tr className="hover:bg-[var(--surface-subtle)]/60">
                <td className="py-3.5 px-4 font-mono font-bold">ORD-2024-001</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-[var(--text-primary)] block">
                    SMA Negeri 3 Semarang
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Study Tour 3 Hari</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-medium">Yogyakarta (120 Pax)</span>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant="neutral">Bintang 3 Standard</Badge>
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-[var(--text-primary)]">
                  {formatRupiah(72_000_000)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant="success">Diskon 40% Tersedia</Badge>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectTab("supply-chain")}
                  >
                    Optimasi
                  </Button>
                </td>
              </tr>

              <tr className="hover:bg-[var(--surface-subtle)]/60">
                <td className="py-3.5 px-4 font-mono font-bold">ORD-2024-002</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-[var(--text-primary)] block">
                    PT Telkom Indonesia
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Corporate Gathering</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-medium">Sleman (80 Pax)</span>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant="brand">Premium Bintang 5</Badge>
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-[var(--text-primary)]">
                  {formatRupiah(96_000_000)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Badge variant="brand">Margin Tinggi (+29%)</Badge>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectTab("portfolio")}
                  >
                    Review Knapsack
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
