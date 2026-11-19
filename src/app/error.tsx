"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("[Root Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--surface-page)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-2xl text-center">
        <div className="flex flex-col items-center mb-6">
          <Logo size="lg" subtitle="Tour & Event Organizer" href="/" className="flex-col items-center gap-2 mb-4" />
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Halaman Sementara Terkendala
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
            Terjadi kendala saat memuat komponen antarmuka. Silakan muat ulang atau kembali ke halaman utama NusaTrip.
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
            <span>Coba Lagi</span>
          </Button>
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              size="md"
              className="w-full h-11 gap-2 font-medium border-[var(--border-default)]"
            >
              <Home className="w-4 h-4" />
              <span>Halaman Utama</span>
            </Button>
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
          NusaTrip Intelligent Tour Ecosystem
        </div>
      </div>
    </div>
  );
}
