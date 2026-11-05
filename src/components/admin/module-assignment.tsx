"use client";

import React, { useState } from "react";
import {
  Users,
  Play,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Languages,
  Award,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { solveAssignment } from "@/lib/optimizer/solver";
import {
  FREELANCERS,
  formatRupiah,
} from "@/lib/optimizer/seed-data";
import type {
  AssignmentResult,
  FreelancerRequirement,
} from "@/lib/optimizer/types";

export function ModuleAssignment({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const [eventDays, setEventDays] = useState<number>(2);
  const [budgetForFreelancers, setBudgetForFreelancers] = useState<number>(4_500_000);

  // Requirements state matching user prompt:
  // 1 guide berbahasa Inggris, 1 guide lokal, 2 fotografer yang punya drone
  const [requirements] = useState<FreelancerRequirement[]>([
    {
      specialty: "tour_guide",
      quantity: 1,
      requiredLanguages: ["English"],
      requiredSeniority: "senior",
    },
    {
      specialty: "tour_guide",
      quantity: 1,
      requiredLanguages: ["Indonesia"],
      requiredSeniority: "junior",
    },
    {
      specialty: "photographer",
      quantity: 2,
      requiresDrone: true,
    },
  ]);

  const [isSolving, setIsSolving] = useState(false);
  const [result, setResult] = useState<AssignmentResult | null>(null);

  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      const solverOutput = solveAssignment({
        orderId: "ORD-ASSIGN-SPEC",
        eventDates: Array.from({ length: eventDays }, (_, i) => `Day ${i + 1}`),
        requirements,
        availableFreelancers: FREELANCERS,
        budgetForFreelancers,
      });

      setResult(solverOutput);
      setIsSolving(false);

      if (onLogAdd) {
        onLogAdd({
          id: `log-${Date.now()}`,
          orderId: "ORD-ASSIGN-SPEC",
          type: "freelancer_assignment",
          input: { eventDays, budgetForFreelancers, reqCount: requirements.length },
          result: {
            totalCost: solverOutput.totalCost,
            assignmentsCount: solverOutput.assignments.length,
            feasible: solverOutput.feasible,
          },
          feasible: solverOutput.feasible,
          totalOptimizedCost: solverOutput.totalCost,
          marginAchieved: solverOutput.budgetRemaining,
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
      <div className="bg-[var(--surface-card)] p-6 rounded-2xl border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
            <span>Fungsi LP 4: Riset Operasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Penugasan SDM Berbasis Spesifikasi (Assignment Problem)
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Pencocokan silang (cross-matching) pool freelancer terhadap syarat bahasa, keahlian drone,
            dan senioritas dengan total honor serendah mungkin tanpa membuang guide premium untuk event lokal.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          isLoading={isSolving}
          onClick={handleSolve}
          leftIcon={<Play className="w-4 h-4 fill-current" />}
        >
          Cocokkan Penugasan Optimal
        </Button>
      </div>

      {/* Constraints & Requirements Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Spesifikasi Pesanan Klien"
            subtitle="Persyaratan SDM lapangan yang diminta pelanggan"
          />

          <div className="flex flex-col gap-3.5 mt-4">
            <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[var(--text-primary)]">Durasi Acara:</span>
                <span className="font-semibold text-[var(--brand-primary)]">{eventDays} Hari</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[var(--text-primary)]">Plafon Anggaran Honor:</span>
                <span className="font-semibold text-[var(--status-success-text)]">{formatRupiah(budgetForFreelancers)}</span>
              </div>
            </div>

            <div className="space-y-2 mt-1">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                Daftar Kebutuhan Formil:
              </span>

              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold capitalize text-[var(--text-primary)]">
                      {req.quantity}x {req.specialty === "tour_guide" ? "Tour Guide" : "Fotografer"}
                    </span>
                    <Badge variant={req.specialty === "tour_guide" ? "brand" : "neutral"}>
                      {req.specialty}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)] space-y-0.5 mt-1">
                    {req.requiredLanguages && (
                      <div className="flex items-center gap-1.5">
                        <Languages className="w-3 h-3 text-blue-500" />
                        <span>Wajib Bahasa: {req.requiredLanguages.join(", ")}</span>
                      </div>
                    )}
                    {req.requiredSeniority && (
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>Kualifikasi: {req.requiredSeniority}</span>
                      </div>
                    )}
                    {req.requiresDrone && (
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-purple-500" />
                        <span>Peralatan: Memiliki & Sertifikasi Drone</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Available Freelancers Pool */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Basis Data Pool Freelancer Tersedia"
            subtitle="8 tenaga profesional independen siap ditugaskan per-event"
            action={
              <Badge variant="neutral">
                {FREELANCERS.filter((f) => f.isAvailable).length} Freelancer Siap
              </Badge>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {FREELANCERS.map((fl) => {
              const isAssigned = result?.assignments.some((a) => a.freelancerId === fl.id);

              return (
                <div
                  key={fl.id}
                  className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-3 text-xs ${
                    isAssigned
                      ? "bg-[var(--status-success-subtle)]/40 border-[var(--status-success)]/40 ring-1 ring-[var(--status-success)]/20"
                      : "bg-[var(--surface-card)] border-[var(--border-subtle)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">{fl.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">
                        {fl.seniority}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] mt-1 space-y-0.5">
                      <div>Bahasa: {fl.languages.join(", ")}</div>
                      <div className="flex items-center gap-1.5">
                        {fl.hasDrone && (
                          <Badge variant="brand" className="text-[9px] px-1 py-0">
                            Drone Pilot
                          </Badge>
                        )}
                        <span>{fl.certifications.join(", ") || "Terverifikasi NusaTrip"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-[var(--text-primary)] block">
                      {formatRupiah(fl.dailyRate)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">/hari</span>

                    {isAssigned && (
                      <Badge variant="success" className="mt-1 text-[9px]">
                        Ditugaskan
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solver Banner */}
          {result && (
            <div className="mt-5 p-4 rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success-subtle)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--status-success)] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--status-success-text)]">
                    100% Spesifikasi Terpenuhi ({result.solverTimeMs} ms)
                  </div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    Total Honor SDM: {formatRupiah(result.totalCost)} ({eventDays} Hari)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)]">Sisa Anggaran Honor</div>
                <div className="text-base font-bold text-[var(--status-success-text)]">
                  +{formatRupiah(result.budgetRemaining)}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Assignment Output Table */}
      {result && result.assignments.length > 0 && (
        <Card padding="none">
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Hasil Penugasan Formil LP (Letter of Assignment)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Surat tugas otomatis diterbitkan ke aplikasi pekerja lepas setelah admin konfirmasi
              </p>
            </div>
            <Badge variant="brand">{result.assignments.length} Petugas Terpilih</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Petugas</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Keahlian Kunci</th>
                  <th className="py-3 px-4 text-right">Tarif Harian</th>
                  <th className="py-3 px-4 text-right">Total Honor ({eventDays} Hari)</th>
                  <th className="py-3 px-4 text-center">Skor Kecocokan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {result.assignments.map((assign, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface-subtle)]/60">
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      {assign.freelancerName}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-[var(--text-secondary)]">
                      {assign.specialty === "tour_guide" ? "Tour Guide" : "Dokumentasi"} ({assign.seniority})
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      Bahasa: {assign.languages.join(", ")}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)]">
                      {formatRupiah(assign.dailyRate)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[var(--text-primary)]">
                      {formatRupiah(assign.totalFee)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[var(--brand-primary-text)]">
                      {assign.matchScore} pts
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success">Terkunci</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
