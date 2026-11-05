"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "sunken" | "subtle" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const bgStyles = {
    default: "bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]",
    sunken: "bg-[var(--surface-sunken)] border border-[var(--border-default)]",
    subtle: "bg-[var(--surface-subtle)] border border-[var(--border-subtle)]",
    elevated: "bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-hover)]",
  }[variant];

  const paddingStyles = {
    none: "p-0",
    sm: "p-3.5 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  }[padding];

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${bgStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)] ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
