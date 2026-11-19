"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AdminSidebar, type AdminTab } from "@/components/admin/admin-sidebar";
import { ModuleCmsPackages } from "@/components/admin/module-cms-packages";
import { ModuleLeads } from "@/components/admin/module-leads";
import { ModuleOverview } from "@/components/admin/module-overview";
import { ModuleLpOptimizer } from "@/components/admin/module-lp-optimizer";
import { ModuleSupplyChain } from "@/components/admin/module-supply-chain";
import { ModuleConsolidation } from "@/components/admin/module-consolidation";
import { ModulePortfolio } from "@/components/admin/module-portfolio";
import { ModuleAssignment } from "@/components/admin/module-assignment";
import { ModuleItineraryCatering } from "@/components/admin/module-itinerary-catering";
import { ModulePayments } from "@/components/admin/module-payments";
import { ModuleLogs } from "@/components/admin/module-logs";
import { saveCustomerLeads } from "@/lib/data/tour-store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  ShieldCheck,
  KeyRound,
  UserCheck,
  LogOut,
} from "lucide-react";
import type { OptimizationLog } from "@/lib/optimizer/types";

// Dynamic import untuk module peta GIS (Google Maps Platform) agar tidak memberatkan chunk awal & bebas SSR error
const ModuleMitraMapping = dynamic(
  () => import("@/components/admin/module-mitra-mapping").then((mod) => mod.ModuleMitraMapping),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex flex-col items-center justify-center p-8 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-3">
        <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold text-[var(--text-secondary)]">Menghubungkan Peta Mitra & GIS...</p>
      </div>
    ),
  }
);

export default function InternalGatePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [employeeId, setEmployeeId] = useState("");
  const [secretPin, setSecretPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentTab, setCurrentTab] = useState<AdminTab>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [logs, setLogs] = useState<OptimizationLog[]>([]);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        const authed = Boolean(data.authenticated);
        setIsAuthenticated(authed);
        if (authed) {
          fetch("/api/leads")
            .then((r) => (r.ok ? r.json() : null))
            .then((leadData) => {
              if (leadData && Array.isArray(leadData.leads) && leadData.leads.length > 0) {
                saveCustomerLeads(leadData.leads);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, secretPin }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetch("/api/leads")
          .then((r) => (r.ok ? r.json() : null))
          .then((leadData) => {
            if (leadData && Array.isArray(leadData.leads) && leadData.leads.length > 0) {
              saveCustomerLeads(leadData.leads);
            }
          })
          .catch(() => {});
      } else {
        setAuthError(data.message || "ID Pegawai atau PIN Otorisasi tidak valid");
      }
    } catch {
      setAuthError("Gagal terhubung ke layanan verifikasi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {}
    setIsAuthenticated(false);
  };

  const handleAddLog = (log: OptimizationLog) => {
    setLogs((prev) => [log, ...prev]);
  };

  const tabLabels: Record<AdminTab, string> = {
    overview: "Analitik & Ringkasan Eksekutif",
    "mitra-mapping": "Manajemen Zona Wilayah & Peta Mitra (GIS)",
    "lp-optimizer": "Rekomendasi Paket Wisata Cerdas (Linear Programming)",
    leads: "Inbox Permintaan Kustom & Negosiasi",
    payments: "Manajemen Escrow & Kas Lapangan",
    "cms-packages": "Kelola Paket Wisata (Landing Page CMS)",
    "supply-chain": "Rantai Pasok & Minimasi Biaya Vendor (Simplex)",
    consolidation: "Konsolidasi Event Wisata & Kapasitas Bus",
    portfolio: "Seleksi Portofolio Paket Wisata (Knapsack)",
    assignment: "Penugasan Kru & Tour Leader (Hungarian Method)",
    "itinerary-catering": "Rute Wisata & Katering Harian",
    logs: "Audit Log & Jejak Riwayat Solver",
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center">
        <div className="text-xs text-[var(--text-secondary)] font-medium animate-pulse">
          Memverifikasi status sesi gerbang internal...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size="lg" subtitle="Pusat Otorisasi Internal" href="" className="flex-col items-center gap-2 mb-2" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              Gerbang Akses Pegawai
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
              Portal internal terproteksi cookie sesi server untuk mengelola katalog landing page dan engine riset operasi.
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-employee-id" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                ID Pegawai
              </label>
              <div className="relative">
                <input
                  id="admin-employee-id"
                  name="employeeId"
                  type="text"
                  required
                  placeholder="Masukkan admin"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <UserCheck className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label htmlFor="admin-secret-pin" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                PIN Akses Otorisasi
              </label>
              <div className="relative">
                <input
                  id="admin-secret-pin"
                  name="secretPin"
                  type="password"
                  required
                  placeholder="Masukkan 123456"
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <KeyRound className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              className="w-full h-11 font-medium mt-2"
            >
              Buka Akses Dashboard
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Koneksi aman HttpOnly cookie token</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--surface-page)] text-[var(--text-primary)]">
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 px-6 lg:px-8 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] flex items-center justify-between sticky top-0 z-20">
          <div className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">
              {tabLabels[currentTab]}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Gate</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-y-auto">
          {currentTab === "overview" && <ModuleOverview onSelectTab={setCurrentTab} />}
          {currentTab === "mitra-mapping" && <ModuleMitraMapping />}
          {currentTab === "lp-optimizer" && <ModuleLpOptimizer onSelectTab={setCurrentTab} />}
          {currentTab === "leads" && <ModuleLeads onSelectTab={setCurrentTab} />}
          {currentTab === "payments" && <ModulePayments />}
          {currentTab === "cms-packages" && <ModuleCmsPackages />}
          {currentTab === "supply-chain" && <ModuleSupplyChain onLogAdd={handleAddLog} />}
          {currentTab === "consolidation" && <ModuleConsolidation onLogAdd={handleAddLog} />}
          {currentTab === "portfolio" && <ModulePortfolio onLogAdd={handleAddLog} />}
          {currentTab === "assignment" && <ModuleAssignment onLogAdd={handleAddLog} />}
          {currentTab === "itinerary-catering" && <ModuleItineraryCatering onLogAdd={handleAddLog} />}
          {currentTab === "logs" && <ModuleLogs logs={logs} />}
        </main>
      </div>
    </div>
  );
}
