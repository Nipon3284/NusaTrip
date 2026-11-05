"use client";

import React from "react";
import { History, CheckCircle2, Cpu, Clock, Terminal } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/optimizer/seed-data";
import type { OptimizationLog } from "@/lib/optimizer/types";

export function ModuleLogs({ logs }: { logs: OptimizationLog[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[var(--surface-card)] p-6 rounded-2xl border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
            <History className="w-4 h-4" />
            <span>Audit Trail Riset Operasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Log Eksekusi & Riwayat Keputusan Linear Programming
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Catatan matematis transparan mengenai setiap pemecahan masalah optimasi,
            waktu komputasi algoritma (ms), dan margin yang dihasilkan.
          </p>
        </div>

        <Badge variant="brand" icon={<Cpu className="w-3.5 h-3.5" />}>
          Total {logs.length} Komputasi Tercatat
        </Badge>
      </div>

      <Card padding="none">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Daftar Jejak Audit Solver
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Realtime in-memory audit log
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">
            Belum ada eksekusi solver. Jalankan salah satu modul optimasi LP di menu sebelah kiri.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Tipe Modul LP</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4 text-center">Waktu Komputasi</th>
                  <th className="py-3 px-4 text-right">Biaya Teroptimasi</th>
                  <th className="py-3 px-4 text-right font-bold text-[var(--status-success-text)]">
                    Margin / Efisiensi
                  </th>
                  <th className="py-3 px-4 text-center">Status Solusi</th>
                  <th className="py-3 px-4 text-center">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-subtle)]/60">
                    <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)] uppercase">
                      {log.type.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[var(--text-secondary)]">
                      {log.orderId || "PORTFOLIO"}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[var(--brand-primary-text)]">
                      {log.solverTimeMs} ms
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[var(--text-primary)]">
                      {formatRupiah(log.totalOptimizedCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[var(--status-success-text)]">
                      +{formatRupiah(log.marginAchieved)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={log.feasible ? "success" : "danger"}>
                        {log.feasible ? "Optimal" : "Infeasible"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-[var(--text-muted)]">
                      {log.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
