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

export function ModuleSupplyChain({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const [participantCount, setParticipantCount] = useState<number>(115);
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel>("standard");
  const [clientBudget, setClientBudget] = useState<number>(55_000_000);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [result, setResult] = useState<SupplyChainResult | null>(null);

  // Run solver on click
  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      const solverOutput = solveSupplyChain({
        orderId: "ORD-SC-LIVE",
        participantCount,
        budget: clientBudget,
        serviceLevel,
        requirements: {
          transport: { type: "bus", needed: true },
          accommodation: { nights: 2, starLevel: 3 },
          meals: { mealsPerDay: 3, type: "prasmanan" },
          attractions: ["Borobudur", "Prambanan"],
        },
        availableVendors: VENDOR_SERVICES,
      });

      setResult(solverOutput);
      setIsSolving(false);

      if (onLogAdd) {
        onLogAdd({
          id: `log-${Date.now()}`,
          orderId: "ORD-SC-LIVE",
          type: "supply_chain",
          input: { participantCount, serviceLevel, clientBudget },
          result: {
            totalCost: solverOutput.totalCost,
            margin: solverOutput.margin,
            marginPercentage: solverOutput.marginPercentage,
          },
          feasible: solverOutput.feasible,
          totalOptimizedCost: solverOutput.totalCost,
          marginAchieved: solverOutput.margin,
          solverTimeMs: solverOutput.solverTimeMs,
          createdAt: new Date().toLocaleTimeString("id-ID"),
          createdBy: "Admin Operasional",
        });
      }
    }, 450);
  };

  // Naive comparison baseline (3 Large buses without LP optimization)
  const naiveBusCost = 3 * 5_500_000; // 3 Bus 50 @ 5.5jt = 16.5jt
  const optimalBusCost = 2 * 5_500_000 + 1_200_000; // 2 Bus 50 + 1 Hiace @ 1.2jt = 12.2jt
  const transportSavings = naiveBusCost - optimalBusCost;

  return (
    <div className="flex flex-col gap-6">
      {/* Module Title Banner */}
      <div className="bg-[var(--surface-card)] p-6 rounded-2xl border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
            <Layers className="w-4 h-4" />
            <span>Fungsi LP 1: Riset Operasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Optimasi Rantai Pasok Vendor (Minimasi Biaya Pengadaan)
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Menghitung kombinasi sewa bus tanpa pemborosan kursi kosong (idle capacity),
            pemecahan alokasi hotel multi-vendor, dan pembagian tiket bundling termurah.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          isLoading={isSolving}
          onClick={handleSolve}
          leftIcon={<Play className="w-4 h-4 fill-current" />}
        >
          Jalankan Solusi LP
        </Button>
      </div>

      {/* Interactive Controls & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Parameter Pesanan Klien"
            subtitle="Ubah parameter untuk menguji responsivitas DSS"
          />
          <div className="flex flex-col gap-4 mt-4">
            {/* Participant count slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-[var(--text-secondary)]">Jumlah Rombongan</span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-sm">
                  {participantCount} Orang
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="w-full accent-[var(--brand-primary)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                <span>20 pax (Trip Kecil)</span>
                <span>115 pax (Kasus Uji)</span>
                <span>300 pax (Akbar)</span>
              </div>
            </div>

            {/* Service Level Select (Custom ARIA listbox, NO native select) */}
            <div>
              <CustomSelect
                label="Standar Kualitas (Service Level)"
                value={serviceLevel}
                onChange={(val) => setServiceLevel(val as ServiceLevel)}
                options={[
                  {
                    value: "budget",
                    label: "Budget / Ekonomis",
                    description: "Standar Wisma Melati & Bus Standar",
                  },
                  {
                    value: "standard",
                    label: "Standard / Bintang 3",
                    description: "Hotel Grand Keisha & Bus Pariwisata Medium",
                  },
                  {
                    value: "premium",
                    label: "Premium / Eksekutif Bintang 4-5",
                    description: "Hotel Tentrem & Bus Eksekutif SHD",
                  },
                ]}
              />
            </div>

            {/* Client Budget Input */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                Total Nilai Kontrak Klien
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1000000"
                  value={clientBudget}
                  onChange={(e) => setClientBudget(Number(e.target.value))}
                  className="w-full h-10 px-3.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Nilai yang disepakati dengan rombongan (DP 50% = {formatRupiah(clientBudget * 0.5)})
              </p>
            </div>

            <div className="bg-[var(--surface-subtle)] p-3 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] mt-2">
              <span className="font-semibold text-[var(--text-primary)]">Fungsi Kendala (LP Constraints):</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                <li>Total kapasitas vendor &ge; {participantCount} pax</li>
                <li>Tingkat kualitas fasilitas &ge; {serviceLevel.toUpperCase()}</li>
                <li>Total modal pengadaan &le; {formatRupiah(clientBudget)}</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Case Study Highlight: Idle Seat Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Studi Kasus: Pemecahan Armada Bus Tanpa Kursi Kosong (115 Pax)"
            subtitle="Perbandingan sewa manual vs formulasi matematis LP"
            action={
              <Badge variant="brand" icon={<Sparkles className="w-3 h-3" />}>
                Hemat {formatRupiah(transportSavings)}
              </Badge>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Skenario Naif / Tanpa LP */}
            <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Metode Manual Konvensional
                  </span>
                  <Badge variant="danger">Pemborosan 35 Kursi</Badge>
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Menyewa 3 Bus Besar (Kapasitas 150 Kursi)
                </h4>
                <div className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>3 Bus Besar @ Rp 5.500.000:</span>
                    <span className="font-semibold">{formatRupiah(naiveBusCost)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--status-danger-text)]">
                    <span>Kursi Terbuang (Idle):</span>
                    <span className="font-semibold">35 Kursi Kosong</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                Admin biasa memilih 3 bus karena takut kurang, mengorbankan margin perusahaan.
              </div>
            </div>

            {/* Skenario LP Solver */}
            <div className="p-4 rounded-xl border border-[var(--brand-primary)]/40 bg-[var(--brand-primary-subtle)]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary-text)]">
                    Rekomendasi Linear Programming
                  </span>
                  <Badge variant="success">Presisi 100% Fit</Badge>
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Kombinasi 2 Bus Besar + 1 Hiace (115 Kursi)
                </h4>
                <div className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex justify-between">
                    <span>2 Bus Besar @ Rp 5.500.000:</span>
                    <span>Rp 11.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Toyota Hiace @ Rp 1.200.000:</span>
                    <span>Rp 1.200.000</span>
                  </div>
                  <div className="flex justify-between font-bold text-[var(--brand-primary-text)] pt-1 border-t border-[var(--brand-primary)]/20">
                    <span>Total Biaya Armada:</span>
                    <span>{formatRupiah(optimalBusCost)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--brand-primary)]/20 flex items-center justify-between text-xs font-semibold text-[var(--status-success-text)]">
                <span>Penghematan Bersih ke Kas:</span>
                <span className="text-sm font-bold">{formatRupiah(transportSavings)}</span>
              </div>
            </div>
          </div>

          {/* Solver Result Banner */}
          {result ? (
            <div className="mt-6 p-4 rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success-subtle)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--status-success)] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--status-success-text)]">
                    Solusi Optimal Ditemukan ({result.solverTimeMs} ms)
                  </div>
                  <div className="text-base font-bold text-[var(--text-primary)]">
                    Biaya Riil Pengadaan: {formatRupiah(result.totalCost)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-[var(--text-muted)]">Margin Keuntungan Bersih</div>
                  <div className="text-lg font-bold text-[var(--status-success-text)]">
                    {formatRupiah(result.margin)} ({formatPercentage(result.marginPercentage)})
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-xl border border-dashed border-[var(--border-default)] text-center text-xs text-[var(--text-muted)]">
              Tekan tombol <span className="font-semibold text-[var(--text-primary)]">"Jalankan Solusi LP"</span> di atas untuk mengeksekusi perhitungan rantai pasok multi-vendor secara lengkap.
            </div>
          )}
        </Card>
      </div>

      {/* Vendor Allocation Table (Real Result) */}
      {result && (
        <Card padding="none">
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Alokasi Pengadaan Vendor Terpilih oleh LP
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Alokasi riil di lapangan tanpa membocorkan nama vendor ke klien di tahap awal
              </p>
            </div>
            <Badge variant="brand">
              {result.allocations.length} Vendor Terkunci
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Nama Vendor Riil</th>
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4 text-center">Alokasi Pax</th>
                  <th className="py-3 px-4 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {result.allocations.map((alloc, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[var(--surface-subtle)]/60 transition-colors"
                  >
                    <td className="py-3 px-4 capitalize font-medium text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1.5">
                        {alloc.category === "transport" && <Bus className="w-3.5 h-3.5 text-blue-500" />}
                        {alloc.category === "accommodation" && <Hotel className="w-3.5 h-3.5 text-amber-500" />}
                        {alloc.category === "restaurant" && <Utensils className="w-3.5 h-3.5 text-emerald-500" />}
                        {alloc.category === "attraction" && <Ticket className="w-3.5 h-3.5 text-purple-500" />}
                        {alloc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {alloc.vendorName}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {alloc.serviceName}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[var(--text-primary)]">
                      {alloc.allocatedQuantity}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)]">
                      {formatRupiah(alloc.unitCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)]">
                      {formatRupiah(alloc.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success">Utama</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Backup Vendor Options for Resiliency */}
          {result.backupAllocations.length > 0 && (
            <div className="p-4 bg-[var(--surface-subtle)] border-t border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">
                Mitra Cadangan Terverifikasi (Siap Siaga jika Terjadi Lonjakan Harga H-3):
              </span>
              <div className="flex flex-wrap gap-2">
                {result.backupAllocations.map((backup, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs bg-[var(--surface-card)] border border-[var(--border-default)] text-[var(--text-secondary)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{backup.vendorName} ({backup.serviceName}) - {formatRupiah(backup.unitCost)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
