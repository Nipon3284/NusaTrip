"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  Merge,
  PieChart,
  Users,
  Compass,
  CreditCard,
  History,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
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

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    hasSubmenu?: boolean;
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      id: "supply-chain",
      label: "Rantai Pasok",
      icon: <Layers className="w-[18px] h-[18px] shrink-0" />,
      hasSubmenu: true,
    },
    {
      id: "consolidation",
      label: "Konsolidasi Event",
      icon: <Merge className="w-[18px] h-[18px] shrink-0" />,
      hasSubmenu: true,
    },
    {
      id: "portfolio",
      label: "Seleksi Portofolio",
      icon: <PieChart className="w-[18px] h-[18px] shrink-0" />,
      hasSubmenu: true,
    },
    {
      id: "assignment",
      label: "Penugasan Tim",
      icon: <Users className="w-[18px] h-[18px] shrink-0" />,
      hasSubmenu: true,
    },
    {
      id: "itinerary-catering",
      label: "Itinerary & Katering",
      icon: <Compass className="w-[18px] h-[18px] shrink-0" />,
      hasSubmenu: true,
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
      className={`h-screen sticky top-0 bg-[var(--surface-card)] border-r border-[var(--border-subtle)] flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Brand Bar */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-[var(--border-subtle)]">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              {/* Electric Violet Logo Squircle */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-indigo-500/25">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-[var(--text-primary)] tracking-tight">
                NusaTrip
              </span>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          )}

          {/* Collapse/Expand Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Perlebar menu samping" : "Perkecil menu samping"}
            className={`p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors focus:outline-none ${
              collapsed ? "hidden" : "block"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-3 space-y-1.5" aria-label="Menu Utama">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl transition-all duration-150 group text-left ${
                  collapsed ? "justify-center px-0 py-2.5" : "px-3.5 py-2.5 justify-between"
                } ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-2xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-xs tracking-normal truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {!collapsed && item.hasSubmenu && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-[var(--text-subtle)] group-hover:text-[var(--text-muted)]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer (Settings & Help) */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
        <button
          type="button"
          onClick={() => onSelectTab("overview")}
          className={`w-full flex items-center rounded-xl py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors ${
            collapsed ? "justify-center px-0" : "px-3.5 gap-3"
          }`}
          title={collapsed ? "Pengaturan" : undefined}
        >
          <Settings className="w-[18px] h-[18px] text-[var(--text-muted)]" />
          {!collapsed && <span className="text-xs font-medium">Pengaturan</span>}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("overview")}
          className={`w-full flex items-center rounded-xl py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors ${
            collapsed ? "justify-center px-0" : "px-3.5 gap-3"
          }`}
          title={collapsed ? "Bantuan" : undefined}
        >
          <HelpCircle className="w-[18px] h-[18px] text-[var(--text-muted)]" />
          {!collapsed && <span className="text-xs font-medium">Bantuan</span>}
        </button>

        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Perlebar menu samping"
            className="w-full flex items-center justify-center py-2 text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
