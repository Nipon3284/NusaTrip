"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

interface InternalGateErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InternalGateError({ error, reset }: InternalGateErrorProps) {
  useEffect(() => {
    // Log error secara aman untuk audit client
    console.error("[InternalGate Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xl text-center">
        <div className="flex flex-col items-center mb-6">
          <Logo size="lg" subtitle="Pusat Otorisasi Internal" href="" className="flex-col items-center gap-2 mb-4" />
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Pemulihan Akses Gerbang Internal
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
            Terjadi ketidaksesuaian cache sesi atau koneksi data saat memuat dasbor internal. Sistem siap memulihkan status sesi Anda.
          </p>
        </div>

        {error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] font-mono text-left break-words overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="gradient"
            size="md"
            onClick={() => reset()}
            className="w-full h-11 gap-2 font-medium"
          >
            <RotateCw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </Button>
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              size="md"
              className="w-full h-11 gap-2 font-medium border-[var(--border-default)]"
            >
              <Home className="w-4 h-4" />
              <span>Ke Beranda</span>
            </Button>
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
          Protokol Keamanan Data DSS NusaTrip Platform
        </div>
      </div>
    </div>
  );
}
