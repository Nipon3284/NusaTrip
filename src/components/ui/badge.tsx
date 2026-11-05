"use client";

import React from "react";

export type BadgeVariant =
  | "brand"
  | "indigo"
  | "cyan"
  | "purple"
  | "rose"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  icon,
  className = "",
  size = "md",
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    brand:
      "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] border border-[var(--brand-primary)]/20",
    indigo:
      "bg-indigo-50 text-indigo-700 border border-indigo-100/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/40",
    cyan:
      "bg-cyan-50 text-cyan-700 border border-cyan-100/80 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900/40",
    purple:
      "bg-purple-50 text-purple-700 border border-purple-100/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/40",
    rose:
      "bg-rose-50 text-rose-600 border border-rose-100/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/40",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-100/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/40",
    warning:
      "bg-amber-50 text-amber-700 border border-amber-100/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/40",
    danger:
      "bg-red-50 text-red-600 border border-red-100/80 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/40",
    neutral:
      "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
