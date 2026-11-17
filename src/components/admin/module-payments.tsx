"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Building2,
  Lock,
  Wallet,
  Receipt,
  Plus,
  Send,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/select";
import { formatRupiah } from "@/lib/optimizer/seed-data";
import { useLeads, addLeadFieldExpense } from "@/lib/data/tour-store";
import type { FieldExpenseItem } from "@/lib/data/tour-data";

interface PaymentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  type: "inbound_dp" | "inbound_settlement" | "outbound_vendor" | "outbound_petty_cash";
  recipientOrSender: string;
  amount: number;
  status: "success" | "pending" | "processing";
  timestamp: string;
}

export function ModulePayments() {
  const leads = useLeads();
  const [escrowBalance, setEscrowBalance] = useState<number>(142_500_000);
  const [marginLocked, setMarginLocked] = useState<number>(48_200_000);
  const [vendorPayable, setVendorPayable] = useState<number>(64_300_000);

  // Active event for petty cash & settlement
  const activeEvent = leads.find((l) => l.status === "final_h7") || leads[0];

  // Petty cash expense form
  const [reporterName, setReporterName] = useState<string>("Budi Santoso (TL)");
  const [expenseCategory, setExpenseCategory] = useState<FieldExpenseItem["category"]>("Parkir & Retribusi");
  const [expenseAmount, setExpenseAmount] = useState<number>(75000);
  const [expenseNote, setExpenseNote] = useState<string>("Parkir Bus 1 & Bus 2 di Rest Area Sleman");

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: "TRX-9941",
      orderId: "ORD-H7-7721",
      customerName: "SMAN 1 Surakarta",
      type: "inbound_dp",
      recipientOrSender: "Customer (BCA Virtual Account 50% DP)",
      amount: 36_000_000,
      status: "success",
      timestamp: "Hari ini, 08:30 WIB",
    },
    {
      id: "TRX-9942",
      orderId: "ORD-H7-7721",
      customerName: "Budi Santoso (Tour Leader)",
      type: "outbound_petty_cash",
      recipientOrSender: "Uang Jalan H-2 Lapangan (Bank Mandiri)",
      amount: 1_500_000,
      status: "success",
      timestamp: "Hari ini, 09:15 WIB",
    },
    {
      id: "TRX-9943",
      orderId: "ORD-H7-7721",
      customerName: "PO Haryanto Pariwisata",
      type: "outbound_vendor",
      recipientOrSender: "Vendor Armada Bus (Disburse 50% DP)",
      amount: 11_000_000,
      status: "success",
      timestamp: "Kemarin, 14:00 WIB",
    },
    {
      id: "TRX-9944",
      orderId: "LEAD-9012",
      customerName: "PT Nusantara Prima Mandiri",
      type: "inbound_dp",
      recipientOrSender: "Customer (Corporate Escrow Booking)",
      amount: 25_000_000,
      status: "success",
      timestamp: "Kemarin, 16:45 WIB",
    },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);

  // Trigger simulated incoming payment
  const handleSimulatePayment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newAmount = 18_000_000;
      const newTrx: PaymentTransaction = {
        id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: "ORD-H7-7721",
        customerName: "SMAN 1 Surakarta (Pelunasan 100%)",
        type: "inbound_settlement",
        recipientOrSender: "Midtrans Payment Gateway (BNI VA)",
        amount: newAmount,
        status: "success",
        timestamp: "Baru saja",
      };

      setTransactions((prev) => [newTrx, ...prev]);
      setEscrowBalance((prev) => prev + newAmount);
      setMarginLocked((prev) => prev + newAmount * 0.3);
      setVendorPayable((prev) => prev + newAmount * 0.7);
      setIsSimulating(false);
    }, 450);
  };

  const handleAddIncidental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || expenseAmount <= 0) return;

    const newExpense: FieldExpenseItem = {
      id: `fe-${Date.now()}`,
      reporter: reporterName,
      category: expenseCategory,
      amount: expenseAmount,
      receiptNote: expenseNote,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    addLeadFieldExpense(activeEvent.id, newExpense);
    setExpenseNote("");
    setExpenseAmount(50000);
  };

  const fieldExpenses = activeEvent?.fieldExpenses || [];
  const initialPetty = activeEvent?.pettyCashInitial || 1500000;
  const totalFieldSpent = fieldExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingPetty = initialPetty - totalFieldSpent;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-4 h-4" />
            <span>Riset Operasi &bull; Modul 6 (Kas Kecil & Kliring Margin)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Manajemen Uang Jalan H-2, Rekap Nota WhatsApp & P&L Real-Time
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
            Penyaluran dana operasional lapangan ke Tour Leader, pencatatan nota insidental lapangan (ban/retribusi/medis), dan kalkulator settlement H+1 pengembalian kas sisa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="gradient"
            size="md"
            isLoading={isSimulating}
            onClick={handleSimulatePayment}
            className="gap-2 text-xs font-semibold"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Simulasikan Pelunasan Klien</span>
          </Button>
        </div>
      </div>

      {/* 3 High-Impact Cashflow Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Total Saldo Escrow NusaTrip
            </span>
            <div className="p-2 rounded-lg bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {formatRupiah(escrowBalance)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Dana aman dari seluruh DP pemesanan aktif
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Laba Bersih Terkunci (Nett Margin LP)
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatRupiah(marginLocked)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Keuntungan riil yang sudah diamankan setelah biaya vendor
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Kewajiban Sewa Vendor (Payable)
            </span>
            <div className="p-2 rounded-lg bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-secondary)]">
              {formatRupiah(vendorPayable)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              DP & pelunasan terjadwal ke PO Bus, Hotel, Restoran
            </p>
          </div>
        </div>
      </div>

      {/* Centralized Petty Cash (Uang Jalan H-2) & Incidentals Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Event Petty Cash Status & Calculator (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Kas Kecil Lapangan (Uang Jalan H-2)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Event: {activeEvent?.institution || activeEvent?.name} ({activeEvent?.id})
              </p>
            </div>
            <Badge variant="brand" size="sm">H-2 Disalurkan</Badge>
          </div>

          {/* Settlement Breakdown Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Plafon Kas Awal (Disalurkan H-2):</span>
              <span className="font-bold text-[var(--text-primary)]">{formatRupiah(initialPetty)}</span>
            </div>
            <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
              <span>Total Insidental Terpakai (Nota WA):</span>
              <span className="font-bold">-{formatRupiah(totalFieldSpent)}</span>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center">
              <div>
                <span className="font-bold text-[var(--text-primary)] block">Sisa Kas Wajib Disetor (Settlement H+1):</span>
                <span className="text-[10px] text-[var(--text-muted)]">Rekening Tour Leader Budi Santoso</span>
              </div>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(remainingPetty)}
              </span>
            </div>
          </div>

          {/* Form: Simulasikan Input Nota WhatsApp dari Lapangan */}
          <form onSubmit={handleAddIncidental} className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-indigo-500" />
              <span>Input Nota Insidental WhatsApp Baru:</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] font-medium mb-1 block">
                  Petugas Pelapor
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <CustomSelect
                  id="expense-category-select"
                  label="Kategori Biaya"
                  value={expenseCategory}
                  onChange={(val) => setExpenseCategory(val as any)}
                  options={[
                    { value: "Ban & Kendaraan", label: "Ban & Kendaraan" },
                    { value: "Parkir & Retribusi", label: "Parkir & Retribusi" },
                    { value: "Obat & Medis", label: "Obat & Medis" },
                    { value: "Konsumsi Darurat", label: "Konsumsi Darurat" },
                    { value: "Lain-lain", label: "Lain-lain" },
                  ]}
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-[11px] text-[var(--text-muted)] font-medium mb-1 block">
                Nominal Nota (Rp)
              </label>
              <input
                type="number"
                step={5000}
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-bold text-[var(--text-primary)]"
              />
            </div>

            <div className="text-xs">
              <label className="text-[11px] text-[var(--text-muted)] font-medium mb-1 block">
                Keterangan / Rincian Pengeluaran
              </label>
              <input
                type="text"
                placeholder="Contoh: Tambal ban bus, beli obat demam..."
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <Button type="submit" variant="gradient" size="sm" className="w-full gap-1.5 text-xs font-semibold mt-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Rekam Pengeluaran Insidental</span>
            </Button>
          </form>
        </div>

        {/* Right Column: Live WhatsApp Expense Feed & Ledger (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Log Nota Pengeluaran Insidental Lapangan (WhatsApp Live Feed)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Setiap foto nota & bukti bayar diverifikasi sebelum kliring H+1
                </p>
              </div>
              <Badge variant="cyan" size="sm">
                {fieldExpenses.length} Nota Tercatat
              </Badge>
            </div>

            {fieldExpenses.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-default)] rounded-xl">
                Belum ada nota insidental lapangan yang dilaporkan untuk event ini.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {fieldExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-indigo-600 mt-0.5">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">{exp.receiptNote}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          Pelapor: <strong className="text-[var(--text-secondary)]">{exp.reporter}</strong> &bull; Waktu: {exp.time}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">
                        -{formatRupiah(exp.amount)}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Terverifikasi
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Standar Bukti: Foto Nota Asli + Stempel SPBU/Rest Area</span>
            <span className="font-mono text-emerald-600">Audit Trail: READY</span>
          </div>
        </div>
      </div>

      {/* Arus Kas & Buku Pembayaran Simulasi */}
      <Card padding="none">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Arus Kas & Buku Pembayaran Simulasi
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Pemisahan otomatis antara penerimaan klien, sewa vendor, dan kas kecil lapangan
            </p>
          </div>
          <Badge variant="brand">Simulasi Gateway Aktif</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Entitas</th>
                <th className="py-3 px-4">Kanal Pembayaran</th>
                <th className="py-3 px-4 text-center">Tipe Arus Kas</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Waktu</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-[var(--surface-subtle)]/60">
                  <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                    {trx.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                    {trx.customerName}
                    <span className="block text-[10px] text-[var(--text-muted)] font-normal">
                      {trx.orderId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">
                    {trx.recipientOrSender}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {trx.type === "inbound_dp" || trx.type === "inbound_settlement" ? (
                      <span className="inline-flex items-center gap-1 text-[var(--status-success-text)] font-semibold">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>{trx.type === "inbound_dp" ? "DP Masuk" : "Pelunasan"}</span>
                      </span>
                    ) : trx.type === "outbound_petty_cash" ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Uang Jalan H-2</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Sewa Vendor</span>
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      trx.type.startsWith("inbound")
                        ? "text-[var(--status-success-text)]"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {trx.type.startsWith("inbound") ? "+" : "-"}
                    {formatRupiah(trx.amount)}
                  </td>
                  <td className="py-3 px-4 text-center text-[var(--text-muted)]">
                    {trx.timestamp}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success">Berhasil</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}