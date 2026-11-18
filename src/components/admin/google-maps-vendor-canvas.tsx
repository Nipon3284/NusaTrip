"use client";

// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  APIProvider,
  APIProviderContext,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  ColorScheme,
} from "@vis.gl/react-google-maps";
import { useGoogleMapsKey } from "@/lib/hooks/use-google-maps-key";
import {
  Hotel,
  Utensils,
  Compass,
  Bus,
  ShoppingBag,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Key,
  ExternalLink,
  ShieldCheck,
  Check,
  MapPin,
  X,
  Star,
  Sun,
  Moon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useZones, type PartnerItem, type ZoneItem } from "@/lib/data/tour-store";

// Format currency
function formatRupiah(num: number): string {
  return "Rp " + num.toLocaleString("id-ID");
}

// Google Maps Style: Completely hide default POIs so ONLY registered vendors appear
export const NO_POI_DARK_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.medical",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#0c1524" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0c1524" }, { weight: 2 }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#748aa6" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#071a2e" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
];

// Clean Modern Light Theme with POIs completely hidden so ONLY registered vendors stand out
export const NO_POI_LIGHT_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.medical",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#f8fafc" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { weight: 3 }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e0e7ff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c7d2fe" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#bae6fd" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0284c7" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }],
  },
];

export const NO_POI_SATELLITE_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

// Helper to render category icon
function getCategoryIcon(category: string, className?: string) {
  switch (category) {
    case "Hotel":
      return <Hotel className={className || "w-4 h-4"} />;
    case "Restoran":
      return <Utensils className={className || "w-4 h-4"} />;
    case "Wisata (Anchor Zone)":
      return <Compass className={className || "w-4 h-4"} />;
    case "Transportasi":
      return <Bus className={className || "w-4 h-4"} />;
    case "Pusat Oleh-oleh":
      return <ShoppingBag className={className || "w-4 h-4"} />;
    default:
      return <Users className={className || "w-4 h-4"} />;
  }
}

interface GoogleMapsVendorCanvasProps {
  partners: PartnerItem[];
  activePartnerId: string | null;
  onSelectPartner: (id: string) => void;
  selectedZone: string;
  mapMode: "map" | "satelit";
  onToggleMapMode: (mode: "map" | "satelit") => void;
  onOpenEditModal: (partner: PartnerItem) => void;
  onDeletePartner: (id: string) => void;
  themeMode?: "light" | "dark";
  onToggleThemeMode?: (theme: "light" | "dark") => void;
}

// Inner Camera Controller to smoothly pan & zoom Google Maps instance
function MapCameraController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  return null;
}

export function GoogleMapsVendorCanvas({
  partners,
  activePartnerId,
  onSelectPartner,
  selectedZone,
  mapMode,
  onToggleMapMode,
  onOpenEditModal,
  onDeletePartner,
  themeMode,
  onToggleThemeMode,
}: GoogleMapsVendorCanvasProps) {
  // Safe API key lookup from shared hook
  const { apiKey, saveKey, isLoading } = useGoogleMapsKey();
  const outerContext = useContext(APIProviderContext);

  // Theme Mode (Light / Dark), default to light as requested
  const [internalTheme, setInternalTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nusatrip_map_theme");
      if (stored === "dark" || stored === "light") return stored;
    }
    return "light";
  });

  const currentTheme = themeMode || internalTheme;
  const handleToggleTheme = (newTheme: "light" | "dark") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nusatrip_map_theme", newTheme);
    }
    setInternalTheme(newTheme);
    onToggleThemeMode?.(newTheme);
  };

  const [inputKey, setInputKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  const zones = useZones();
  const currentZone = zones.find((z) => z.name === selectedZone);

  // Center coordinate determination dynamically based on selected zone
  const centerCoord = useMemo(() => {
    if (currentZone && currentZone.anchorCoordinates) {
      return currentZone.anchorCoordinates;
    }
    if (selectedZone.includes("Prambanan") || selectedZone.includes("Sleman")) {
      return { lat: -7.752, lng: 110.4915 }; // Candi Prambanan
    }
    if (selectedZone.includes("Kota") || selectedZone.includes("Malioboro")) {
      return { lat: -7.7956, lng: 110.3695 }; // Malioboro
    }
    if (selectedZone.includes("Lombok") || selectedZone.includes("Gili")) {
      return { lat: -8.352, lng: 116.042 }; // Lombok & Gili
    }
    if (selectedZone.includes("Bali") || selectedZone.includes("Melasti")) {
      return { lat: -8.845, lng: 115.163 }; // Bali Melasti & GWK
    }
    if (selectedZone.includes("Bromo") || selectedZone.includes("Malang")) {
      return { lat: -7.9425, lng: 112.953 }; // Bromo & Batu
    }
    if (selectedZone.includes("Bandung") || selectedZone.includes("Lembang")) {
      return { lat: -6.815, lng: 107.618 }; // Bandung & Ciwidey
    }
    if (selectedZone.includes("Banyuwangi") || selectedZone.includes("Ijen")) {
      return { lat: -8.058, lng: 114.242 }; // Banyuwangi Ijen
    }
    // Default: Borobudur Anchor Zone
    return { lat: -7.6079, lng: 110.2038 };
  }, [selectedZone, currentZone]);

  const activePartner = useMemo(() => {
    return partners.find((p) => p.id === activePartnerId) || null;
  }, [partners, activePartnerId]);

  // Handle saving key to localStorage
  const handleSaveKey = () => {
    if (inputKey.trim()) {
      saveKey(inputKey.trim());
      setShowKeyModal(false);
    }
  };

  const handleResetToAnchor = () => {
    setZoomLevel(14);
    if (activePartner) {
      onSelectPartner("");
    }
  };

  // Helper for category styling (dynamically adapts between light & dark theme)
  const getCategoryPinStyle = (category: string, isActive: boolean, isSelected: boolean) => {
    if (isSelected) {
      return {
        bg: "bg-cyan-500 text-white scale-125 ring-4 ring-cyan-400/50 shadow-xl shadow-cyan-400/60 z-30",
        icon: "text-white",
      };
    }
    if (!isActive) {
      return {
        bg: currentTheme === "dark" ? "bg-slate-800 border-2 border-slate-600 text-slate-400 opacity-60" : "bg-slate-300 border-2 border-slate-400 text-slate-600 opacity-60",
        icon: currentTheme === "dark" ? "text-slate-400" : "text-slate-600",
      };
    }

    if (currentTheme === "dark") {
      switch (category) {
        case "Hotel":
          return { bg: "bg-[#083344] border-2 border-cyan-400 text-cyan-200", icon: "text-cyan-400" };
        case "Restoran":
          return { bg: "bg-[#451a03] border-2 border-amber-400 text-amber-200", icon: "text-amber-400" };
        case "Wisata (Anchor Zone)":
          return { bg: "bg-[#064e3b] border-2 border-emerald-400 text-emerald-200", icon: "text-emerald-400" };
        case "Transportasi":
          return { bg: "bg-[#1e1b4b] border-2 border-indigo-400 text-indigo-200", icon: "text-indigo-400" };
        case "Pusat Oleh-oleh":
          return { bg: "bg-[#3b0764] border-2 border-purple-400 text-purple-200", icon: "text-purple-400" };
        default:
          return { bg: "bg-[#4c0519] border-2 border-rose-400 text-rose-200", icon: "text-rose-400" };
      }
    }

    // Light Theme Pin Colors: Solid vibrant fill with crisp white border and clean shadow
    switch (category) {
      case "Hotel":
        return { bg: "bg-sky-600 border-2 border-white text-white shadow-md shadow-sky-500/25", icon: "text-white" };
      case "Restoran":
        return { bg: "bg-amber-600 border-2 border-white text-white shadow-md shadow-amber-500/25", icon: "text-white" };
      case "Wisata (Anchor Zone)":
        return { bg: "bg-emerald-600 border-2 border-white text-white shadow-md shadow-emerald-500/25", icon: "text-white" };
      case "Transportasi":
        return { bg: "bg-indigo-600 border-2 border-white text-white shadow-md shadow-indigo-500/25", icon: "text-white" };
      case "Pusat Oleh-oleh":
        return { bg: "bg-purple-600 border-2 border-white text-white shadow-md shadow-purple-500/25", icon: "text-white" };
      default:
        return { bg: "bg-rose-600 border-2 border-white text-white shadow-md shadow-rose-500/25", icon: "text-white" };
    }
  };

  const getCategoryIcon = (category: string, className = "w-4 h-4") => {
    switch (category) {
      case "Hotel":
        return <Hotel className={className} />;
      case "Restoran":
        return <Utensils className={className} />;
      case "Transportasi":
        return <Bus className={className} />;
      case "Pusat Oleh-oleh":
        return <ShoppingBag className={className} />;
      case "Tour Leader":
      case "Tim Dokumentasi":
      case "Tim Medis":
      case "Tim Pengawas":
        return <Users className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  const mapElement = (
    <Map
      mapId="DEMO_MAP_ID"
      colorScheme={currentTheme === "dark" ? ColorScheme.DARK : ColorScheme.LIGHT}
      mapTypeId={mapMode === "satelit" ? "hybrid" : "roadmap"}
      defaultCenter={centerCoord}
      defaultZoom={zoomLevel}
      gestureHandling="greedy"
      disableDefaultUI={true}
      styles={
        mapMode === "satelit"
          ? NO_POI_SATELLITE_STYLES
          : currentTheme === "dark"
          ? NO_POI_DARK_STYLES
          : NO_POI_LIGHT_STYLES
      }
      internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
      className="w-full h-full"
    >
      {/* Dynamic Camera Pan & Zoom Controller */}
      <MapCameraController center={centerCoord} zoom={zoomLevel} />

      {/* Render ONLY Registered Vendors as Advanced Markers */}
      {partners.map((partner) => {
        const isSelected = activePartner?.id === partner.id;
        const isAnchor = partner.category === "Wisata (Anchor Zone)";
        const style = getCategoryPinStyle(partner.category, partner.status_aktif, isSelected);

        return (
          <AdvancedMarker
            key={partner.id}
            position={partner.titik_koordinat}
            onClick={() => onSelectPartner(partner.id)}
            title={`${partner.name} (${partner.category})`}
            zIndex={isSelected ? 50 : isAnchor ? 20 : 10}
          >
            <div
              className={`relative flex items-center justify-center rounded-xl p-1.5 transition-all duration-200 cursor-pointer ${style.bg}`}
            >
              {isAnchor ? (
                <Compass className="w-4 h-4 text-emerald-400" />
              ) : (
                getCategoryIcon(partner.category, "w-4 h-4 " + style.icon)
              )}

              {/* Status active pulse ring */}
              {partner.status_aktif && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
              )}
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Selected Partner Detailed InfoWindow */}
      {activePartner && (
        <InfoWindow
          position={activePartner.titik_koordinat}
          onCloseClick={() => onSelectPartner("")}
          headerDisabled={true}
        >
          <div className="p-2.5 max-w-xs text-xs font-sans text-slate-900 bg-white rounded-lg shadow-none">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  {activePartner.category}
                </span>
                <h4 className="font-black text-sm text-slate-900 leading-tight">
                  {activePartner.name}
                </h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{activePartner.rating}</span>
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Zonasi:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                  {activePartner.zona_wisata}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Harga Modal:</span>
                <span className="font-bold text-indigo-600">
                  {formatRupiah(activePartner.harga_modal_satuan)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kapasitas:</span>
                <span className="font-semibold text-slate-900">
                  {activePartner.kapasitas_maksimal} Pax
                </span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Tempuh:</span>
                <span className="font-semibold text-slate-900">
                  {activePartner.waktu_tempuh_ke_wisata_menit} Menit
                </span>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </Map>
  );

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden shadow-md flex flex-col">
      {/* Map Top Header Controls: Map / Satelit & Zoom */}
      <div className="p-3 sm:p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Map / Satelit Toggle Pill */}
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-default)] shadow-2xs">
            <button
              type="button"
              onClick={() => onToggleMapMode("map")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                mapMode === "map"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => onToggleMapMode("satelit")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                mapMode === "satelit"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Satelit
            </button>
          </div>

          {/* Theme Mode Toggle (Terang / Gelap) */}
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--surface-card)] border border-[var(--border-default)] shadow-2xs">
            <button
              type="button"
              onClick={() => handleToggleTheme("light")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                currentTheme === "light"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Ubah ke Tema Terang (Light Mode)"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terang</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleTheme("dark")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${
                currentTheme === "dark"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Ubah ke Tema Gelap (Dark Mode)"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gelap</span>
            </button>
          </div>
        </div>

        {/* Status Badge & Google Maps Key Pill */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Google Maps Platform</span>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] hover:bg-[var(--surface-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] shadow-2xs transition-colors"
            title="Kelola Google Maps API Key"
          >
            <Key className="w-3 h-3 text-amber-500" />
            <span className="hidden md:inline">{apiKey ? "Ganti API Key" : "Set API Key"}</span>
          </button>
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 19))}
            title="Perbesar Peta"
            className="w-7 h-7 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-2xs transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 10))}
            title="Perkecil Peta"
            className="w-7 h-7 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-2xs transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetToAnchor}
            title="Pusatkan ke Titik Jangkar"
            className="w-7 h-7 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-2xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Area */}
      <div className={`relative w-full h-[460px] sm:h-[500px] overflow-hidden select-none transition-colors ${
        currentTheme === "light" ? "bg-slate-100" : "bg-slate-950"
      }`}>
        {isLoading && !apiKey ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-xs text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-semibold text-slate-300">Menghubungkan ke Google Maps Platform...</p>
          </div>
        ) : apiKey ? (
          outerContext ? (
            mapElement
          ) : (
            <APIProvider apiKey={apiKey} libraries={["marker", "places"]}>
              {mapElement}
            </APIProvider>
          )
        ) : (
          /* Graceful Fallback Preview & API Key Setup Guidance when API Key not yet supplied */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 overflow-hidden">
            {/* Background SVG Vector Contour Preview */}
            <div className="absolute inset-0 bg-[#0d1726] opacity-70">
              <svg className="w-full h-full" viewBox="0 0 500 500" fill="none">
                <circle cx="250" cy="250" r="160" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 4" />
                <circle cx="250" cy="250" r="90" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.3" />
                <path d="M 0 200 Q 250 250 500 180" stroke="#334155" strokeWidth="2.5" />
                <path d="M 220 0 Q 250 250 280 500" stroke="#475569" strokeWidth="3" />
              </svg>
            </div>

            {/* Central Guidance Card */}
            <div className="relative z-10 max-w-sm p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mb-3.5 shadow-inner">
                <MapPin className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-bold text-white tracking-tight">
                Integrasi Google Maps Platform
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Tampilan Google Maps siap menampilkan {partners.length} vendor terdaftar tanpa POI komersial pihak ketiga.
              </p>

              <div className="w-full mt-4 space-y-2">
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setShowKeyModal(true)}
                  className="w-full text-xs font-semibold gap-1.5 h-9"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Masukkan Google Maps API Key</span>
                </Button>

                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-8 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Dapatkan Maps Demo Key Gratis</span>
                </a>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                Atau masukkan di <code className="text-indigo-300 font-mono">.env.local</code> sebagai <code className="text-cyan-300 font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left Map Legend */}
        <div className={`absolute bottom-3 left-3 z-10 p-2.5 rounded-xl text-[10px] space-y-1.5 shadow-lg pointer-events-none transition-colors ${
          currentTheme === "light"
            ? "bg-white/95 text-slate-700 border border-slate-200/90 shadow-slate-300/40"
            : "bg-slate-900/90 text-slate-300 border border-slate-700/80"
        }`}>
          <div className={`text-[9px] font-extrabold uppercase tracking-wider ${
            currentTheme === "light" ? "text-indigo-600" : "text-cyan-400"
          }`}>
            Hanya Vendor Terdaftar ({partners.length})
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${currentTheme === "light" ? "bg-sky-500" : "bg-cyan-400"}`} />
            <span>Hotel (&le; 25 Menit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${currentTheme === "light" ? "bg-amber-500" : "bg-amber-400"}`} />
            <span>Restoran & Prasmanan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${currentTheme === "light" ? "bg-indigo-500" : "bg-indigo-400"}`} />
            <span>Armada Bus & Kru Lapangan</span>
          </div>
        </div>

        {/* Bottom Right Zoom Info */}
        <div className={`absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-mono pointer-events-none transition-colors ${
          currentTheme === "light"
            ? "bg-white/95 text-slate-700 border border-slate-200/90 shadow-sm"
            : "bg-slate-900/90 text-cyan-300 border border-slate-700/80"
        }`}>
          Zoom: {zoomLevel}x &bull; POI: Terfilter
        </div>
      </div>

      {/* Active Partner Popover Detail Card under Map (Exact match with user mockup image) */}
      {activePartner && (
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[var(--text-primary)]">
                  {activePartner.name}
                </span>
                <Badge variant={activePartner.status_aktif ? "emerald" : "neutral"} size="sm">
                  {activePartner.status_aktif ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {activePartner.category} &bull; {activePartner.kualifikasi_standar}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenEditModal(activePartner)}
                className="h-8 px-2.5 text-xs gap-1 border-[var(--border-default)]"
              >
                <span>Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeletePartner(activePartner.id)}
                className="h-8 px-2 text-xs"
                title="Hapus Mitra"
              >
                <span>Hapus</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
            <div className="p-2 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Harga Modal</span>
              <span className="font-bold text-[var(--text-primary)]">
                {formatRupiah(activePartner.harga_modal_satuan)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Kapasitas Maks</span>
              <span className="font-bold text-[var(--text-primary)]">
                {activePartner.kapasitas_maksimal} Pax
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Waktu Tempuh</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                {activePartner.waktu_tempuh_ke_wisata_menit} Menit
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Koordinat GPS</span>
              <span className="font-bold font-mono text-[10px] text-[var(--text-secondary)] truncate block">
                {activePartner.titik_koordinat.lat.toFixed(4)}, {activePartner.titik_koordinat.lng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Setting Google Maps API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-default)] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  Konfigurasi Google Maps API Key
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              Google Maps akan memuat peta wilayah dan hanya merender vendor NusaTrip yang terdaftar. Anda dapat memasukkan API Key produksi atau menggunakan Maps Demo Key gratis untuk prototyping tanpa setup billing.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="gmaps-api-key-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  API Key / Demo Key:
                </label>
                <input
                  id="gmaps-api-key-input"
                  type="text"
                  placeholder="AIzaSy..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Kunci otomatis tersinkronisasi ke seluruh perangkat admin NusaTrip.</span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-[var(--text-secondary)] space-y-1">
                <div className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Belum punya key? Dapatkan Maps Demo Key:</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Buka link di bawah, login akun Google, dan copy key yang muncul:
                </p>
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-0.5"
                >
                  <span>Buka Google Maps Demo Key Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-[var(--border-subtle)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyModal(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleSaveKey}
                disabled={!inputKey.trim()}
                className="text-xs font-semibold"
              >
                Simpan & Aktifkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
