"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Inbox,
  LayoutDashboard,
  Layers,
  Merge,
  PieChart,
  Users,
  Compass,
  CreditCard,
  History,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useCustomerLeads } from "@/lib/data/tour-store";
import { Logo } from "@/components/ui/logo";

export type AdminTab =
  | "cms-packages"
  | "leads"
  | "overview"
  | "supply-chain"
  | "consolidation"
  | "portfolio"
  | "assignment"
  | "itinerary-catering"
  | "payments"
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
  const collapsed = isCollapsed !== undefined && onToggleCollapse ? isCollapsed : collapsedInternal;
  const toggleCollapse = onToggleCollapse || (() => setCollapsedInternal((prev) => !prev));
  const leads = useCustomerLeads();
  const unhandledLeadsCount = leads.filter((l) => l.status === "baru").length;

  const cmsNavItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
  }[] = [
    {
      id: "cms-packages",
      label: "Kelola Paket Wisata",
      icon: <Briefcase className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "leads",
      label: "Inbox Permintaan Kustom",
      icon: <Inbox className="w-[18px] h-[18px] shrink-0" />,
      badgeCount: unhandledLeadsCount,
    },
  ];

  const solverNavItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "overview",
      label: "Overview DSS",
      icon: <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "supply-chain",
      label: "Rantai Pasok",
      icon: <Layers className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "consolidation",
      label: "Konsolidasi Event",
      icon: <Merge className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "portfolio",
      label: "Seleksi Portofolio",
      icon: <PieChart className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "assignment",
      label: "Penugasan Tim",
      icon: <Users className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "itinerary-catering",
      label: "Itinerary & Katering",
      icon: <Compass className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "payments",
      label: "Simulasi Escrow",
      icon: <CreditCard className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "logs",
      label: "Log Solver Audit",
      icon: <History className="w-[18px] h-[18px] shrink-0" />,
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
            <Logo size="sm" subtitle="CMS & Solver Gate" href="/internal_gate" />
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

        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <div>
            {!collapsed && (
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider px-3 mb-2 block">
                Kelola Landing Page
              </span>
            )}
            <nav className="space-y-1">
              {cmsNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            {!collapsed && (
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2 block">
                Analisis Riset Operasi
              </span>
            )}
            <nav className="space-y-1">
              {solverNavItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)]/40">
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sesi Internal Terverifikasi</span>
          </div>
        </div>
      )}
    </aside>
  );
}
