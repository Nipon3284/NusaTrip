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
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/optimizer/seed-data";

interface PaymentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  type: "inbound_dp" | "inbound_settlement" | "outbound_vendor";
  recipientOrSender: string;
  amount: number;
  status: "success" | "pending" | "processing";
  timestamp: string;
}

export function ModulePayments() {
  const [escrowBalance, setEscrowBalance] = useState<number>(142_500_000);
  const [marginLocked, setMarginLocked] = useState<number>(48_200_000);
  const [vendorPayable, setVendorPayable] = useState<number>(64_300_000);

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: "TRX-9941",
      orderId: "ORD-2024-001",
      customerName: "SMA Negeri 3 Semarang",
      type: "inbound_dp",
      recipientOrSender: "Customer (BCA Virtual Account)",
      amount: 36_000_000,
      status: "success",
      timestamp: "Hari ini, 09:14 WIB",
    },
    {
      id: "TRX-9942",
      orderId: "ORD-2024-001",
      customerName: "PO Haryanto",
      type: "outbound_vendor",
      recipientOrSender: "Vendor Armada (Mandiri Escrow Disburse)",
      amount: 11_000_000,
      status: "success",
      timestamp: "Hari ini, 09:30 WIB",
    },
    {
      id: "TRX-9943",
      orderId: "ORD-2024-002",
      customerName: "PT Telkom Indonesia",
      type: "inbound_dp",
      recipientOrSender: "Customer (Corporate Escrow Transfer)",
      amount: 48_000_000,
      status: "success",
      timestamp: "Kemarin, 16:45 WIB",
    },
    {
      id: "TRX-9944",
      orderId: "ORD-2024-002",
      customerName: "Hotel Tentrem Yogyakarta",
      type: "outbound_vendor",
      recipientOrSender: "Vendor Hotel (BNI Instant Settlement)",
      amount: 25_500_000,
      status: "success",
      timestamp: "Kemarin, 17:10 WIB",
    },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);

  // Trigger simulated incoming payment
  const handleSimulatePayment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newAmount = 15_000_000;
      const newTrx: PaymentTransaction = {
        id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: "ORD-2024-007",
        customerName: "Universitas Gadjah Mada (Fisipol)",
        type: "inbound_dp",
        recipientOrSender: "Simulated Midtrans Gateway (BCA QRIS)",
        amount: newAmount,
        status: "success",
        timestamp: "Baru saja",
      };

      setTransactions((prev) => [newTrx, ...prev]);
      setEscrowBalance((prev) => prev + newAmount);
      setMarginLocked((prev) => prev + newAmount * 0.32); // 32% margin
      setVendorPayable((prev) => prev + newAmount * 0.68);
      setIsSimulating(false);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface-card)] p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-4 h-4" />
            <span>Escrow & Kliring Margin</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
            Simulasi Pembayaran & Margin Terkunci
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl">
            Penerimaan DP pelanggan, penguncian saldo biaya vendor, dan pencairan margin laba bersih.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          isLoading={isSimulating}
          onClick={handleSimulatePayment}
          leftIcon={<ArrowDownLeft className="w-4 h-4" />}
        >
          Simulasikan Masuk DP
        </Button>
      </div>

      {/* Escrow & Margin Cards */}
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
            <div className="text-3xl font-bold text-[var(--text-primary)]">
              {formatRupiah(escrowBalance)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Dana aman dari seluruh DP pemesanan aktif
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--status-success)]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--status-success-text)] uppercase tracking-wider">
              Laba Bersih Terkunci (Nett Margin)
            </span>
            <div className="p-2 rounded-lg bg-[var(--status-success-subtle)] text-[var(--status-success-text)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[var(--status-success-text)]">
              {formatRupiah(marginLocked)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Keuntungan riil yang sudah diamankan LP Solver
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
            <div className="text-3xl font-bold text-[var(--text-secondary)]">
              {formatRupiah(vendorPayable)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              DP & pelunasan terjadwal ke PO Bus, Hotel, Resto
            </p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <Card padding="none">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Arus Kas & Buku Pembayaran Simulasi
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Pemisahan otomatis antara penerimaan klien dan pengeluaran vendor di lapangan
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
                    {trx.type === "inbound_dp" ? (
                      <span className="inline-flex items-center gap-1 text-[var(--status-success-text)] font-semibold">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>DP Masuk</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Sewa Vendor</span>
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      trx.type === "inbound_dp"
                        ? "text-[var(--status-success-text)]"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {trx.type === "inbound_dp" ? "+" : "-"}
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
