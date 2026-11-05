"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Bell,
  Plus,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  currentTabName?: string;
  onOpenAddModal?: () => void;
}

export function AdminHeader({
  currentTabName = "Analitik & Optimasi",
  onOpenAddModal,
}: AdminHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    const isDarkTheme =
      document.documentElement.getAttribute("data-theme") === "dark";
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
    <header className="h-16 px-6 lg:px-8 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
        <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
          NusaTrip
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
        <span className="text-[var(--text-primary)] font-semibold">
          {currentTabName}
        </span>
      </div>

      {/* Right Controls Area (Add Data, Notifications, Theme, Profile) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* "+ Tambah Data" Primary Gradient Action Button */}
        <Button
          variant="gradient"
          size="sm"
          pill={true}
          onClick={onOpenAddModal}
          rightIcon={<Plus className="w-3.5 h-3.5" />}
          className="font-semibold text-xs px-4 shadow-sm"
        >
          <span>Tambah Data</span>
        </Button>

        {/* Notification Bell with indicator dot */}
        <button
          type="button"
          onClick={() => setHasUnread(false)}
          aria-label="Pemberitahuan sistem"
          className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
        >
          <Bell className="w-[18px] h-[18px]" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[var(--surface-card)]" />
          )}
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
        >
          {isDark ? (
            <Sun className="w-[18px] h-[18px] text-amber-400" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-[var(--text-muted)]" />
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-[var(--border-subtle)]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-100 dark:ring-indigo-900 shadow-2xs">
              AD
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[var(--surface-card)]" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
              Advan Tri
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Lead Dispatcher
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
