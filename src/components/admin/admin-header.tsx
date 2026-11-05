"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Cpu, ShieldCheck, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const isDarkTheme = document.documentElement.getAttribute("data-theme") === "dark";
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & System Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold tracking-wider text-base shadow-sm">
            NT
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">
              NusaTrip
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-medium">
              DSS Control Center
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[var(--border-subtle)]">
          <Badge variant="brand" icon={<Cpu className="w-3 h-3" />}>
            LP Solver Engine v2.4 Active
          </Badge>
          <Badge variant="success" icon={<ShieldCheck className="w-3 h-3" />}>
            Margin Lock Guard On
          </Badge>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick simulation status */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--surface-subtle)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
          <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
          <span>Simulasi Escrow Terhubung</span>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-[var(--brand-primary-subtle)] border border-[var(--brand-primary)]/30 text-[var(--brand-primary-text)] font-semibold text-xs flex items-center justify-center">
            AD
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Admin Operasional
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Ops Lead & Dispatcher
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
