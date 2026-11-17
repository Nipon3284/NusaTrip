import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ShieldCheck, Award } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-[#0a0f1d] via-[#070b14] to-[#04060b] text-xs text-slate-400 mt-auto overflow-hidden border-t border-slate-800/80">
      {/* Ethereal Top Accent Hairline Glow */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Ambient Radial Lighting for Visual Depth */}
      <div
        className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-10">
          {/* Brand Info & Mission Statement */}
          <div className="lg:col-span-2 space-y-3.5">
            <Logo size="md" subtitle="Tour & Event Organizer" theme="dark" />
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mt-3">
              Platform agregator pariwisata dan event organizer berbasis riset operasi (Linear Programming).
              Mengoptimalkan rantai pasok vendor tanpa beban aset fisik, menjamin kuota rombongan utuh, dan didampingi 4 kru berlisensi.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-800/80 text-[11px] font-medium shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Rekening Escrow Aman</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-800/80 text-[11px] font-medium shadow-xs">
                <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>4 Kru Mutlak Ber-SPK</span>
              </span>
            </div>
          </div>

          {/* Quick Links: Eksplorasi */}
          <div className="space-y-3">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>Eksplorasi</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/paket-wisata" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Katalog Paket Wisata
                </Link>
              </li>
              <li>
                <Link href="/destinasi" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Destinasi & Titik Jangkar
                </Link>
              </li>
              <li>
                <Link href="/kustom-trip" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Rancang Trip Mandiri (Wizard)
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer & Operations Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>Layanan Pelanggan</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/pelanggan" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Dasbor Pelanggan
                </Link>
              </li>
              <li>
                <Link href="/lacak-pesanan" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Pusat Kendali Perjalanan H-7
                </Link>
              </li>
              <li>
                <Link href="/lacak-pesanan" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Lacak GPS Bus Real-Time
                </Link>
              </li>
              <li>
                <Link href="/pelanggan" className="text-slate-400 hover:text-cyan-300 transition-colors">
                  Unduh LPJ & Faktur Pajak
                </Link>
              </li>
            </ul>
          </div>

          {/* Operasional & Contact Card */}
          <div className="space-y-3">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <span>Zona Operasional</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yogyakarta &bull; Bali &bull; Bromo &bull; Bandung &bull; Lombok &bull; Banyuwangi
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs space-y-1.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] text-slate-400 font-medium">Senin - Minggu: 24 Jam Siaga</span>
              </div>
              <p className="text-slate-300 text-xs">
                Hotline: <strong className="text-white font-semibold">0812-3456-7890</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Email: <span className="text-slate-300 font-medium">info@nusatrip.id</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Sub-navigation */}
        <div className="pt-6 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 NusaTrip & Event Planner Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/pelanggan" className="text-slate-400 hover:text-cyan-300 transition-colors">
              Portal Pelanggan
            </Link>
            <span className="text-slate-600">&bull;</span>
            <Link href="/kustom-trip" className="text-slate-400 hover:text-cyan-300 transition-colors">
              Rancang Trip B2B
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
