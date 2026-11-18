"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Inbox,
  LayoutDashboard,
  Layers,
  MapPin,
  Cpu,
  Merge,
  PieChart,
  Users,
  Compass,
  CreditCard,
  History,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useCustomerLeads } from "@/lib/data/tour-store";
import { Logo } from "@/components/ui/logo";

export type AdminTab =
  | "overview"
  | "mitra-mapping"
  | "lp-optimizer"
  | "leads"
  | "payments"
  | "cms-packages"
  | "supply-chain"
  | "consolidation"
  | "portfolio"
  | "assignment"
  | "itinerary-catering"
  | "logs";

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  currentTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const [collapsedInternal, setCollapsedInternal] = useState(false);
  const [showOptimizationModules, setShowOptimizationModules] = useState(false);
  const collapsed = isCollapsed !== undefined && onToggleCollapse ? isCollapsed : collapsedInternal;
  const toggleCollapse = onToggleCollapse || (() => setCollapsedInternal((prev) => !prev));
  
  const leads = useCustomerLeads();
  const unhandledLeadsCount = leads.filter((l) => l.status === "baru").length;
  const h7AlertCount = leads.filter((l) => l.h7Alert || l.status === "final_h7").length;

  // Primary Navigation Group: Matches User Mockup & Real Business Workflow
  const mainNavItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeVariant?: "rose" | "amber";
  }[] = [
    {
      id: "overview",
      label: "Dasbor & Radar H-7",
      icon: <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />,
      badgeCount: h7AlertCount,
      badgeVariant: "amber",
    },
    {
      id: "mitra-mapping",
      label: "Zona & Peta Mitra (GIS)",
      icon: <MapPin className="w-[18px] h-[18px] shrink-0 text-cyan-500" />,
    },
    {
      id: "lp-optimizer",
      label: "Rekomendasi Paket LP",
      icon: <Cpu className="w-[18px] h-[18px] shrink-0 text-indigo-500" />,
    },
    {
      id: "leads",
      label: "Pesanan & Nego CRM",
      icon: <Inbox className="w-[18px] h-[18px] shrink-0" />,
      badgeCount: unhandledLeadsCount,
      badgeVariant: "rose",
    },
    {
      id: "payments",
      label: "Keuangan & Kas Lapangan",
      icon: <CreditCard className="w-[18px] h-[18px] shrink-0 text-emerald-500" />,
    },
    {
      id: "cms-packages",
      label: "Katalog Wisata Publik",
      icon: <Briefcase className="w-[18px] h-[18px] shrink-0 text-amber-500" />,
    },
  ];

  // Secondary Solvers (Audited - Kept as secondary tools without cluttering)
  const optimizationNavItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "supply-chain",
      label: "Rantai Pasok (ILP)",
      icon: <Layers className="w-4 h-4 shrink-0 text-indigo-400" />,
    },
    {
      id: "consolidation",
      label: "Konsolidasi Kuota",
      icon: <Merge className="w-4 h-4 shrink-0 text-cyan-400" />,
    },
    {
      id: "portfolio",
      label: "Portofolio Knapsack",
      icon: <PieChart className="w-4 h-4 shrink-0 text-purple-400" />,
    },
    {
      id: "assignment",
      label: "Penugasan Kru & SPK",
      icon: <Users className="w-4 h-4 shrink-0 text-emerald-400" />,
    },
    {
      id: "itinerary-catering",
      label: "Rundown & Katering",
      icon: <Compass className="w-4 h-4 shrink-0 text-amber-400" />,
    },
    {
      id: "logs",
      label: "Log Solver Audit",
      icon: <History className="w-4 h-4 shrink-0 text-slate-400" />,
    },
  ];

  return (
    <aside
      className={`h-screen bg-[var(--surface-card)] border-r border-[var(--border-subtle)] flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
          {!collapsed ? (
            <Logo size="sm" subtitle="Admin & LP Solver" href="/internal_gate" />
          ) : (
            <Logo size="sm" showText={false} href="/internal_gate" className="mx-auto" />
          )}

          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            aria-label={collapsed ? "Perluas menu sidebar" : "Ciutkan menu sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Main Operational Navigation */}
          <div>
            {!collapsed && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-3 mb-2 block">
                Operasional & Mitra
              </span>
            )}
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                      <span
                        className={`ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-white text-indigo-700"
                            : item.badgeVariant === "amber"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Expandable Secondary Solvers */}
          {!collapsed && (
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowOptimizationModules(!showOptimizationModules)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors"
              >
                <span>Modul Optimasi Solver Riset Operasi</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showOptimizationModules ? "rotate-180" : ""}`}
                />
              </button>

              {showOptimizationModules && (
                <nav className="space-y-0.5 mt-1 animate-in fade-in duration-150">
                  {optimizationNavItems.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
                            : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-[var(--surface-subtle)] text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-[var(--text-primary)] block">LP Engine: Siaga</span>
              <span className="text-[10px] text-[var(--text-muted)]">Database Mitra Terhubung</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2 text-emerald-600" title="Sesi Terotentikasi">
            <ShieldCheck className="w-5 h-5" />
          </div>
        )}
      </div>
    </aside>
  );
}
