"use client";

import React, { useState } from "react";
import {
  Inbox,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  MessageSquare,
  Building2,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Send,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Download,
  Radio,
  Copy,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  useCustomerLeads,
  updateLeadStatus,
  updateLeadDetails,
  type CustomerLeadItem,
  type LeadStatus,
} from "@/lib/data/tour-store";
import type { AdminTab } from "./admin-sidebar";

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; badgeVariant: "danger" | "warning" | "brand" | "neutral" | "success" }
> = {
  baru: { label: "1. Baru Masuk", badgeVariant: "danger" },
  negosiasi: { label: "2. Ruang Nego", badgeVariant: "warning" },
  menunggu_dp: { label: "3. Menunggu DP", badgeVariant: "warning" },
  proses_dss: { label: "4. Proses DSS", badgeVariant: "brand" },
  final_h7: { label: "5. Siap H-7 (Final)", badgeVariant: "success" },
  selesai: { label: "6. Trip Selesai", badgeVariant: "neutral" },
};

export function ModuleLeads({ onSelectTab }: { onSelectTab: (tab: AdminTab) => void }) {
  const leads = useCustomerLeads();
  const [activeFilter, setActiveFilter] = useState<"semua" | LeadStatus>("semua");
  const [selectedLead, setSelectedLead] = useState<CustomerLeadItem | null>(null);
  const [counterText, setCounterText] = useState("");
  const [customBidInput, setCustomBidInput] = useState<number | string>(0);
  const [isCopied, setIsCopied] = useState(false);

  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === "semua") return true;
    return lead.status === activeFilter;
  });

  const formatRupiah = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const openLeadDetail = (lead: CustomerLeadItem) => {
    setSelectedLead(lead);
    setCustomBidInput(lead.customerBid || lead.budget || 0);
    setCounterText(
      lead.counterOffer ||
        `Halo ${lead.name}, kami telah mengalkulasi kebutuhan ${lead.pax} Pax ke ${lead.destination}. Kami tawarkan penyesuaian optimal di ${formatRupiah(
          Math.round((lead.bottomLineCost || 40000000) * 1.18)
        )} dengan jaminan bus eksekutif dan hotel berfasilitas prima.`
    );
  };

  // WhatsApp generator
  const getWhatsAppNegotiationUrl = (lead: CustomerLeadItem, messageText?: string) => {
    const cleanPhone = lead.phone.replace(/\D/g, "").replace(/^0/, "62");
    const text =
      messageText ||
      `Halo ${lead.name} (${lead.institution || "Rombongan"}), perihal rencana wisata ${lead.pax} Pax ke ${lead.destination}, penawaran kami telah kami evaluasi di sistem DSS NusaTrip. Mari diskusikan harga deal terbaik!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Shadow Price Calculations
  const calcZMin = (lead: CustomerLeadItem) => {
    return lead.bottomLineCost || Math.round((lead.pax || 20) * (lead.days || 2) * 350000 + 11000000);
  };

  const calcMarginStatus = (lead: CustomerLeadItem, bid: number) => {
    const zMin = calcZMin(lead);
    const targetMinMargin = lead.targetMargin || Math.round(zMin * 0.18);
    const profit = bid - zMin;

    if (bid <= zMin) {
      return {
        level: "danger",
        label: "MERAH BERKEDIP: Peringatan Rugi / Di Bawah Modal Dasar!",
        margin: profit,
        percent: ((profit / zMin) * 100).toFixed(1),
        canApprove: false,
      };
    }
    if (profit < targetMinMargin) {
      return {
        level: "warning",
        label: "KUNING: Margin Tipis (Perlu Nego Tambahan)",
        margin: profit,
        percent: ((profit / zMin) * 100).toFixed(1),
        canApprove: true,
      };
    }
    return {
      level: "safe",
      label: "HIJAU: Margin Aman - Siap Disetujui!",
      margin: profit,
      percent: ((profit / zMin) * 100).toFixed(1),
      canApprove: true,
    };
  };

  const handleSendAutoCounter = async () => {
    if (!selectedLead) return;
    const zMin = calcZMin(selectedLead);
    const suggestedPrice = Math.round(zMin * 1.2);
    const offerMessage = `Rekomendasi Auto Counter DSS: Pagu tawar ${formatRupiah(
      selectedLead.customerBid
    )} disesuaikan menjadi ${formatRupiah(suggestedPrice)} (+18% margin bersih aman), atau alternatif downgrade ke Hotel Bintang 2 di zona sama.`;

    await updateLeadDetails(selectedLead.id, {
      status: "negosiasi",
      counterOffer: offerMessage,
    });

    setSelectedLead({
      ...selectedLead,
      status: "negosiasi",
      counterOffer: offerMessage,
    });
    setCounterText(offerMessage);
  };

  const handleApproveDealAndIssueDP = async () => {
    if (!selectedLead) return;
    const bid = Number(customBidInput) || selectedLead.customerBid || 0;
    const dp = Math.round(bid * 0.4); // 40% Down Payment

    await updateLeadDetails(selectedLead.id, {
      status: "menunggu_dp",
      customerBid: bid,
      dpAmount: dp,
      isDealApproved: true,
    });

    setSelectedLead({
      ...selectedLead,
      status: "menunggu_dp",
      customerBid: bid,
      dpAmount: dp,
      isDealApproved: true,
    });
  };

  const handleDirectTransition = async (id: string, newStatus: LeadStatus) => {
    await updateLeadStatus(id, newStatus);
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>CRM Pipeline & Ruang Negosiasi DSS</span>
          </span>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
            Manajemen Leads & Pengendali Shadow Price
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
            Sistem memantau batas bawah harga modal riil (Z-Minimum) secara rahasia untuk mencegah deal di bawah biaya operasional.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["semua", "baru", "negosiasi", "menunggu_dp", "proses_dss", "final_h7", "selesai"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                activeFilter === st
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {st === "semua" ? `Semua (${leads.length})` : `${STATUS_CONFIG[st]?.label || st} (${leads.filter((l) => l.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => {
          const zMin = calcZMin(lead);
          const currentBid = lead.customerBid || lead.budget || 0;
          const statusEval = calcMarginStatus(lead, currentBid);

          return (
            <div
              key={lead.id}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                      {lead.id}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{lead.name}</h3>
                    {lead.institution && (
                      <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-medium bg-[var(--surface-subtle)] px-2 py-0.5 rounded">
                        <Building2 className="w-3 h-3 text-indigo-500" />
                        {lead.institution}
                      </span>
                    )}
                    <Badge variant={STATUS_CONFIG[lead.status]?.badgeVariant || "neutral"}>
                      {STATUS_CONFIG[lead.status]?.label || lead.status}
                    </Badge>
                    <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      {lead.createdAt}
                    </span>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[var(--text-secondary)] block text-[11px]">Destinasi & Hari:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {lead.destination} ({lead.days} Hari)
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] block text-[11px]">Rombongan Pax:</span>
                      <span className="font-semibold text-[var(--text-primary)]">{lead.pax} Orang</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] block text-[11px]">Tawaran Klien:</span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {formatRupiah(lead.customerBid || lead.budget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] block text-[11px]">Modal DSS (Z-Min):</span>
                      <span className="font-bold text-[var(--text-primary)]">{formatRupiah(zMin)}</span>
                    </div>
                  </div>

                  {/* Secret Admin Margin Indicator Alert */}
                  <div className="pt-2">
                    {statusEval.level === "danger" ? (
                      <div className="p-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-pulse">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                        <span className="font-bold">{statusEval.label}</span>
                        <span className="ml-auto font-mono text-[11px] bg-rose-200/80 dark:bg-rose-900 px-2 py-0.5 rounded">
                          Rugi {formatRupiah(Math.abs(statusEval.margin))}
                        </span>
                      </div>
                    ) : statusEval.level === "warning" ? (
                      <div className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span className="font-semibold">{statusEval.label}</span>
                        <span className="ml-auto font-mono text-[11px] bg-amber-200/80 dark:bg-amber-900 px-2 py-0.5 rounded">
                          Margin +{statusEval.percent}% ({formatRupiah(statusEval.margin)})
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span className="font-semibold">{statusEval.label}</span>
                        <span className="ml-auto font-mono text-[11px] bg-emerald-200/80 dark:bg-emerald-900 px-2 py-0.5 rounded font-bold">
                          Margin Sehat +{statusEval.percent}% ({formatRupiah(statusEval.margin)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openLeadDetail(lead)}
                    className="text-xs w-full justify-center gap-1.5 shadow-xs"
                  >
                    <span>Buka Ruang Nego</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>

                  <a
                    href={getWhatsAppNegotiationUrl(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors w-full"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Klien</span>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTab("supply-chain")}
                    className="text-xs w-full justify-center gap-1 text-[var(--text-secondary)]"
                  >
                    <Cpu className="w-3 h-3 text-indigo-500" />
                    <span>Impor ke DSS</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)]">
            <Inbox className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Tidak ada pesanan pada status ini</h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">Pilih filter &quot;Semua&quot; untuk melihat seluruh pipeline CRM.</p>
          </div>
        )}
      </div>

      {/* Modal Detail & Ruang Negosiasi Shadow Price */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={`Ruang Negosiasi & Evaluasi DSS: ${selectedLead.id}`}
          description={`Klien: ${selectedLead.name} (${selectedLead.institution || "Personal/Keluarga"})`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[var(--text-muted)]">
                Status Saat Ini: <b className="text-[var(--text-primary)]">{STATUS_CONFIG[selectedLead.status]?.label}</b>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedLead(null)}>
                  Tutup
                </Button>
                {selectedLead.status === "baru" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDirectTransition(selectedLead.id, "negosiasi")}
                  >
                    Mulai Tahap Nego
                  </Button>
                )}
                {selectedLead.status === "menunggu_dp" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDirectTransition(selectedLead.id, "proses_dss")}
                  >
                    Konfirmasi DP & Lanjut DSS
                  </Button>
                )}
                {selectedLead.status === "proses_dss" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDirectTransition(selectedLead.id, "final_h7")}
                  >
                    Kunci Final H-7 & Buka Vendor
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Lead Key Specs */}
            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Destinasi Wisata:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedLead.destination}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Jumlah Pax:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedLead.pax} Peserta</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Durasi Trip:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedLead.days} Hari</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Standar Akomodasi:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedLead.hotel}</span>
              </div>
            </div>

            {/* Secret Admin Shadow Price Box */}
            <div className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>Kalkulasi Rahasia Batas Modal DSS (Shadow Price)</span>
                </span>
                <span className="text-[10px] font-mono bg-indigo-200/60 dark:bg-indigo-900 px-2 py-0.5 rounded text-indigo-800 dark:text-indigo-200">
                  Z-Min Floor Protection
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)] block">Modal Dasar LP (Z-Min):</span>
                  <span className="text-base font-bold text-[var(--text-primary)] mt-0.5 block">
                    {formatRupiah(calcZMin(selectedLead))}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Harga pokok bus, hotel, tiket, katering</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)] block">Tawaran Pelanggan:</span>
                  <input
                    type="number"
                    step="500000"
                    value={customBidInput === 0 ? "" : customBidInput}
                    placeholder="0"
                    onChange={(e) => setCustomBidInput(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1 text-sm font-bold text-indigo-700 dark:text-indigo-300 rounded-lg border border-[var(--border-default)] bg-[var(--surface-page)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">Dapat disesuaikan hasil negosiasi</span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] text-[var(--text-muted)] block">Proyeksi Laba Bersih:</span>
                  {(() => {
                    const evalRes = calcMarginStatus(selectedLead, Number(customBidInput) || 0);
                    return (
                      <>
                        <span
                          className={`text-base font-bold mt-0.5 block ${
                            evalRes.level === "danger"
                              ? "text-rose-600 animate-pulse"
                              : evalRes.level === "warning"
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {formatRupiah(evalRes.margin)}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                          Margin: {evalRes.percent}%
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Status Warning Banner */}
              {(() => {
                const evalRes = calcMarginStatus(selectedLead, Number(customBidInput) || 0);
                return (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                      evalRes.level === "danger"
                        ? "bg-rose-100 dark:bg-rose-950/60 border-rose-300 text-rose-800 dark:text-rose-200"
                        : evalRes.level === "warning"
                        ? "bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-200"
                        : "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                    }`}
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      {evalRes.level === "danger" && <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" />}
                      {evalRes.level === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {evalRes.level === "safe" && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      {evalRes.label}
                    </span>
                    <span className="text-[11px]">
                      {evalRes.canApprove ? "Aman diterbitkan tagihan DP" : "Wajib Counter-Offer"}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Counter Offer Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Pesan Auto Counter-Offer (Rekomendasi Penyesuaian Anggaran / Fasilitas):
                </span>
                <Button variant="ghost" size="sm" onClick={handleSendAutoCounter} className="text-xs text-indigo-600 h-7">
                  <Cpu className="w-3 h-3 mr-1" />
                  Generate Rekomendasi DSS
                </Button>
              </div>
              <textarea
                rows={3}
                value={counterText}
                onChange={(e) => setCounterText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppNegotiationUrl(selectedLead, counterText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Kirim Counter via WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(counterText);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className="px-3 h-8 text-xs font-medium rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                >
                  {isCopied ? "Tersalin!" : "Salin Draf Pesan"}
                </button>
              </div>
            </div>

            {/* Deal Approval & DP Generation */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Persetujuan Harga & Penerbitan Tagihan DP
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Begitu harga disepakati, kunci status ke <b>&quot;Menunggu DP&quot;</b> untuk menerbitkan invoice DP 40% ({formatRupiah(Math.round((Number(customBidInput) || 0) * 0.4))}).
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApproveDealAndIssueDP}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>Setujui Harga Deal & Terbitkan Tagihan DP</span>
              </Button>
            </div>

            {/* Generator Dokumen H-7 & Web-Beacon Kru Lapangan */}
            {(selectedLead.status === "final_h7" || selectedLead.status === "proses_dss" || selectedLead.status === "selesai") && (
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span>Generator Dokumen H-7 & Tautan Web-Beacon GPS Kru</span>
                  </span>
                  <Badge variant="brand" size="sm">
                    SINGLE SOURCE OF TRUTH ADMIN
                  </Badge>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Kru lapangan tidak memiliki akses login aplikasi. Seluruh instruksi operasional dibagikan via dokumen PDF resmi ber-SPK atau tautan Web-Beacon sekali pakai.
                </p>

                {/* Document Download Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh SPK Resmi 4 Kru untuk ${selectedLead.id}...`)}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-subtle)] text-left hover:border-indigo-500 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <strong className="block text-[var(--text-primary)]">SPK 4 Kru</strong>
                      <span className="text-[10px] text-[var(--text-muted)]">TL, Drone, Medis, Pengawas</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh Surat Jalan PO Bus untuk ${selectedLead.id}...`)}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-subtle)] text-left hover:border-indigo-500 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <strong className="block text-[var(--text-primary)]">Surat Jalan Bus</strong>
                      <span className="text-[10px] text-[var(--text-muted)]">PO Bus & Jadwal Driver</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`Mengunduh Voucher PO Hotel & Resto untuk ${selectedLead.id}...`)}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-subtle)] text-left hover:border-indigo-500 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <strong className="block text-[var(--text-primary)]">Voucher PO Mitra</strong>
                      <span className="text-[10px] text-[var(--text-muted)]">Kamar & Porsi Katering</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                </div>

                {/* Web-Beacon Link for Tour Leader */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
                    <div>
                      <strong className="text-[var(--text-primary)] block">Tautan Web-Beacon GPS Ponsel Kru TL:</strong>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        https://nusatrip.id/track/{selectedLead.id}?beacon=tl-active
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1 text-[11px] h-7"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://nusatrip.id/track/${selectedLead.id}?beacon=tl-active`);
                      alert("Tautan Web-Beacon GPS berhasil disalin ke clipboard! Kirim ke WhatsApp Tour Leader.");
                    }}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin Link Web-Beacon</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
