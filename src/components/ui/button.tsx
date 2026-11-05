"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = "",
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg";

    // Size variants (ensuring minimum 40px/44px touch targets)
    const sizeClasses = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
    }[size];

    // Variant styles matching design token intent
    const variantClasses = {
      primary:
        "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] active:brightness-95 focus-visible:ring-[var(--brand-primary)] shadow-sm",
      secondary:
        "bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] active:brightness-95 focus-visible:ring-[var(--border-strong)] border border-[var(--border-default)]",
      destructive:
        "bg-[var(--status-danger)] text-white hover:bg-[var(--status-danger-hover)] active:brightness-95 focus-visible:ring-[var(--status-danger)] shadow-sm",
      outline:
        "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] active:bg-[var(--surface-sunken)] border border-[var(--border-default)] focus-visible:ring-[var(--brand-primary)]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] active:bg-[var(--surface-sunken)] focus-visible:ring-[var(--brand-primary)]",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
