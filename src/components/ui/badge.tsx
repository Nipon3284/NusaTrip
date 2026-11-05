"use client";

import React from "react";

export type BadgeVariant =
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  icon,
  className = "",
}: BadgeProps) {
  const variantStyles = {
    brand:
      "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary-text)] border-[var(--brand-primary)]/20",
    success:
      "bg-[var(--status-success-subtle)] text-[var(--status-success-text)] border-[var(--status-success)]/20",
    warning:
      "bg-[var(--status-warning-subtle)] text-[var(--status-warning-text)] border-[var(--status-warning)]/20",
    danger:
      "bg-[var(--status-danger-subtle)] text-[var(--status-danger-text)] border-[var(--status-danger)]/20",
    neutral:
      "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${variantStyles} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
