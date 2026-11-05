"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  tooltip?: string;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
    isPositiveGood?: boolean; // Default: true (up = green, down = red). For costs/churn: false (down = green, up = red)
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  tooltip,
  delta,
  className = "",
}: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isGood = delta
    ? delta.isPositiveGood === false
      ? delta.trend === "down"
      : delta.trend === "up"
    : true;

  const trendColorClass = delta
    ? delta.trend === "neutral"
      ? "text-[var(--text-muted)]"
      : isGood
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-500 dark:text-red-400"
    : "text-[var(--text-muted)]";

  return (
    <div
      className={`rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)] hover:border-indigo-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      {/* Top Row: Metric Label & Info Tooltip */}
      <div className="flex items-center justify-between gap-2 relative">
        <span className="text-[13px] font-medium text-[var(--text-secondary)] tracking-normal">
          {label}
        </span>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              aria-label={`Info untuk ${label}`}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="p-1 rounded-full text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors focus:outline-none"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-6 z-20 w-52 p-2.5 text-[11px] leading-relaxed bg-[var(--surface-card)] text-[var(--text-secondary)] rounded-xl border border-[var(--border-default)] shadow-lg animate-in fade-in duration-150">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="text-2xl sm:text-[28px] font-bold text-[var(--text-primary)] tracking-tight my-2">
        {value}
      </div>

      {/* Bottom Trend / Subtext */}
      <div className="flex items-center gap-1.5 text-xs font-medium">
        {delta && (
          <span className={trendColorClass}>
            {delta.value}
          </span>
        )}
        {delta?.label && (
          <span className="text-[var(--text-muted)] font-normal">
            {delta.label}
          </span>
        )}
        {subValue && !delta && (
          <span className="text-[var(--text-muted)] font-normal">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
