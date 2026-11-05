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
import type { OptimizationLog } from "@/lib/optimizer/types";

export default function AdminDashboardPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>("overview");
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      {/* Top Header */}
      <AdminHeader />

      {/* Main Workspace with Sidebar + Dynamic Content */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* Navigation Sidebar */}
        <AdminSidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Workspace Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
    </div>
  );
}
