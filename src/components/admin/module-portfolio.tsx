"use client";

import React, { useState } from "react";
import {
  PieChart,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  Users2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { solvePortfolio } from "@/lib/optimizer/solver";
import {
  EVENT_CANDIDATES,
  formatRupiah,
  formatPercentage,
} from "@/lib/optimizer/seed-data";
import type { PortfolioResult } from "@/lib/optimizer/types";

export function ModulePortfolio({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const [availableCapital, setAvailableCapital] = useState<number>(75_000_000);
  const [availableTeams, setAvailableTeams] = useState<number>(4);
  const [maxConcurrent, setMaxConcurrent] = useState<number>(3);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [result, setResult] = useState<PortfolioResult | null>(null);

  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      const solverOutput = solvePortfolio({
        candidates: EVENT_CANDIDATES,
        constraints: {
          availableCapital,
          availableAdminTeams: availableTeams,
          maxConcurrentEvents: maxConcurrent,
        },
      });

      setResult(solverOutput);
      setIsSolving(false);

      if (onLogAdd) {
        onLogAdd({
          id: `log-${Date.now()}`,
          orderId: "PORTFOLIO-PEAK-2024",
          type: "portfolio",
          input: { availableCapital, availableTeams, maxConcurrent },
          result: {
            totalProfit: solverOutput.totalProfit,
            capitalUtilization: solverOutput.capitalUtilization,
            teamUtilization: solverOutput.teamUtilization,
            acceptedCount: solverOutput.selectedEvents.filter((s) => s.recommendation === "accept").length,
          },
          feasible: solverOutput.feasible,
          totalOptimizedCost: solverOutput.totalCost,
          marginAchieved: solverOutput.totalProfit,
          solverTimeMs: solverOutput.solverTimeMs,
          createdAt: new Date().toLocaleTimeString("id-ID"),
          createdBy: "Admin Operasional",
        });
      }
    }, 450);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <PieChart className="w-4 h-4" />
            <span>0-1 Knapsack Portofolio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Seleksi Event Peak Season
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl">
            Optimasi pemilihan pesanan bernilai tertinggi di bawah batas ketersediaan modal kas dan staf lapangan.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          isLoading={isSolving}
          onClick={handleSolve}
          leftIcon={<Play className="w-4 h-4 fill-current" />}
        >
          Jalankan Knapsack
        </Button>
      </div>

      {/* Constraints Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Batas Kendala Operasional (Knapsack Limits)"
            subtitle="Batasan modal kas dan kapasitas SDM tim lapangan"
          />

          <div className="flex flex-col gap-5 mt-4">
            {/* Modal DP Sliders */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modal Kas DP Vendor</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-xs">
                  {formatRupiah(availableCapital)}
                </span>
              </div>
              <input
                type="range"
                min="30000000"
                max="150000000"
                step="5000000"
                value={availableCapital}
                onChange={(e) => setAvailableCapital(Number(e.target.value))}
                className="w-full accent-[var(--brand-primary)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                <span>Rp 30jt</span>
                <span>Rp 75jt (Default)</span>
                <span>Rp 150jt</span>
              </div>
            </div>

            {/* Admin Teams Sliders */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Kapasitas Tim Admin Lapangan</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-xs">
                  {availableTeams} Tim Siaga
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={availableTeams}
                onChange={(e) => setAvailableTeams(Number(e.target.value))}
                className="w-full accent-[var(--brand-primary)] cursor-pointer"
              />
            </div>

            {/* Max concurrent events */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Batas Event Serentak</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-bold text-xs">
                  Max {maxConcurrent} Event
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                className="w-full accent-[var(--brand-primary)] cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-primary)]">Fungsi Tujuan:</span>
              <p className="text-[11px] mt-1 leading-relaxed">
                MAXIMIZE &Sigma; Laba(i) &times; X(i)<br />
                s.t. &Sigma; DP(i) &le; Modal & &Sigma; Tim(i) &le; Tim Tersedia
              </p>
            </div>
          </div>
        </Card>

        {/* Solver Executive Overview */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Daftar Permintaan Masuk (Musim Liburan 15-20 Des 2024)"
            subtitle="Total 6 calon pesanan senilai Rp 359.500.000 bersaing memperebutkan alokasi modal DP"
            action={
              result && (
                <Badge variant="brand">
                  Laba Optimal: {formatRupiah(result.totalProfit)}
                </Badge>
              )
            }
          />

          {/* Quick Metrics */}
          {result && (
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-center">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                  Utilisasi Modal DP
                </span>
                <span className="text-base font-bold text-[var(--text-primary)] mt-0.5 block">
                  {formatPercentage(result.capitalUtilization)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-center">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                  Utilisasi Tim Admin
                </span>
                <span className="text-base font-bold text-[var(--text-primary)] mt-0.5 block">
                  {formatPercentage(result.teamUtilization)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--status-success-subtle)]/50 border border-[var(--status-success)]/20 text-center">
                <span className="text-[10px] text-[var(--status-success-text)] uppercase tracking-wider block">
                  Total Laba Terkunci
                </span>
                <span className="text-base font-bold text-[var(--status-success-text)] mt-0.5 block">
                  {formatRupiah(result.totalProfit)}
                </span>
              </div>
            </div>
          )}

          {/* Candidates List with Decision Status */}
          <div className="flex flex-col gap-2.5 mt-4">
            {EVENT_CANDIDATES.map((cand) => {
              const decision = result?.selectedEvents.find((s) => s.orderId === cand.orderId);
              const isAccepted = decision?.recommendation === "accept";
              const isRescheduled = decision?.recommendation === "reschedule";
              const isRejected = !decision || decision.recommendation === "reject";

              return (
                <div
                  key={cand.orderId}
                  className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    result
                      ? isAccepted
                        ? "bg-[var(--status-success-subtle)]/30 border-[var(--status-success)]/40"
                        : isRescheduled
                        ? "bg-[var(--status-warning-subtle)]/30 border-[var(--status-warning)]/40"
                        : "bg-[var(--surface-subtle)] border-[var(--border-subtle)] opacity-70"
                      : "bg-[var(--surface-card)] border-[var(--border-default)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {result ? (
                        isAccepted ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" />
                        ) : isRescheduled ? (
                          <Clock className="w-5 h-5 text-[var(--brand-accent)]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[var(--status-danger)]" />
                        )
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--border-strong)]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--text-primary)]">
                          {cand.customerName}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {cand.orderId}
                        </span>
                        <Badge variant="neutral">{cand.participantCount} Pax</Badge>
                      </div>

                      <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-3 flex-wrap">
                        <span>Kontrak: <b className="text-[var(--text-primary)]">{formatRupiah(cand.agreedPrice)}</b></span>
                        <span>Estimasi Laba: <b className="text-[var(--status-success-text)]">+{formatRupiah(cand.estimatedProfit)}</b></span>
                        <span>Butuh DP: <b>{formatRupiah(cand.requiredDpToVendors)}</b></span>
                        <span>Tim: <b>{cand.requiredAdminTeams} Tim</b></span>
                      </div>

                      {decision && (
                        <p className="text-[11px] font-medium mt-1.5 text-[var(--text-secondary)]">
                          Alasan DSS: {decision.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {result ? (
                      isAccepted ? (
                        <Badge variant="success">Diterima</Badge>
                      ) : isRescheduled ? (
                        <Badge variant="warning">Reschedule</Badge>
                      ) : (
                        <Badge variant="danger">Ditolak</Badge>
                      )
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">Menunggu Evaluasi</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
