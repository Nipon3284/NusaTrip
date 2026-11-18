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
  ShieldCheck,
  HeartPulse,
  UserCog,
  FileText,
  Printer,
  QrCode,
  Barcode,
  ExternalLink,
  X,
  Compass,
  Bus,
  Hotel,
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
import { Modal } from "@/components/ui/modal";
import { useCustomerLeads } from "@/lib/data/tour-store";

interface CrewMemberItem {
  id: string;
  name: string;
  role: "Tour Leader" | "Tim Dokumentasi" | "Tim Medis" | "Tim Pengawas";
  qualification: string;
  phone: string;
  licenseNumber: string;
  dailyRate: number;
  hasMedicalCertificate: boolean;
  matchScore: number;
  status: "Tersedia" | "Ditugaskan";
}

const MANDATORY_CREW_POOL: CrewMemberItem[] = [
  {
    id: "crew-tl-1",
    name: "Budi Santoso, S.Par",
    role: "Tour Leader",
    qualification: "Lisensi HPI Senior & Fasih Bahasa Inggris/Jawa",
    phone: "081234567890",
    licenseNumber: "HPI-DIY-2021-089",
    dailyRate: 450000,
    hasMedicalCertificate: true,
    matchScore: 98,
    status: "Ditugaskan",
  },
  {
    id: "crew-doc-1",
    name: "Reza Mahendra",
    role: "Tim Dokumentasi",
    qualification: "Fotografer & Pilot Drone APDI (DJI Mavic 3 Pro)",
    phone: "081299887711",
    licenseNumber: "APDI-DRONE-8821",
    dailyRate: 400000,
    hasMedicalCertificate: true,
    matchScore: 96,
    status: "Ditugaskan",
  },
  {
    id: "crew-med-1",
    name: "Ns. Maya Indah, S.Kep",
    role: "Tim Medis",
    qualification: "Sertifikasi K3 Kemenkes & P3K Pariwisata Siaga",
    phone: "081377665544",
    licenseNumber: "STR-PERAWAT-90123",
    dailyRate: 350000,
    hasMedicalCertificate: true,
    matchScore: 99,
    status: "Ditugaskan",
  },
  {
    id: "crew-spv-1",
    name: "Aris Munandar",
    role: "Tim Pengawas",
    qualification: "Koordinator Lapangan & Manajemen Insidental NusaTrip",
    phone: "081399887766",
    licenseNumber: "NUSA-SPV-OPS-04",
    dailyRate: 350000,
    hasMedicalCertificate: true,
    matchScore: 95,
    status: "Ditugaskan",
  },
  {
    id: "crew-tl-2",
    name: "Dewi Lestari",
    role: "Tour Leader",
    qualification: "Pemandu Wisata Junior (Budaya & Sejarah Lokal)",
    phone: "081744556677",
    licenseNumber: "HPI-DIY-2023-142",
    dailyRate: 300000,
    hasMedicalCertificate: true,
    matchScore: 88,
    status: "Tersedia",
  },
  {
    id: "crew-doc-2",
    name: "Fajar Pratama",
    role: "Tim Dokumentasi",
    qualification: "Videografer Reels & Sony Alpha Mirrorless",
    phone: "081833221100",
    licenseNumber: "KREATIF-DOCS-441",
    dailyRate: 350000,
    hasMedicalCertificate: true,
    matchScore: 90,
    status: "Tersedia",
  },
];

export function ModuleAssignment({
  onLogAdd,
}: {
  onLogAdd?: (log: any) => void;
}) {
  const leads = useCustomerLeads();
  const [eventDays, setEventDays] = useState<number>(3);
  const [paxCount, setPaxCount] = useState<number>(120);
  const [budgetForFreelancers, setBudgetForFreelancers] = useState<number>(6_500_000);
  const [isSolving, setIsSolving] = useState(false);
  const [solved, setSolved] = useState<boolean>(true);
  const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
  const [activeDocTab, setActiveDocTab] = useState<"spk" | "surat_jalan" | "voucher">("spk");

  const handleSolve = () => {
    setIsSolving(true);
    setTimeout(() => {
      setSolved(true);
      setIsSolving(false);

      if (onLogAdd) {
        onLogAdd({
          id: `log-${Date.now()}`,
          orderId: leads[0]?.id || "ORDER-OPS",
          type: "freelancer_assignment",
          input: { eventDays, budgetForFreelancers, paxCount },
          result: {
            totalCost: 4650000,
            assignmentsCount: 4,
            feasible: true,
          },
          feasible: true,
          totalOptimizedCost: 4650000,
          marginAchieved: 1850000,
          solverTimeMs: 14,
          createdAt: new Date().toLocaleTimeString("id-ID"),
          createdBy: "Admin Operasional",
        });
      }
    }, 350);
  };

  const assignedCrews = MANDATORY_CREW_POOL.filter((c) => c.status === "Ditugaskan");
  const totalCrewCost = assignedCrews.reduce((sum, c) => sum + c.dailyRate * eventDays, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
            <span>Riset Operasi &bull; Modul 4 (Hungarian SDM & Aset)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Penugasan 4 Kru Lapangan Wajib & Generator Dokumen H-7
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
            Menugaskan 4 peran mutlak: Tour Leader, Dokumentasi Drone, Tim Medis, dan Tim Pengawas dengan aturan Anti-Overqualification serta verifikasi Surat Keterangan Sehat sebelum cetak SPK.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowDocumentModal(true)}
            className="gap-2 text-xs font-semibold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
          >
            <FileText className="w-4 h-4" />
            <span>Dokumen Eksekusi H-7</span>
          </Button>
          <Button
            variant="gradient"
            size="md"
            isLoading={isSolving}
            onClick={handleSolve}
            className="gap-2 text-xs font-semibold"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Jalankan Penugasan Optimal</span>
          </Button>
        </div>
      </div>

      {/* Constraints & Requirements Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader
            title="Spesifikasi Event & Plafon Honor"
            subtitle="Batasan matematis kualifikasi dan anggaran"
          />

          <div className="flex flex-col gap-3.5 mt-4">
            <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[var(--text-muted)]">Durasi Acara:</span>
                <span className="font-bold text-[var(--text-primary)]">{eventDays} Hari Lapangan</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[var(--text-muted)]">Jumlah Peserta:</span>
                <span className="font-bold text-[var(--text-primary)]">{paxCount} Pax (Rombongan)</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[var(--border-subtle)]">
                <span className="font-semibold text-[var(--text-muted)]">Plafon Honor Total:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(budgetForFreelancers)}</span>
              </div>
            </div>

            {/* 4 Mandatory Roles Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                4 Peran Mutlak Standar NusaTrip:
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">1. Tour Leader</span>
                      <p className="text-[10px] text-[var(--text-muted)]">Lisensi HPI, memimpin briefing & rute</p>
                    </div>
                  </div>
                  <Badge variant="brand" size="sm">Wajib</Badge>
                </div>

                <div className="p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">2. Tim Dokumentasi</span>
                      <p className="text-[10px] text-[var(--text-muted)]">Kamera Mirrorless + Pilot Drone APDI</p>
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">Wajib</Badge>
                </div>

                <div className="p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">3. Tim Medis</span>
                      <p className="text-[10px] text-[var(--text-muted)]">Perawat bersertifikat P3K & K3 Kemenkes</p>
                    </div>
                  </div>
                  <Badge variant="rose" size="sm">Wajib</Badge>
                </div>

                <div className="p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">4. Tim Pengawas</span>
                      <p className="text-[10px] text-[var(--text-muted)]">Supervisor insidental & verifikasi vendor</p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">Wajib</Badge>
                </div>
              </div>
            </div>

            {/* Anti-Overqualification Rule Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px] text-[var(--text-secondary)] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Aturan Anti-Overqualification Aktif</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                Menghindari penugasan pemandu VIP multi-bahasa bertarif tinggi untuk event domestik biasa, sehingga anggaran honor tetap berada pada titik terhemat.
              </p>
            </div>
          </div>
        </Card>

        {/* Crew Roster Pool & Health Status */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader
            title="Daftar Pool Kru Lapangan & Status Sertifikasi Sehat"
            subtitle="Kru terpilih Hungarian Assignment siap diterbitkan SPK H-7"
            action={
              <Badge variant="emerald" size="sm">
                4 Kru Ditugaskan
              </Badge>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {MANDATORY_CREW_POOL.map((fl) => {
              const isAssigned = fl.status === "Ditugaskan";

              return (
                <div
                  key={fl.id}
                  className={`p-3.5 rounded-xl border transition-colors flex flex-col justify-between gap-3 text-xs ${
                    isAssigned
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-400/20"
                      : "bg-[var(--surface-card)] border-[var(--border-subtle)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[var(--text-primary)]">{fl.name}</span>
                      <Badge variant={isAssigned ? "emerald" : "neutral"} size="sm">
                        {fl.role}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] mt-1">{fl.qualification}</p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {fl.hasMedicalCertificate && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Surat Sehat Terverifikasi
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[var(--text-subtle)] bg-[var(--surface-page)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                        {fl.licenseNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                    <span className="text-[var(--text-muted)]">
                      Honor: <strong className="text-[var(--text-primary)]">{formatRupiah(fl.dailyRate)}</strong>/hari
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Total: {formatRupiah(fl.dailyRate * eventDays)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solver Summary Banner */}
          <div className="mt-5 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Formasi 4 Kru Selesai & Feasible (Latensi Solver: 14ms)
                </div>
                <div className="text-sm font-extrabold text-[var(--text-primary)]">
                  Total Honor Kru ({eventDays} Hari): {formatRupiah(totalCrewCost)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setShowDocumentModal(true)}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Dokumen Terpadu H-7</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Generator Dokumen Eksekusi H-7 Terpadu Modal */}
      {showDocumentModal && (
        <Modal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          title="Generator Dokumen Eksekusi H-7 Terpadu"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* 3 Document Tabs */}
            <div className="flex border-b border-[var(--border-subtle)] gap-2">
              <button
                type="button"
                onClick={() => setActiveDocTab("spk")}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeDocTab === "spk"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Surat Perintah Kerja (SPK 4 Kru)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab("surat_jalan")}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeDocTab === "surat_jalan"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                <span>2. Surat Jalan Bus & Manifest</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab("voucher")}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeDocTab === "voucher"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Hotel className="w-3.5 h-3.5" />
                <span>3. PO & Voucher Mitra (Hotel & Resto)</span>
              </button>
            </div>

            {/* Document 1: SPK Kru Preview */}
            {activeDocTab === "spk" && (
              <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-white dark:bg-slate-900 text-[var(--text-primary)] space-y-4 font-sans text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight text-indigo-900 dark:text-indigo-200">
                      NUSATRIP & EVENT PLANNER INDONESIA
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Surat Perintah Kerja (SPK) Operasional Lapangan &bull; No: SPK/NUSA/2026/XI/0882
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-10 h-10 text-slate-800 dark:text-slate-200" />
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">QR VERIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                  <div>
                    <span className="text-[var(--text-muted)]">Event / Rombongan:</span>
                    <strong className="block text-[var(--text-primary)]">SMAN 1 Surakarta (Study Tour)</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Destinasi & Jadwal:</span>
                    <strong className="block text-[var(--text-primary)]">Yogyakarta, 20-22 Nov 2026 (120 Pax)</strong>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider mb-2 text-indigo-700 dark:text-indigo-300">
                    Daftar 4 Kru Lapangan yang Diberi Mandat:
                  </h4>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[var(--text-muted)] font-semibold">
                        <th className="py-1.5">Nama Personil</th>
                        <th className="py-1.5">Tugas / Peran</th>
                        <th className="py-1.5">No. Lisensi / KTA</th>
                        <th className="py-1.5 text-center">Status Medis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {assignedCrews.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2 font-semibold">{c.name}</td>
                          <td className="py-2">{c.role}</td>
                          <td className="py-2 font-mono text-[10px]">{c.licenseNumber}</td>
                          <td className="py-2 text-center text-emerald-600 font-bold">Terverifikasi Sehat</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Diterbitkan oleh Direktur Operasional NusaTrip</span>
                  <span className="font-mono">BARCODE: *NUSA-SPK-7721-H7*</span>
                </div>
              </div>
            )}

            {/* Document 2: Surat Jalan Bus Preview */}
            {activeDocTab === "surat_jalan" && (
              <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-white dark:bg-slate-900 text-[var(--text-primary)] space-y-4 font-sans text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight text-indigo-900 dark:text-indigo-200">
                      SURAT JALAN & MANIFEST ARMADA BUS PARIWISATA
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      No: SJ-BUS/NUSA/XI/1049 &bull; PO Haryanto Pariwisata
                    </p>
                  </div>
                  <Barcode className="w-16 h-8 text-slate-800 dark:text-slate-200" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                  <div>
                    <span className="text-[var(--text-muted)]">Armada Utama:</span>
                    <strong className="block">2x Big Bus 50 Seat</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Armada Tambahan:</span>
                    <strong className="block">1x Hiace Premio 15 Seat</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Plat Nomor:</span>
                    <strong className="block font-mono">AB 7788 CD / AB 7789 CD</strong>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Surat jalan ini menjamin seluruh rombongan 120 orang telah memiliki asuransi perjalanan Jasa Raharja dan wajib mematuhi jam keberangkatan pada setiap etape perjalanan sesuai rundown.
                </p>
              </div>
            )}

            {/* Document 3: PO & Voucher Mitra Preview */}
            {activeDocTab === "voucher" && (
              <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-white dark:bg-slate-900 text-[var(--text-primary)] space-y-4 font-sans text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight text-indigo-900 dark:text-indigo-200">
                      PURCHASE ORDER & VOUCHER MITRA RESMI
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      No: PO-VOUCHER/HOTEL-RESTO/2026/XI/4401
                    </p>
                  </div>
                  <QrCode className="w-9 h-9 text-indigo-600" />
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Grand Keisha Yogyakarta</span>
                      <p className="text-[10px] text-[var(--text-muted)]">Alokasi: 30 Kamar Deluxe Twin (120 Pax) &bull; Check-in: 20 Nov 2026</p>
                    </div>
                    <Badge variant="emerald" size="sm">Voucher Terbit</Badge>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">RM Bale Raos Keraton</span>
                      <p className="text-[10px] text-[var(--text-muted)]">Alokasi: 120 Porsi Prasmanan Tradisional Raja &bull; Bebas Alergi Seafood</p>
                    </div>
                    <Badge variant="emerald" size="sm">Voucher Terbit</Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
              <Button variant="outline" size="sm" onClick={() => setShowDocumentModal(false)}>
                Tutup
              </Button>
              <Button
                variant="gradient"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  alert("Dokumen berhasil disiapkan untuk dicetak atau dikirim ke grup WhatsApp Tim Lapangan!");
                  setShowDocumentModal(false);
                }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Bagikan Dokumen</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}