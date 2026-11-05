"use client";

import React, { useState } from "react";
import {
  Merge,
  Play,
  TrendingUp,
  Store,
  MapPin,
  Calendar,
  Users,
  Percent,
  CheckCircle2,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { solveConsolidation } from "@/lib/optimizer/solver";
import {
  CONSOLIDATION_EVENTS,
  VENDOR_DISCOUNTS,
  formatRupiah,
  formatPercentage,
} from "@/lib/optimizer/seed-data";
import type { ConsolidationResult } from "@/lib/optimizer/types";

export function ModuleConsolidation({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const [events, setEvents] = useState(CONSOLIDATION_EVENTS);
  const [selectedDate, setSelectedDate] = useState("2024-12-16");
  const [targetVendor] = useState(VENDOR_DISCOUNTS[0]); // RM Bale Raos Keraton
  const [isSolving, setIsSolving] = useState(false);
  const [result, setResult] = useState<ConsolidationResult | null>(null);

  const totalPax = events.reduce((sum, e) => sum + e.participantCount, 0);
  const targetThreshold = targetVendor.thresholds[2]; // min 200 pax for 40% discount
  const progressPercent = Math.min(
    100,
    Math.round((totalPax / targetThreshold.minQuantity) * 100)
  );

  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      const solverOutput = solveConsolidation({
        events,
        vendorDiscounts: VENDOR_DISCOUNTS,
        date: selectedDate,
      });

      setResult(solverOutput);
      setIsSolving(false);

      if (onLogAdd) {
        onLogAdd({
          id: `log-${Date.now()}`,
          orderId: "CROSS-CONSOL-01",
          type: "consolidation",
          input: { eventCount: events.length, totalPax, vendor: targetVendor.vendorName },
          result: {
            totalSavings: solverOutput.totalSavings,
            savingsPercentage: solverOutput.savingsPercentage,
            consolidatedVendor: solverOutput.consolidatedVendorName,
          },
          feasible: solverOutput.feasible,
          totalOptimizedCost: solverOutput.consolidatedTotalCost,
          marginAchieved: solverOutput.totalSavings,
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
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <Merge className="w-4 h-4" />
            <span>Diskon Skala Volume</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Konsolidasi Kuota Lintas-Event
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl">
            Penggabungan pesanan rombongan berbeda di destinasi yang sama untuk membuka diskon kuota grosir.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          isLoading={isSolving}
          onClick={handleSolve}
          leftIcon={<Play className="w-4 h-4 fill-current" />}
        >
          Jalankan Konsolidasi
        </Button>
      </div>

      {/* Threshold Meter & Active Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discount Target Meter */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Kekuatan Tawar (Bargaining Power)"
            subtitle="Target syarat kuota vendor tier 1"
          />

          <div className="flex flex-col gap-4 mt-4">
            <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {targetVendor.vendorName}
                </span>
                <Badge variant="brand">Diskon 40%</Badge>
              </div>
              <div className="text-xs text-[var(--text-muted)] mb-3">
                Syarat: Minimal {targetThreshold.minQuantity} porsi di jam makan siang yang sama.
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[var(--surface-sunken)] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--brand-primary)] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs mt-2">
                <span className="font-bold text-[var(--text-primary)]">
                  {totalPax} Porsi Terkumpul
                </span>
                <span className="text-[var(--status-success-text)] font-semibold">
                  {totalPax >= targetThreshold.minQuantity ? "Syarat Terpenuhi!" : "Belum Cukup"}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-[var(--text-secondary)]">
                Tingkatan Diskon Vendor:
              </div>
              {targetVendor.thresholds.map((tier, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-2 rounded-lg border ${
                    totalPax >= tier.minQuantity
                      ? "border-[var(--brand-primary)]/40 bg-[var(--brand-primary-subtle)]/40 font-semibold"
                      : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-muted)]"
                  }`}
                >
                  <span>&ge; {tier.minQuantity} Porsi</span>
                  <span className="text-[var(--brand-primary-text)] font-bold">
                    Diskon {tier.discountPercentage}% ({formatRupiah(tier.pricePerUnit)}/porsi)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Live Detected Events in Yogyakarta on 16 Dec */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Deteksi Otomatis: 3 Rombongan di Yogyakarta (16 Des 2024)"
            subtitle="Sistem mendeteksi rombongan yang jadwal makan siangnya dapat dialihkan ke satu vendor"
            action={
              <Badge variant="success">
                Total {totalPax} Pax Siap Digabung
              </Badge>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {evt.orderId}
                    </span>
                    <Badge variant="neutral">{evt.participantCount} Pax</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    {idx === 0
                      ? "SMA Negeri 3 Semarang"
                      : idx === 1
                      ? "PT Telkom Indonesia"
                      : "Arisan RT 05 Graha"}
                  </h4>
                  <div className="mt-2 space-y-1 text-[11px] text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                      <span>{evt.date} (Makan Siang)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                      <span>{evt.locationArea}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex justify-between items-center text-[11px]">
                  <span className="text-[var(--text-muted)]">Tarif Awal:</span>
                  <span className="font-semibold text-[var(--text-secondary)]">
                    {formatRupiah(evt.currentUnitPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Result Calculation Banner */}
          {result && result.feasible ? (
            <div className="mt-5 p-4 rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success-subtle)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--status-success)] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--status-success-text)]">
                    Konsolidasi Sukses: Diskon 40% Terkunci! ({result.solverTimeMs} ms)
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                    Vendor Terpadu: <span className="font-bold text-[var(--text-primary)]">{result.consolidatedVendorName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)]">Lonjakan Laba Bersih Perusahaan</div>
                <div className="text-lg font-bold text-[var(--status-success-text)]">
                  +{formatRupiah(result.totalSavings)} ({formatPercentage(result.savingsPercentage)})
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 p-4 rounded-xl border border-dashed border-[var(--border-default)] text-center text-xs text-[var(--text-muted)]">
              Klik <span className="font-semibold text-[var(--text-primary)]">"Konsolidasikan Rute & Vendor"</span> untuk mensimulasikan negosiasi kuota lintas-event secara serentak.
            </div>
          )}
        </Card>
      </div>

      {/* Breakdown per event */}
      {result && result.eventAllocations.length > 0 && (
        <Card padding="none">
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Rincian Efisiensi Margin Per Event
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Penghematan riil dari selisih harga kontrak klien dengan harga diskon vendor konsolidasian
              </p>
            </div>
            <Badge variant="brand">
              Tarif Baru: Rp 45.000 / Porsi
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Nama Pelanggan</th>
                  <th className="py-3 px-4 text-center">Porsi</th>
                  <th className="py-3 px-4 text-right">Biaya Awal (Tanpa LP)</th>
                  <th className="py-3 px-4 text-right">Biaya Baru (Diskon 40%)</th>
                  <th className="py-3 px-4 text-right font-bold text-[var(--status-success-text)]">
                    Margin Tambahan NusaTrip
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {result.eventAllocations.map((alloc, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface-subtle)]/60">
                    <td className="py-3 px-4 font-mono font-medium">{alloc.orderId}</td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {idx === 0
                        ? "SMA Negeri 3 Semarang"
                        : idx === 1
                        ? "PT Telkom Indonesia"
                        : "Arisan RT 05 Graha"}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{alloc.participantCount}</td>
                    <td className="py-3 px-4 text-right text-[var(--text-muted)] line-through">
                      {formatRupiah(alloc.originalCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[var(--text-primary)]">
                      {formatRupiah(alloc.newCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[var(--status-success-text)]">
                      +{formatRupiah(alloc.savings)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[var(--surface-subtle)] font-bold text-xs">
                  <td colSpan={2} className="py-3 px-4">TOTAL KONSOLIDASI</td>
                  <td className="py-3 px-4 text-center">{result.totalParticipants}</td>
                  <td className="py-3 px-4 text-right text-[var(--text-muted)]">
                    {formatRupiah(result.originalTotalCost)}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--text-primary)]">
                    {formatRupiah(result.consolidatedTotalCost)}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--status-success-text)] text-sm">
                    +{formatRupiah(result.totalSavings)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
