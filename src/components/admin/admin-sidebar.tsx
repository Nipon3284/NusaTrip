"use client";

import React from "react";
import {
  LayoutDashboard,
  Layers,
  Merge,
  PieChart,
  Users,
  Compass,
  CreditCard,
  History,
  Zap,
} from "lucide-react";

export type AdminTab =
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
}

export function AdminSidebar({ currentTab, onSelectTab }: AdminSidebarProps) {
  const navItems: {
    id: AdminTab;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: "overview",
      label: "Ringkasan Eksekutif",
      subLabel: "KPI & Status Operasional",
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: "supply-chain",
      label: "1. Rantai Pasok Vendor",
      subLabel: "Minimasi Biaya & Armada",
      icon: <Layers className="w-4 h-4 shrink-0" />,
      badge: "Core",
    },
    {
      id: "consolidation",
      label: "2. Konsolidasi Lintas-Event",
      subLabel: "Diskon Volume Kuota",
      icon: <Merge className="w-4 h-4 shrink-0" />,
      badge: "Margin",
    },
    {
      id: "portfolio",
      label: "3. Seleksi Peak Season",
      subLabel: "Knapsack Modal & Tim",
      icon: <PieChart className="w-4 h-4 shrink-0" />,
    },
    {
      id: "assignment",
      label: "4. Penugasan SDM",
      subLabel: "Assignment Guide & Drone",
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: "itinerary-catering",
      label: "5. Itinerary & Katering",
      subLabel: "Knapsack Wisata & Diet",
      icon: <Compass className="w-4 h-4 shrink-0" />,
    },
    {
      id: "payments",
      label: "Simulasi Pembayaran",
      subLabel: "Escrow DP & Settlement",
      icon: <CreditCard className="w-4 h-4 shrink-0" />,
    },
    {
      id: "logs",
      label: "Log Solver Audit",
      subLabel: "Riwayat Eksekusi LP",
      icon: <History className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[var(--surface-card)] border-r border-[var(--border-subtle)] flex flex-col shrink-0">
      {/* Section Tag */}
      <div className="p-4 border-b border-[var(--border-subtle)] hidden lg:block">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <Zap className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span>Modul DSS Linear Prog</span>
        </div>
      </div>

      {/* Nav List */}
      <nav
        aria-label="Menu Admin"
        className="p-2 sm:p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar"
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-colors whitespace-nowrap lg:whitespace-normal select-none ${
                isActive
                  ? "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] font-semibold border border-[var(--brand-primary)]/20 shadow-xs"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`${
                    isActive
                      ? "text-[var(--brand-primary)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate hidden lg:block">
                    {item.subLabel}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase hidden lg:inline-block ${
                    isActive
                      ? "bg-[var(--brand-primary)] text-white"
                      : "bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="mt-auto p-4 border-t border-[var(--border-subtle)] hidden lg:block">
        <div className="bg-[var(--surface-subtle)] p-3 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text-primary)] mb-1">
            Prinsip Agregator
          </p>
          <p className="text-[11px] leading-relaxed">
            Keuntungan NusaTrip murni berasal dari selisih antara nilai kontrak
            klien dengan biaya riil vendor yang dioptimalkan oleh LP Solver.
          </p>
        </div>
      </div>
    </aside>
  );
}
