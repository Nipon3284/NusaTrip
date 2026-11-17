"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowRight,
  Compass,
  Building,
  Bus,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";

const DESTINATIONS_DATA = [
  {
    id: "jogja",
    name: "Yogyakarta",
    tagline: "Budaya Keraton, Candi Megah, & Lava Tour Merapi",
    anchorZone: "Zona Candi Prambanan & Malioboro Heritage",
    hotelRadius: "≤ 25 Menit ke Titik Wisata",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80",
    spots: [
      "Candi Borobudur & Dagi",
      "Candi Prambanan & Ratu Boko",
      "Malioboro Heritage & Keraton",
      "Jeep Lava Tour Merapi",
      "Tebing Breksi & HeHa Sky View",
      "Taman Sari Water Castle",
    ],
    highlights: "Sangat ideal untuk Company Outing, Family Gathering, dan Study Tour Kampus.",
  },
  {
    id: "bali",
    name: "Bali",
    tagline: "Pantai Eksotis, Watersport, & Sunset Melasti",
    anchorZone: "Zona Pantai Melasti & GWK Jimbaran",
    hotelRadius: "≤ 20 Menit ke Pesisir Pantai",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    spots: [
      "Tanjung Benoa Watersport",
      "Pantai Melasti & Sunset Kecak",
      "Garuda Wisnu Kencana (GWK)",
      "Tanah Lot Temple",
      "Kintamani Kaldera Batur",
      "Desa Penglipuran",
    ],
    highlights: "Destinasi favorit corporate gala dinner, executive retreat, dan reward trip tahunan.",
  },
  {
    id: "bromo",
    name: "Bromo & Malang",
    tagline: "Sunrise Kaldera Spektakuler & Wisata Edukasi Batu",
    anchorZone: "Zona Kaldera Bromo & Wisata Batu",
    hotelRadius: "≤ 30 Menit ke Jatim Park & Transit Bromo",
    image: "https://images.unsplash.com/photo-1609137144822-7772186835a2?auto=format&fit=crop&w=800&q=80",
    spots: [
      "Sunrise Point Penanjakan",
      "Kawah Bromo & Pasir Berbisik",
      "Bukit Teletubbies & Savana",
      "Museum Angkut Batu",
      "Jatim Park 3 Dino Park",
      "Petik Apel Agro Malang",
    ],
    highlights: "Pilihan terbaik untuk petualangan jeep 4x4, fotografi alam, dan rekreasi keluarga.",
  },
  {
    id: "bandung",
    name: "Bandung & Ciwidey",
    tagline: "Kesejukan Dataran Tinggi & Outbound Team Building",
    anchorZone: "Zona Lembang & Kawah Putih Ciwidey",
    hotelRadius: "≤ 25 Menit ke Lokasi Outbound",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80",
    spots: [
      "Kawah Putih Ciwidey",
      "Floating Market Lembang",
      "Glamping Lakeside Rancabali",
      "Tangkuban Perahu Crater",
      "Orchid Forest Cikole",
      "Jalan Braga Heritage",
    ],
    highlights: "Fasilitas training motivasi, outbound arung jeram, dan kebersamaan tim kantor.",
  },
  {
    id: "lombok",
    name: "Lombok & Gili",
    tagline: "Keindahan Bawah Laut, Gili Trawangan, & Mandalika",
    anchorZone: "Zona Gili Trawangan & Kuta Mandalika",
    hotelRadius: "≤ 20 Menit ke Pelabuhan & Pantai",
    image: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=800&q=80",
    spots: [
      "Snorkeling 3 Gili (Trawangan, Meno, Air)",
      "Sirkuit Internasional Mandalika",
      "Bukit Merese Sunset",
      "Pantai Tanjung Aan",
      "Desa Adat Sade",
      "Air Terjun Sendang Gile",
    ],
    highlights: "Sensasi liburan eksklusif pulau tropis dengan private speedboat dan resort tepi pantai.",
  },
  {
    id: "banyuwangi",
    name: "Banyuwangi",
    tagline: "Api Biru Ijen, Savana Baluran, & Hutan Purba",
    anchorZone: "Zona Kawah Ijen & Savana Baluran",
    hotelRadius: "≤ 30 Menit ke Gerbang Konservasi",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
    spots: [
      "Blue Fire Kawah Ijen",
      "Taman Nasional Baluran (Africa van Java)",
      "Hutan De Djawatan Benculuk",
      "Pantai Pulau Merah",
      "Bangsring Underwater",
      "Desa Wisata Osing",
    ],
    highlights: "Eksplorasi fenomena alam langka dunia dan ekosistem savana satwa liar terlindungi.",
  },
];

export default function DestinasiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block">
            Titik Jangkar Pariwisata
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            Eksplorasi Destinasi Utama NusaTrip
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Algoritma riset operasi kami menempatkan akomodasi hotel dan restoran dalam radius optimal 
            <strong> ≤ 25 menit dari titik jangkar wisata</strong>, sehingga rombongan tidak kelelahan di perjalanan.
          </p>
        </div>

        {/* Destination Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS_DATA.map((dest) => (
            <div
              key={dest.id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Preview with Overlay Tag */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600/90 text-white inline-block mb-1">
                      Anchor Zone Terverifikasi
                    </span>
                    <h3 className="text-xl font-black leading-tight text-white">{dest.name}</h3>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3.5 text-xs">
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                    {dest.tagline}
                  </p>

                  <div className="p-3 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{dest.anchorZone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Radius Hotel Mitra: {dest.hotelRadius}</span>
                    </div>
                  </div>

                  {/* Spots Checklist */}
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] block mb-1.5">
                      Daftar Lokawisata Pilihan:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.spots.map((spot, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"
                        >
                          {spot}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic border-t border-[var(--border-subtle)] pt-2.5">
                    {dest.highlights}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Link href={`/paket-wisata`}>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Lihat Paket
                  </Button>
                </Link>
                <Link href={`/kustom-trip`}>
                  <Button size="sm" variant="gradient" className="w-full text-xs gap-1">
                    <span>Rancang Trip</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
