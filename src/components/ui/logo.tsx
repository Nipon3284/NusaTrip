import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  className?: string;
  href?: string;
}

export function Logo({
  size = "md",
  showText = true,
  subtitle = "Tour & Event Organizer",
  className = "",
  href = "/",
}: LogoProps) {
  // Kalibrasi ukuran ikon: proporsional, tajam, dan tidak mendominasi layar
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl",
    lg: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl",
    xl: "w-16 h-16 rounded-2xl",
  };

  const titleSizes = {
    sm: "text-sm font-bold",
    md: "text-lg sm:text-xl font-bold",
    lg: "text-2xl font-extrabold",
    xl: "text-3xl font-black",
  };

  const subtitleSizes = {
    sm: "text-[9px] tracking-wider",
    md: "text-[10px] sm:text-[11px] tracking-tight",
    lg: "text-xs tracking-normal",
    xl: "text-sm tracking-normal",
  };

  const content = (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none bg-transparent ${className}`}>
      <img
        src="/logo.png"
        alt="NusaTrip Logo"
        className={`${sizeClasses[size]} object-contain shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200 bg-transparent`}
      />
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`tracking-tight text-[var(--text-primary)] leading-none ${titleSizes[size]}`}>
            NusaTrip
          </span>
          {subtitle && (
            <span className={`text-indigo-600 dark:text-indigo-400 font-semibold leading-tight mt-0.5 ${subtitleSizes[size]}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl bg-transparent"
        aria-label="NusaTrip Beranda"
      >
        {content}
      </Link>
    );
  }

  return content;
}
