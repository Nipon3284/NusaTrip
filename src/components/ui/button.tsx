"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "gradient"
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
  pill?: boolean;
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
      pill = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClasses = `inline-flex flex-row items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      pill ? "rounded-full" : "rounded-xl"
    }`;

    const sizeClasses = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
    }[size];

    const variantClasses = {
      primary:
        "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] active:scale-[0.98] focus-visible:ring-[var(--brand-primary)] shadow-sm",
      gradient:
        "bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white hover:opacity-95 active:scale-[0.98] focus-visible:ring-indigo-500 shadow-sm shadow-indigo-500/20",
      secondary:
        "bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-default)] active:scale-[0.98] focus-visible:ring-[var(--border-strong)] border border-[var(--border-default)]",
      destructive:
        "bg-[var(--status-danger)] text-white hover:bg-[var(--status-danger-hover)] active:scale-[0.98] focus-visible:ring-[var(--status-danger)] shadow-sm",
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
            <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" aria-hidden="true" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
            {typeof children === "string" ? <span>{children}</span> : children}
            {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
