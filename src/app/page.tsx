"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar, type AdminTab } from "@/components/admin/admin-sidebar";
import { ModuleOverview } from "@/components/admin/module-overview";
import { ModuleSupplyChain } from "@/components/admin/module-supply-chain";
import { ModuleConsolidation } from "@/components/admin/module-consolidation";
import { ModulePortfolio } from "@/components/admin/module-portfolio";
import { ModuleAssignment } from "@/components/admin/module-assignment";
import { ModuleItineraryCatering } from "@/components/admin/module-itinerary-catering";
import { ModulePayments } from "@/components/admin/module-payments";
import { ModuleLogs } from "@/components/admin/module-logs";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Layers, Merge, PieChart, Sparkles, CheckCircle2 } from "lucide-react";
import type { OptimizationLog } from "@/lib/optimizer/types";

export default function AdminDashboardPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalSuccess, setAddModalSuccess] = useState(false);

  const [logs, setLogs] = useState<OptimizationLog[]>([
    {
      id: "log-seed-01",
      orderId: "ORD-2024-001",
      type: "supply_chain",
      input: { pax: 120, serviceLevel: "standard" },
      result: { totalCost: 54000000, margin: 18000000 },
      feasible: true,
      totalOptimizedCost: 54_000_000,
      marginAchieved: 18_000_000,
      solverTimeMs: 14,
      createdAt: "14:15:20",
      createdBy: "Admin Operasional",
    },
    {
      id: "log-seed-02",
      orderId: "CROSS-CONSOL-01",
      type: "consolidation",
      input: { totalPax: 245, discount: "40%" },
      result: { totalSavings: 3825000 },
      feasible: true,
      totalOptimizedCost: 11_025_000,
      marginAchieved: 3_825_000,
      solverTimeMs: 22,
      createdAt: "14:28:10",
      createdBy: "Admin Operasional",
    },
  ]);

  const handleAddLog = (newLog: OptimizationLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const tabLabels: Record<AdminTab, string> = {
    overview: "Analitik & Ringkasan Eksekutif",
    "supply-chain": "Rantai Pasok & Minimasi Biaya",
    consolidation: "Konsolidasi Kuota Lintas-Event",
    portfolio: "Seleksi Portofolio Peak Season",
    assignment: "Penugasan Kru & SDM Lapangan",
    "itinerary-catering": "Optimasi Itinerary & Katering",
    payments: "Simulasi Escrow & Pembayaran",
    logs: "Log Solver Audit Riset Operasi",
  };

  const handleQuickLaunch = (targetTab: AdminTab) => {
    setCurrentTab(targetTab);
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[var(--surface-page)] text-[var(--text-primary)]">
      {/* Sleek Vertical Navigation Rail (Matches Reference Image) */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main App Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header with Breadcrumbs & Action Controls */}
        <AdminHeader
          currentTabName={tabLabels[currentTab]}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Dynamic Scrollable Content Canvas */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-y-auto">
          {currentTab === "overview" && (
            <ModuleOverview onSelectTab={setCurrentTab} />
          )}

          {currentTab === "supply-chain" && (
            <ModuleSupplyChain onLogAdd={handleAddLog} />
          )}

          {currentTab === "consolidation" && (
            <ModuleConsolidation onLogAdd={handleAddLog} />
          )}

          {currentTab === "portfolio" && (
            <ModulePortfolio onLogAdd={handleAddLog} />
          )}

          {currentTab === "assignment" && (
            <ModuleAssignment onLogAdd={handleAddLog} />
          )}

          {currentTab === "itinerary-catering" && (
            <ModuleItineraryCatering onLogAdd={handleAddLog} />
          )}

          {currentTab === "payments" && <ModulePayments />}

          {currentTab === "logs" && <ModuleLogs logs={logs} />}
        </main>
      </div>

      {/* "Tambah Data / Simulasi Baru" Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalSuccess(false);
        }}
        title="Buat Simulasi & Optimasi Baru"
        description="Pilih modul riset operasi yang ingin Anda jalankan untuk event atau paket perjalanan baru"
        maxWidth="md"
      >
        <div className="flex flex-col gap-3 py-2">
          <button
            type="button"
            onClick={() => handleQuickLaunch("supply-chain")}
            className="p-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Optimasi Biaya Pasok Vendor
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Hitung sewa bus, hotel, dan konsumsi paling hemat via Simplex
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLaunch("consolidation")}
            className="p-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-cyan-300 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                <Merge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Konsolidasi Kuota Peserta
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Gabungkan kuota cross-event untuk klaim diskon grosir vendor
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLaunch("portfolio")}
            className="p-3.5 rounded-xl border border-[var(--border-subtle)] hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Seleksi Portofolio Peak Season
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Maksimalkan profit marjinal di bawah batas modal kas dan SDM
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </Modal>
    </div>
  );
}
