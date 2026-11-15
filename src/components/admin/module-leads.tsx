"use client";

import React, { useState } from "react";
import {
  Inbox,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  MessageSquare,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerLeads, updateLeadStatus } from "@/lib/data/tour-store";
import type { AdminTab } from "./admin-sidebar";

export function ModuleLeads({ onSelectTab }: { onSelectTab: (tab: AdminTab) => void }) {
  const leads = useCustomerLeads();
  const [activeFilter, setActiveFilter] = useState<"semua" | "baru" | "dihitung" | "deal">("semua");

  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === "semua") return true;
    return lead.status === activeFilter;
  });

  const getCleanWhatsAppUrl = (phone: string, name: string, dest: string, pax: number) => {
    const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "62");
    const message = `Halo ${name}, kami dari NusaTrip Tour & Event Organizer ingin mengonfirmasi kebutuhan wisata ${pax} Pax ke ${dest}. Apakah jadwal konsultasi saat ini berkenan?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Permintaan Kustom Landing Page
          </span>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
            Inbox Rencana Wisata Masuk
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Data kustom trip yang dikirimkan calon wisatawan melalui formulir di halaman depan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["semua", "baru", "dihitung", "deal"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                activeFilter === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {st} ({st === "semua" ? leads.length : leads.filter((l) => l.status === st).length})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {lead.id}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{lead.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lead.status === "baru"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : lead.status === "dihitung"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    Status: {lead.status}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    {lead.createdAt}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px]">Destinasi:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{lead.destination}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px]">Kategori & Jumlah:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {lead.pax} Pax ({lead.days} Hari)
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px]">Preferensi Hotel:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{lead.hotel}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-[11px]">Kontak WhatsApp:</span>
                    <a
                      href={getCleanWhatsAppUrl(lead.phone, lead.name, lead.destination, lead.pax)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{lead.phone}</span>
                    </a>
                  </div>
                </div>

                {lead.notes && (
                  <p className="text-xs text-[var(--text-secondary)] bg-[var(--surface-subtle)] p-2.5 rounded-xl border border-[var(--border-subtle)] mt-2">
                    Catatan Kebutuhan: &quot;{lead.notes}&quot;
                  </p>
                )}
              </div>

              <div className="flex md:flex-col items-center gap-2 shrink-0">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => onSelectTab("supply-chain")}
                  className="text-xs gap-1.5 w-full justify-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kirim ke Solver DSS</span>
                </Button>

                <div className="flex items-center gap-1 w-full">
                  {lead.status !== "dihitung" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateLeadStatus(lead.id, "dihitung")}
                      className="text-[11px] h-8 flex-1"
                    >
                      Tandai Dihitung
                    </Button>
                  )}
                  {lead.status !== "deal" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateLeadStatus(lead.id, "deal")}
                      className="text-[11px] h-8 text-emerald-700 hover:text-emerald-800 flex-1 border-emerald-300"
                    >
                      Tandai Deal
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-card)]">
            <Inbox className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[var(--text-primary)]">Belum ada permintaan kustom</p>
          </div>
        )}
      </div>
    </div>
  );
}
