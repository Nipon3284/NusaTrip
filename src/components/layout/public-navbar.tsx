"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useCustomerAuth, logoutCustomer } from "@/lib/data/tour-store";
import { GoogleSSOModal } from "@/components/auth/google-sso-modal";

function GoogleGIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/paket-wisata", label: "Paket Wisata" },
  { href: "/destinasi", label: "Destinasi" },
  { href: "/kustom-trip", label: "Rancang Trip B2B" },
  { href: "/lacak-pesanan", label: "Lacak Pesanan" },
  { href: "/pelanggan", label: "Dasbor Pelanggan" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const customerAuth = useCustomerAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"masuk" | "daftar">("masuk");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Gated Navigation: Lacak Pesanan & Dasbor Pelanggan only available for logged-in customers
  const filteredNavLinks = customerAuth
    ? NAV_LINKS
    : NAV_LINKS.filter(
        (item) => item.href !== "/lacak-pesanan" && item.href !== "/pelanggan"
      );

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--surface-card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Logo size="md" subtitle="Tour & Event Organizer" />
          </Link>

          {/* Desktop Navigation Links (Typography-First, Executive Clarity) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {filteredNavLinks.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-xl text-xs tracking-tight transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs border border-indigo-100 dark:border-indigo-900/50"
                      : "text-[var(--text-secondary)] font-medium hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-[var(--surface-page)]"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Status & Action Buttons (Admin Gate completely removed from public view) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Customer Auth / Google SSO Status */}
            {customerAuth ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-2 pr-1.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {customerAuth.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-[11px] leading-tight max-w-[110px]">
                  <span className="font-bold text-[var(--text-primary)] block truncate">
                    {customerAuth.name}
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate block">
                    {customerAuth.institution || "Pelanggan Google"}
                  </span>
                </div>
                <Link
                  href="/pelanggan"
                  className="px-2 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline"
                >
                  Dasbor
                </Link>
                <button
                  type="button"
                  onClick={logoutCustomer}
                  title="Keluar Akun Google"
                  className="p-1 rounded-full text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAuthMode("masuk");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs h-8 sm:h-9 px-3 sm:px-4 font-bold rounded-xl border-[var(--border-default)] text-[var(--text-primary)] hover:border-indigo-600 hover:text-indigo-600"
                >
                  <span>Masuk</span>
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => {
                    setAuthMode("daftar");
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs h-8 sm:h-9 px-3 sm:px-4 font-bold rounded-xl shadow-xs"
                >
                  <span>Daftar</span>
                </Button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-panel"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav-panel"
            className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200"
          >
            {filteredNavLinks.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-[var(--text-primary)] hover:bg-[var(--surface-page)]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </Link>
              );
            })}

            {!customerAuth && (
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAuthMode("masuk");
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 text-xs font-bold h-9"
                >
                  <span>Masuk</span>
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => {
                    setAuthMode("daftar");
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 text-xs font-bold h-9"
                >
                  <span>Daftar</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Customer Auth Modal (Masuk / Daftar / OTP) */}
      {isAuthModalOpen && (
        <GoogleSSOModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
}
