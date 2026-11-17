"use client";

// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useMapsLibrary,
  useMap,
  Map,
  AdvancedMarker,
  ColorScheme,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import {
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Navigation,
  ExternalLink,
  Key,
  Building,
  Utensils,
  Landmark,
  Compass,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SelectedPlaceData {
  name: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
  placeId?: string;
  rating?: number;
  phoneNumber?: string;
  types?: string[];
  suggestedCategory?: "Hotel" | "Restoran" | "Wisata (Anchor Zone)" | "Transportasi" | "Pusat Oleh-oleh" | "Tour Leader";
}

interface GoogleMapsPlacePickerProps {
  apiKey: string;
  onSelectPlace: (place: SelectedPlaceData) => void;
  currentLat?: number;
  currentLng?: number;
  currentName?: string;
  zoneAnchor?: { lat: number; lng: number };
  onOpenKeyModal?: () => void;
}

// Fallback Indonesian tourism places database for offline prototyping
interface FallbackPlaceItem {
  name: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
  category: "Hotel" | "Restoran" | "Wisata (Anchor Zone)" | "Transportasi" | "Pusat Oleh-oleh";
  rating: number;
  phone: string;
}

const FALLBACK_TOURISM_PLACES: FallbackPlaceItem[] = [
  // Borobudur & Magelang
  {
    name: "Candi Borobudur",
    city: "Magelang",
    lat: -7.6079,
    lng: 110.2038,
    address: "Jl. Badrawati, Kw. Candi Borobudur, Borobudur, Magelang, Jawa Tengah",
    category: "Wisata (Anchor Zone)",
    rating: 4.8,
    phone: "(0293) 788266",
  },
  {
    name: "Hotel Saraswati Borobudur",
    city: "Magelang",
    lat: -7.6053,
    lng: 110.2046,
    address: "Jl. Balaputradewa No.10, Dusun XVII, Borobudur, Magelang, Jawa Tengah",
    category: "Hotel",
    rating: 4.6,
    phone: "(0293) 788843",
  },
  {
    name: "Plataran Borobudur Resort & Spa",
    city: "Magelang",
    lat: -7.6186,
    lng: 110.1942,
    address: "Dusun Tanjungan, Borobudur, Magelang, Jawa Tengah",
    category: "Hotel",
    rating: 4.9,
    phone: "(0293) 788888",
  },
  {
    name: "Resto Bale Raos Magelang",
    city: "Magelang",
    lat: -7.6021,
    lng: 110.2091,
    address: "Jl. Mayor Kusen No. 45, Mendut, Magelang",
    category: "Restoran",
    rating: 4.5,
    phone: "0812-3456-7890",
  },
  {
    name: "Candi Mendut",
    city: "Magelang",
    lat: -7.6046,
    lng: 110.2295,
    address: "Jl. Mayor Kusen, Sumberrejo, Mendut, Kec. Mungkid, Kabupaten Magelang",
    category: "Wisata (Anchor Zone)",
    rating: 4.7,
    phone: "(0293) 788266",
  },
  // Prambanan & Yogyakarta
  {
    name: "Candi Prambanan",
    city: "Sleman / Klaten",
    lat: -7.752,
    lng: 110.4915,
    address: "Jl. Raya Solo - Yogyakarta No.16, Kranggan, Bokoharjo, Prambanan",
    category: "Wisata (Anchor Zone)",
    rating: 4.8,
    phone: "(0274) 496401",
  },
  {
    name: "Hotel Sheraton Mustika Yogyakarta",
    city: "Yogyakarta",
    lat: -7.7818,
    lng: 110.4357,
    address: "Jl. Laksda Adisucipto KM 8.7, Maguwoharjo, Depok, Sleman, Yogyakarta",
    category: "Hotel",
    rating: 4.7,
    phone: "(0274) 488588",
  },
  {
    name: "Gudeg Yu Djum Wijilan 167",
    city: "Yogyakarta",
    lat: -7.8042,
    lng: 110.3688,
    address: "Jl. Wijilan No.167, Panembahan, Kraton, Yogyakarta",
    category: "Restoran",
    rating: 4.6,
    phone: "(0274) 381788",
  },
  {
    name: "Jalan Malioboro Yogyakarta",
    city: "Yogyakarta",
    lat: -7.7928,
    lng: 110.3658,
    address: "Sosromenduran, Gedong Tengen, Kota Yogyakarta, Daerah Istimewa Yogyakarta",
    category: "Pusat Oleh-oleh",
    rating: 4.8,
    phone: "(0274) 562811",
  },
  // Bali
  {
    name: "Pantai Melasti Ungasan",
    city: "Bali",
    lat: -8.8475,
    lng: 115.1583,
    address: "Jl. Melasti Ungasan, Ungasan, Kuta Selatan, Badung, Bali",
    category: "Wisata (Anchor Zone)",
    rating: 4.8,
    phone: "0811-3800-111",
  },
  {
    name: "Garuda Wisnu Kencana (GWK)",
    city: "Bali",
    lat: -8.8104,
    lng: 115.1676,
    address: "Jl. Raya Uluwatu, Ungasan, Kuta Selatan, Badung, Bali",
    category: "Wisata (Anchor Zone)",
    rating: 4.7,
    phone: "(0361) 700808",
  },
  {
    name: "The Ungasan Clifftop Resort",
    city: "Bali",
    lat: -8.8452,
    lng: 115.1634,
    address: "Jl. Pantai Selatan Gau, Banjar Wijaya Kusuma, Ungasan, Bali",
    category: "Hotel",
    rating: 4.9,
    phone: "(0361) 8482111",
  },
  // Lombok
  {
    name: "Gili Trawangan Sanctuary",
    city: "Lombok",
    lat: -8.352,
    lng: 116.042,
    address: "Gili Indah, Pemenang, Kabupaten Lombok Utara, Nusa Tenggara Barat",
    category: "Wisata (Anchor Zone)",
    rating: 4.8,
    phone: "0819-0700-1234",
  },
  {
    name: "Sirkuit Internasional Mandalika",
    city: "Lombok",
    lat: -8.8925,
    lng: 116.3023,
    address: "Kuta, Pujut, Kabupaten Lombok Tengah, Nusa Tenggara Barat",
    category: "Wisata (Anchor Zone)",
    rating: 4.8,
    phone: "(0370) 650000",
  },
];

// Infer category from Google Maps Place types
function inferCategoryFromPlaceTypes(types: string[] = []): SelectedPlaceData["suggestedCategory"] {
  const typeSet = new Set(types);
  if (
    typeSet.has("lodging") ||
    typeSet.has("hotel") ||
    typeSet.has("resort_hotel") ||
    typeSet.has("motel") ||
    typeSet.has("guest_house") ||
    typeSet.has("bed_and_breakfast")
  ) {
    return "Hotel";
  }
  if (
    typeSet.has("restaurant") ||
    typeSet.has("food") ||
    typeSet.has("cafe") ||
    typeSet.has("bakery") ||
    typeSet.has("meal_takeaway")
  ) {
    return "Restoran";
  }
  if (
    typeSet.has("tourist_attraction") ||
    typeSet.has("point_of_interest") ||
    typeSet.has("park") ||
    typeSet.has("museum") ||
    typeSet.has("hindu_temple") ||
    typeSet.has("place_of_worship") ||
    typeSet.has("amusement_park")
  ) {
    return "Wisata (Anchor Zone)";
  }
  if (
    typeSet.has("shopping_mall") ||
    typeSet.has("store") ||
    typeSet.has("supermarket") ||
    typeSet.has("clothing_store")
  ) {
    return "Pusat Oleh-oleh";
  }
  if (
    typeSet.has("bus_station") ||
    typeSet.has("transit_station") ||
    typeSet.has("airport") ||
    typeSet.has("travel_agency")
  ) {
    return "Transportasi";
  }
  return undefined;
}

// Map Camera Pan component for mini preview
function MiniMapPanController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
  }, [map, center]);
  return null;
}

export function GoogleMapsPlacePicker({
  apiKey,
  onSelectPlace,
  currentLat,
  currentLng,
  currentName,
  zoneAnchor,
  onOpenKeyModal,
}: GoogleMapsPlacePickerProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [fallbackMatches, setFallbackMatches] = useState<FallbackPlaceItem[]>([]);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<SelectedPlaceData | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modern Places library from @vis.gl/react-google-maps
  const placesLibrary = useMapsLibrary("places");
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset session token when starting a new search
  const getSessionToken = useCallback(() => {
    if (!placesLibrary) return null;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  }, [placesLibrary]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update selectedPlaceInfo if current props change from outside
  useEffect(() => {
    if (currentLat !== undefined && currentLng !== undefined && currentName) {
      setSelectedPlaceInfo((prev) => {
        if (prev?.lat === currentLat && prev?.lng === currentLng && prev?.name === currentName) {
          return prev;
        }
        return {
          name: currentName,
          lat: currentLat,
          lng: currentLng,
          formattedAddress: prev?.formattedAddress,
          rating: prev?.rating,
          phoneNumber: prev?.phoneNumber,
          placeId: prev?.placeId,
        };
      });
    }
  }, [currentLat, currentLng, currentName]);

  // Handle Search Input Change with Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      setPredictions([]);
      setFallbackMatches([]);
      setIsOpenDropdown(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    debounceTimerRef.current = setTimeout(async () => {
      // 1. Try Live Google Maps Places Autocomplete if library is ready
      if (placesLibrary && apiKey) {
        try {
          const token = getSessionToken();
          const request: google.maps.places.AutocompleteRequest = {
            input: value.trim(),
            sessionToken: token ?? undefined,
            includedRegionCodes: ["id"], // Restrict to Indonesia
          };

          // If zoneAnchor is provided, bias towards active tourism zone
          if (zoneAnchor) {
            request.locationBias = {
              radius: 40000,
              center: { lat: zoneAnchor.lat, lng: zoneAnchor.lng },
            };
          }

          const response = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
          if (response && response.suggestions && response.suggestions.length > 0) {
            setPredictions(response.suggestions);
            setFallbackMatches([]);
            setIsOpenDropdown(true);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Google Maps Places API search error, activating fallback matcher:", err);
        }
      }

      // 2. Fallback Indonesian Tourism Search when API is offline or returns empty
      const normalized = value.toLowerCase().trim();
      const matches = FALLBACK_TOURISM_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(normalized) ||
          p.city.toLowerCase().includes(normalized) ||
          p.address.toLowerCase().includes(normalized)
      );
      setPredictions([]);
      setFallbackMatches(matches);
      setIsOpenDropdown(true);
      setIsLoading(false);
    }, 280);
  };

  // Handle Selection of a Live Google Maps Place Prediction
  const handleSelectPrediction = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;

    setIsLoading(true);
    setIsOpenDropdown(false);

    try {
      const place = prediction.toPlace();
      // Fetch required fields per Places API (New) specifications
      await place.fetchFields({
        fields: [
          "displayName",
          "location",
          "formattedAddress",
          "rating",
          "nationalPhoneNumber",
          "types",
          "id",
        ],
      });

      const lat = place.location?.lat();
      const lng = place.location?.lng();

      if (lat === undefined || lng === undefined) {
        throw new Error("Koordinat Google Maps tidak ditemukan untuk lokasi ini.");
      }

      const rawDisplayName = place.displayName;
      const resolvedName =
        typeof rawDisplayName === "string"
          ? rawDisplayName
          : prediction.mainText?.toString() || prediction.text?.toString() || query;

      const placeTypes = place.types || [];
      const suggestedCategory = inferCategoryFromPlaceTypes(placeTypes);

      const placeData: SelectedPlaceData = {
        name: resolvedName,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        formattedAddress: place.formattedAddress || prediction.secondaryText?.toString(),
        placeId: place.id || prediction.placeId,
        rating: place.rating || undefined,
        phoneNumber: place.nationalPhoneNumber || undefined,
        types: placeTypes,
        suggestedCategory,
      };

      setSelectedPlaceInfo(placeData);
      setQuery(resolvedName);
      onSelectPlace(placeData);

      // Session token is consumed after place detail fetch, reset for next search
      sessionTokenRef.current = null;
    } catch (err) {
      console.error("Gagal mengambil detail tempat dari Google Maps:", err);
      // Fallback: use text and default coordinates if available
      const fallbackName = prediction.mainText?.toString() || query;
      const fallbackData: SelectedPlaceData = {
        name: fallbackName,
        lat: currentLat ?? zoneAnchor?.lat ?? -7.6079,
        lng: currentLng ?? zoneAnchor?.lng ?? 110.2038,
        formattedAddress: prediction.secondaryText?.toString(),
        placeId: prediction.placeId,
      };
      setSelectedPlaceInfo(fallbackData);
      setQuery(fallbackName);
      onSelectPlace(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Selection of Fallback Catalog Item
  const handleSelectFallback = (item: FallbackPlaceItem) => {
    const placeData: SelectedPlaceData = {
      name: item.name,
      lat: item.lat,
      lng: item.lng,
      formattedAddress: item.address,
      rating: item.rating,
      phoneNumber: item.phone,
      suggestedCategory: item.category,
    };
    setSelectedPlaceInfo(placeData);
    setQuery(item.name);
    setIsOpenDropdown(false);
    onSelectPlace(placeData);
  };

  // Handle map click to reposition pin precisely
  const handleMapClick = (e: any) => {
    const latLng = e?.detail?.latLng || e?.latLng;
    if (!latLng) return;
    const lat = typeof latLng.lat === "function" ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === "function" ? latLng.lng() : latLng.lng;
    if (lat === undefined || lng === undefined) return;
    const newLat = Number(Number(lat).toFixed(6));
    const newLng = Number(Number(lng).toFixed(6));

    const updated: SelectedPlaceData = {
      name: selectedPlaceInfo?.name || currentName || "Lokasi Terpilih",
      lat: newLat,
      lng: newLng,
      formattedAddress: selectedPlaceInfo?.formattedAddress,
      placeId: selectedPlaceInfo?.placeId,
      rating: selectedPlaceInfo?.rating,
      phoneNumber: selectedPlaceInfo?.phoneNumber,
      suggestedCategory: selectedPlaceInfo?.suggestedCategory,
    };

    setSelectedPlaceInfo(updated);
    onSelectPlace(updated);
  };

  // Copy coordinates to clipboard
  const handleCopyCoords = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpenDropdown) return;
    const totalItems = predictions.length || fallbackMatches.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      if (predictions.length > 0 && predictions[selectedIndex]) {
        handleSelectPrediction(predictions[selectedIndex]);
      } else if (fallbackMatches.length > 0 && fallbackMatches[selectedIndex]) {
        handleSelectFallback(fallbackMatches[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpenDropdown(false);
    }
  };

  // Display coordinates
  const displayLat = selectedPlaceInfo?.lat ?? currentLat;
  const displayLng = selectedPlaceInfo?.lng ?? currentLng;
  const hasCoordinates = displayLat !== undefined && displayLng !== undefined;

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Top Search Input Box with Google Maps Branding */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Pencarian Google Maps (Auto-Detect Nama & Koordinat)</span>
          </label>
          <div className="flex items-center gap-2">
            {apiKey ? (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Google Maps API Aktif
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenKeyModal}
                className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <Key className="w-3 h-3 text-amber-500" />
                Set Google Maps Key
              </button>
            )}
          </div>
        </div>

        {/* Input Field with live search */}
        <div className="relative flex items-center">
          <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <Search className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (predictions.length > 0 || fallbackMatches.length > 0) {
                setIsOpenDropdown(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ketik nama hotel, resto, atau destinasi wisata (contoh: Hotel Saraswati Borobudur)..."
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-all placeholder:text-[var(--text-muted)]"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPredictions([]);
                setFallbackMatches([]);
                setIsOpenDropdown(false);
              }}
              className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Autocomplete Predictions Dropdown */}
        {isOpenDropdown && (predictions.length > 0 || fallbackMatches.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--surface-page)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
              <span>Rekomendasi Google Maps POI</span>
              <span>Pilih untuk Auto-Fill</span>
            </div>

            {/* Live Google Maps Predictions */}
            {predictions.map((suggestion, idx) => {
              const p = suggestion.placePrediction;
              if (!p) return null;
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={p.placeId || idx}
                  type="button"
                  onClick={() => handleSelectPrediction(suggestion)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-start gap-3 transition-colors border-b border-[var(--border-subtle)]/50 last:border-b-0 ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
                      : "hover:bg-[var(--surface-page)] text-[var(--text-primary)]"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">
                      {p.mainText?.toString() || p.text.toString()}
                    </div>
                    {p.secondaryText && (
                      <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {p.secondaryText.toString()}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-page)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">
                    Maps POI
                  </span>
                </button>
              );
            })}

            {/* Fallback Indonesian Catalog Matches */}
            {fallbackMatches.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.name + idx}
                  type="button"
                  onClick={() => handleSelectFallback(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-start gap-3 transition-colors border-b border-[var(--border-subtle)]/50 last:border-b-0 ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
                      : "hover:bg-[var(--surface-page)] text-[var(--text-primary)]"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    {item.category === "Hotel" ? (
                      <Building className="w-4 h-4" />
                    ) : item.category === "Restoran" ? (
                      <Utensils className="w-4 h-4" />
                    ) : (
                      <Landmark className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{item.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {item.address}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-indigo-600 block">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-amber-500 font-mono">
                      Rating {item.rating}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state when query searched but no results */}
        {isOpenDropdown && hasSearched && !isLoading && predictions.length === 0 && fallbackMatches.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-xl text-center">
            <p className="text-xs text-[var(--text-secondary)]">
              Tidak ada hasil yang sesuai di Google Maps untuk &quot;{query}&quot;.
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Anda tetap dapat mengetikkan nama dan titik koordinat secara manual di bawah.
            </p>
          </div>
        )}
      </div>

      {/* Selected Location Card & Real Coordinate Display */}
      {selectedPlaceInfo && hasCoordinates && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-[var(--text-primary)]">
                    {selectedPlaceInfo.name}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                    Google Maps Real GPS
                  </span>
                  {selectedPlaceInfo.rating && (
                    <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Rating {selectedPlaceInfo.rating}
                    </span>
                  )}
                </div>
                {selectedPlaceInfo.formattedAddress && (
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                    {selectedPlaceInfo.formattedAddress}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCoords(displayLat!, displayLng!)}
              className="px-2 py-1 text-[11px] font-mono rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-600 transition-colors flex items-center gap-1 shrink-0"
              title="Salin Koordinat Latitude & Longitude"
            >
              {copiedCoords ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin Koordinat</span>
                </>
              )}
            </button>
          </div>

          {/* Coordinate Chips */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-100 dark:border-emerald-900/60 font-mono text-[11px]">
            <div className="bg-[var(--surface-card)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[var(--text-muted)] text-[10px]">Latitude (S):</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">{displayLat}</span>
            </div>
            <div className="bg-[var(--surface-card)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[var(--text-muted)] text-[10px]">Longitude (E):</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">{displayLng}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mini Interactive Google Map Preview with Advanced Marker */}
      {hasCoordinates && (
        <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-slate-950">
          <div className="p-2 bg-[var(--surface-page)] border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Verifikasi Titik Koordinat GIS</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Klik pada peta untuk menyetel posisi pin secara presisi
            </span>
          </div>

          <div className="relative w-full h-44 sm:h-48 select-none">
            {apiKey ? (
              <Map
                mapId="DEMO_MAP_ID"
                colorScheme={ColorScheme.DARK}
                defaultCenter={{ lat: displayLat!, lng: displayLng! }}
                defaultZoom={16}
                gestureHandling="cooperative"
                disableDefaultUI={false}
                onClick={handleMapClick}
                internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
                className="w-full h-full"
              >
                <MiniMapPanController center={{ lat: displayLat!, lng: displayLng! }} />
                <AdvancedMarker
                  position={{ lat: displayLat!, lng: displayLng! }}
                  title={selectedPlaceInfo?.name || currentName || "Posisi Vendor"}
                >
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg ring-4 ring-rose-400/40 animate-pulse">
                    <MapPin className="w-5 h-5 fill-white text-rose-600" />
                  </div>
                </AdvancedMarker>
              </Map>
            ) : (
              /* Fallback static contour preview when API key not yet set */
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#0a1120] text-center">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1.5 border border-indigo-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-white">
                  Koordinat: {displayLat}, {displayLng}
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Titik koordinat berhasil dikonfirmasi dari database. Masukkan Google Maps API Key untuk peta interaktif live.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
