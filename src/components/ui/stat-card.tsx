"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: React.ReactNode;
  isLead?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  delta,
  icon,
  isLead = false,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        isLead
          ? "bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-subtle)] border-[var(--brand-primary)]/40 p-6 shadow-md ring-1 ring-[var(--brand-primary)]/10"
          : "bg-[var(--surface-card)] border-[var(--border-subtle)] p-5 shadow-xs"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isLead ? "text-[var(--brand-primary-text)]" : "text-[var(--text-muted)]"
          }`}
        >
          {label}
        </span>
        {icon && (
          <div
            className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
              isLead
                ? "bg-[var(--brand-primary)] text-white shadow-xs"
                : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            }`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div
          className={`font-bold tracking-tight text-[var(--text-primary)] ${
            isLead ? "text-3xl lg:text-4xl" : "text-2xl"
          }`}
        >
          {value}
        </div>

        {(subValue || delta) && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {delta && (
              <span
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
                  delta.trend === "up"
                    ? "bg-[var(--status-success-subtle)] text-[var(--status-success-text)]"
                    : delta.trend === "down"
                    ? "bg-[var(--status-danger-subtle)] text-[var(--status-danger-text)]"
                    : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                }`}
              >
                {delta.trend === "up" && <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />}
                {delta.trend === "down" && <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />}
                {delta.trend === "neutral" && <Minus className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{delta.value}</span>
              </span>
            )}
            {subValue && (
              <span className="text-[var(--text-muted)]">{subValue}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
