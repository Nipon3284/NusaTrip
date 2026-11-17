"use client";

// Source: Google Maps Platform Code Assist
import React, { useState, useMemo } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useGoogleMapsKey } from "@/lib/hooks/use-google-maps-key";
import { GoogleMapsPlacePicker, type SelectedPlaceData } from "./google-maps-place-picker";
import {
  MapPin,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  Hotel,
  Utensils,
  Compass,
  Bus,
  ShoppingBag,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Star,
  Phone,
  Clock,
  Info,
  Navigation,
  Globe,
  Check,
  X,
  AlertTriangle,
  Building2,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { GoogleMapsVendorCanvas } from "./google-maps-vendor-canvas";
import {
  usePartners,
  addPartner,
  updatePartner,
  togglePartnerActive,
  deletePartner,
  type PartnerItem,
  useZones,
  addZone,
  updateZone,
  toggleZoneActive,
  deleteZone,
  type ZoneItem,
} from "@/lib/data/tour-store";

const CATEGORY_OPTIONS = [
  { value: "Hotel", label: "Hotel & Akomodasi" },
  { value: "Restoran", label: "Restoran & Katering" },
  { value: "Wisata (Anchor Zone)", label: "Wisata (Titik Jangkar)" },
  { value: "Transportasi", label: "Transportasi & Bus" },
  { value: "Pusat Oleh-oleh", label: "Pusat Oleh-oleh" },
  { value: "Tour Leader", label: "Tour Leader (Kru)" },
  { value: "Tim Dokumentasi", label: "Tim Dokumentasi" },
  { value: "Tim Medis", label: "Tim Medis Lapangan" },
  { value: "Tim Pengawas", label: "Tim Pengawas" },
];

// Helper to format rupiah
function formatRupiah(num: number): string {
  return "Rp " + num.toLocaleString("id-ID");
}

export function ModuleMitraMapping() {
  const { apiKey, saveKey } = useGoogleMapsKey();

  if (apiKey) {
    return (
      <APIProvider apiKey={apiKey} libraries={["marker", "places"]}>
        <ModuleMitraMappingContent apiKey={apiKey} onSaveKey={saveKey} />
      </APIProvider>
    );
  }

  return <ModuleMitraMappingContent apiKey="" onSaveKey={saveKey} />;
}

function ModuleMitraMappingContent({
  apiKey,
  onSaveKey,
}: {
  apiKey: string;
  onSaveKey: (key: string) => void;
}) {
  const partners = usePartners();
  const zones = useZones();

  // API Key Setup Dialog State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState("");

  // Dynamic zone options from tour store
  const zoneFilterOptions = useMemo(() => {
    const list = zones
      .filter((z) => z.isActive)
      .map((z) => ({ value: z.name, label: `${z.name} (${z.destinationCity})` }));
    return [{ value: "Semua", label: "Semua Zona Wilayah" }, ...list];
  }, [zones]);

  const zoneFormOptions = useMemo(() => {
    return zones
      .filter((z) => z.isActive)
      .map((z) => ({ value: z.name, label: `${z.name} (${z.destinationCity})` }));
  }, [zones]);

  // Filter & Search states
  const [selectedZone, setSelectedZone] = useState<string>("Zona Borobudur & Magelang");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Map view mode states: "map" (vector GIS) or "satelit" (satellite styling)
  const [mapMode, setMapMode] = useState<"map" | "satelit">("map");
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  // Modal CRUD states (Mitra / Vendor)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);

  // Modal CRUD states (Zonasi Wilayah)
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneItem | null>(null);

  // Form states for Zonasi Wilayah
  const [zoneFormName, setZoneFormName] = useState("");
  const [zoneFormCity, setZoneFormCity] = useState("Lombok");
  const [zoneFormAnchor, setZoneFormAnchor] = useState("");
  const [zoneFormLat, setZoneFormLat] = useState<number>(-8.352);
  const [zoneFormLng, setZoneFormLng] = useState<number>(116.042);
  const [zoneFormTransitTime, setZoneFormTransitTime] = useState<number>(25);
  const [zoneFormDescription, setZoneFormDescription] = useState("");
  const [zoneFormIsActive, setZoneFormIsActive] = useState<boolean>(true);

  // Form states for Add / Edit Mitra
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<PartnerItem["category"]>("Hotel");
  const [formZone, setFormZone] = useState("Zona Borobudur & Magelang");
  const [formStandard, setFormStandard] = useState("Bintang 3");
  const [formCapacity, setFormCapacity] = useState<number>(100);
  const [formPrice, setFormPrice] = useState<number>(300000);
  const [formMinOrder, setFormMinOrder] = useState<number>(5);
  const [formTravelTime, setFormTravelTime] = useState<number>(15);
  const [formLat, setFormLat] = useState<number>(-7.6079);
  const [formLng, setFormLng] = useState<number>(110.2038);
  const [formContact, setFormContact] = useState("0812-3456-7890");
  const [formRating, setFormRating] = useState<number>(4.8);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Filtered partners list
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchZone = selectedZone === "Semua" || p.zona_wisata === selectedZone;
      const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kualifikasi_standar.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchCategory && matchSearch;
    });
  }, [partners, selectedZone, selectedCategory, searchQuery]);

  const activePartner = useMemo(() => {
    return partners.find((p) => p.id === activePartnerId) || filteredPartners[0] || null;
  }, [partners, activePartnerId, filteredPartners]);

  // Open Zone Management Modal
  const handleOpenZoneModal = () => {
    setIsAddingZone(false);
    setEditingZone(null);
    setIsZoneModalOpen(true);
  };

  // Open Form to Add New Zone
  const handleStartAddZone = () => {
    setEditingZone(null);
    setZoneFormName("");
    setZoneFormCity("Lombok");
    setZoneFormAnchor("");
    setZoneFormLat(-8.352);
    setZoneFormLng(116.042);
    setZoneFormTransitTime(25);
    setZoneFormDescription("");
    setZoneFormIsActive(true);
    setIsAddingZone(true);
  };

  // Open Form to Edit Zone
  const handleStartEditZone = (zone: ZoneItem) => {
    setEditingZone(zone);
    setZoneFormName(zone.name);
    setZoneFormCity(zone.destinationCity);
    setZoneFormAnchor(zone.anchorName);
    setZoneFormLat(zone.anchorCoordinates.lat);
    setZoneFormLng(zone.anchorCoordinates.lng);
    setZoneFormTransitTime(zone.maxTransitMinutes);
    setZoneFormDescription(zone.description || "");
    setZoneFormIsActive(zone.isActive);
    setIsAddingZone(true);
  };

  // Handle Save Zone (Create or Update)
  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneFormName.trim()) {
      alert("Nama Zona Wilayah wajib diisi.");
      return;
    }
    if (!zoneFormCity.trim()) {
      alert("Kota Destinasi wajib diisi.");
      return;
    }
    if (!zoneFormAnchor.trim()) {
      alert("Nama Titik Jangkar Wisata wajib diisi.");
      return;
    }

    const payload = {
      name: zoneFormName.trim(),
      destinationCity: zoneFormCity.trim(),
      anchorName: zoneFormAnchor.trim(),
      anchorCoordinates: {
        lat: Number(zoneFormLat),
        lng: Number(zoneFormLng),
      },
      maxTransitMinutes: Number(zoneFormTransitTime) || 25,
      description: zoneFormDescription.trim(),
      isActive: zoneFormIsActive,
    };

    if (editingZone) {
      updateZone(editingZone.id, payload);
    } else {
      addZone(payload);
      setSelectedZone(payload.name);
    }

    setIsAddingZone(false);
    setEditingZone(null);
  };

  // Handle Delete Zone
  const handleDeleteZone = (id: string, name: string) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus "${name}" dari master zonasi? Mitra yang telah terkait dengan zona ini tidak akan terhapus, namun zona tidak lagi muncul di daftar pilihan.`
      )
    ) {
      deleteZone(id);
    }
  };

  // Handle Zone Selection in Partner Form (auto-populate coordinates)
  const handleZoneChangeInPartnerForm = (newZone: string) => {
    setFormZone(newZone);
    const matched = zones.find((z) => z.name === newZone);
    if (matched && matched.anchorCoordinates) {
      setFormLat(matched.anchorCoordinates.lat);
      setFormLng(matched.anchorCoordinates.lng);
    }
  };

  // Auto-fill from Google Maps Place Search for Vendor
  const handlePlaceSelectForVendor = (place: SelectedPlaceData) => {
    setFormName(place.name);
    setFormLat(place.lat);
    setFormLng(place.lng);
    if (place.rating) {
      setFormRating(place.rating);
    }
    if (place.phoneNumber) {
      setFormContact(place.phoneNumber);
    }
    if (place.suggestedCategory) {
      setFormCategory(place.suggestedCategory);
    }
  };

  // Auto-fill from Google Maps Place Search for Zone Anchor Spot
  const handlePlaceSelectForZone = (place: SelectedPlaceData) => {
    setZoneFormAnchor(place.name);
    setZoneFormLat(place.lat);
    setZoneFormLng(place.lng);
  };

  // Open modal for Create Partner
  const handleOpenCreateModal = () => {
    setEditingPartner(null);
    setFormName("");
    setFormCategory("Hotel");
    const defaultZone =
      selectedZone === "Semua" ? zoneFormOptions[0]?.value || "Zona Borobudur & Magelang" : selectedZone;
    setFormZone(defaultZone);
    const matched = zones.find((z) => z.name === defaultZone);
    setFormLat(matched?.anchorCoordinates.lat ?? -7.6079);
    setFormLng(matched?.anchorCoordinates.lng ?? 110.2038);
    setFormStandard("Bintang 3");
    setFormCapacity(100);
    setFormPrice(300000);
    setFormMinOrder(5);
    setFormTravelTime(15);
    setFormContact("0812-3456-7890");
    setFormRating(4.8);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (partner: PartnerItem) => {
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormCategory(partner.category);
    setFormZone(partner.zona_wisata);
    setFormStandard(partner.kualifikasi_standar);
    setFormCapacity(partner.kapasitas_maksimal);
    setFormPrice(partner.harga_modal_satuan);
    setFormMinOrder(partner.syarat_minimum_order);
    setFormTravelTime(partner.waktu_tempuh_ke_wisata_menit);
    setFormLat(partner.titik_koordinat.lat);
    setFormLng(partner.titik_koordinat.lng);
    setFormContact(partner.contact);
    setFormRating(partner.rating);
    setFormIsActive(partner.status_aktif);
    setIsModalOpen(true);
  };

  // Save Partner (Create or Update)
  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Nama Mitra wajib diisi.");
      return;
    }

    const payload = {
      name: formName,
      category: formCategory,
      zona_wisata: formZone,
      kualifikasi_standar: formStandard,
      kapasitas_maksimal: Number(formCapacity),
      harga_modal_satuan: Number(formPrice),
      syarat_minimum_order: Number(formMinOrder),
      waktu_tempuh_ke_wisata_menit: Number(formTravelTime),
      titik_koordinat: {
        lat: Number(formLat),
        lng: Number(formLng),
      },
      contact: formContact,
      rating: Number(formRating),
      status_aktif: formIsActive,
    };

    if (editingPartner) {
      updatePartner(editingPartner.id, payload);
    } else {
      addPartner(payload);
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDeletePartner = (id: string, name?: string) => {
    const target = partners.find((p) => p.id === id);
    const targetName = name || target?.name || id;
    if (confirm(`Apakah Anda yakin ingin menghapus mitra "${targetName}" dari database?`)) {
      deletePartner(id);
      if (activePartnerId === id) {
        setActivePartnerId(null);
      }
    }
  };

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Hotel":
        return <Hotel className="w-4 h-4 text-cyan-500" />;
      case "Restoran":
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case "Wisata (Anchor Zone)":
        return <Compass className="w-4 h-4 text-emerald-500" />;
      case "Transportasi":
        return <Bus className="w-4 h-4 text-indigo-500" />;
      case "Pusat Oleh-oleh":
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      default:
        return <Users className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Sistem Informasi Geografis &bull; Pemetaan Mitra
            </span>
            <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Live GIS Radar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
            Manajemen {selectedZone === "Semua" ? "Seluruh Zona" : selectedZone}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-2xl leading-relaxed">
            Visualisasi peta interaktif seluruh mitra akomodasi, restoran, dan transportasi. Kelola kapasitas dan harga modal dasar untuk dihitung oleh solver Linear Programming.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Selector Pill */}
          <div className="w-64">
            <CustomSelect
              id="zone-filter-select"
              value={selectedZone}
              onChange={(val) => {
                setSelectedZone(val);
                setActivePartnerId(null);
              }}
              options={zoneFilterOptions}
            />
          </div>

          <Button
            variant="gradient"
            size="md"
            onClick={handleOpenCreateModal}
            className="gap-2 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Vendor Baru</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleOpenZoneModal}
            className="gap-2 text-xs font-semibold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shadow-xs"
          >
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span>Zonasi Wilayah</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Split: Left Map (as circled in photo) & Right Database Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Google Maps Canvas (Hanya Menampilkan Vendor Terdaftar) */}
        <div className="lg:col-span-5">
          <GoogleMapsVendorCanvas
            partners={filteredPartners}
            activePartnerId={activePartnerId}
            onSelectPartner={setActivePartnerId}
            selectedZone={selectedZone}
            mapMode={mapMode}
            onToggleMapMode={setMapMode}
            onOpenEditModal={handleOpenEditModal}
            onDeletePartner={(id) => handleDeletePartner(id)}
          />
        </div>

        {/* RIGHT COLUMN: Database Mitra Table (persis di screenshot user) */}
        <div className="lg:col-span-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                  Database Mitra & Vendor
                </h3>
                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {filteredPartners.length} Mitra
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Daftar rekanan yang siap dialokasikan ke solver optimasi Linear Programming
              </p>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-subtle)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama mitra, kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8.5 pr-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
              />
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            {["Semua", "Hotel", "Restoran", "Wisata (Anchor Zone)", "Transportasi", "Pusat Oleh-oleh"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-[var(--surface-page)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--surface-subtle)]"
                }`}
              >
                {cat === "Wisata (Anchor Zone)" ? "Wisata" : cat}
              </button>
            ))}
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-subtle)]/40">
                  <th className="py-3 px-3">Nama Mitra</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Kapasitas Maks</th>
                  <th className="py-3 px-3 text-right">Harga Modal</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[var(--text-muted)]">
                      Tidak ada mitra vendor yang cocok dengan filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((item) => {
                    const isSelected = activePartner?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setActivePartnerId(item.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/60 dark:bg-indigo-950/40"
                            : "hover:bg-[var(--surface-subtle)]/60"
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[var(--surface-page)] border border-[var(--border-subtle)] shrink-0">
                              {getCategoryIcon(item.category)}
                            </div>
                            <div>
                              <span className="font-bold text-[var(--text-primary)] block hover:text-indigo-600">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {item.waktu_tempuh_ke_wisata_menit} min &bull; Rating {item.rating}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--surface-page)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)]">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-[var(--text-primary)]">
                          {item.kapasitas_maksimal} Pax
                        </td>

                        <td className="py-3 px-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                          {formatRupiah(item.harga_modal_satuan)}
                        </td>

                        {/* Interactive Toggle Switch for Status Aktif */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => togglePartnerActive(item.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all border ${
                              item.status_aktif
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                                : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                            }`}
                          >
                            {item.status_aktif ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Aktif</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-500" />
                                <span>Tidak</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Mitra"
                              className="p-1 rounded-lg hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePartner(item.id, item.name)}
                              title="Hapus Mitra"
                              className="p-1 rounded-lg hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Tambah Vendor Baru / Edit Mitra */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPartner ? `Edit Data Mitra: ${editingPartner.name}` : "Tambah Vendor / Mitra Baru"}
          maxWidth="xl"
        >
          <form onSubmit={handleSavePartner} className="space-y-4 text-xs">
            {/* GOOGLE MAPS PLACE PICKER SECTION */}
            <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/80 bg-gradient-to-b from-indigo-50/60 to-indigo-50/20 dark:from-indigo-950/40 dark:to-indigo-950/10">
              <GoogleMapsPlacePicker
                apiKey={apiKey}
                currentLat={formLat}
                currentLng={formLng}
                currentName={formName}
                zoneAnchor={
                  zones.find((z) => z.name === formZone)?.anchorCoordinates ||
                  zones.find((z) => z.name === selectedZone)?.anchorCoordinates
                }
                onSelectPlace={handlePlaceSelectForVendor}
                onOpenKeyModal={() => {
                  setInputKey(apiKey);
                  setShowKeyModal(true);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Nama Mitra / Vendor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hotel Saraswati Borobudur"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                  Otomatis terisi dari Google Maps saat memilih lokasi di atas
                </span>
              </div>

              <div>
                <CustomSelect
                  id="form-cat-select"
                  label="Kategori Layanan"
                  value={formCategory}
                  onChange={(val) => setFormCategory(val as PartnerItem["category"])}
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <CustomSelect
                  id="form-zone-select"
                  label="Zonasi Wilayah"
                  value={formZone}
                  onChange={handleZoneChangeInPartnerForm}
                  options={zoneFormOptions}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kualifikasi / Standar Fasilitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bintang 3 / Prasmanan Tradisional"
                  value={formStandard}
                  onChange={(e) => setFormStandard(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kapasitas Maksimal (Pax)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Harga Modal Satuan (Rp) *
                </label>
                <input
                  type="number"
                  step={5000}
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Waktu Tempuh (Menit)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formTravelTime}
                  onChange={(e) => setFormTravelTime(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* GPS Coordinates Display & Precision Manual Adjust */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Titik Koordinat GIS Terverifikasi</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Sinkron Otomatis dari Google Maps
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Titik Koordinat Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formLat}
                    onChange={(e) => setFormLat(Number(e.target.value))}
                    className="w-full h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-mono text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Titik Koordinat Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formLng}
                    onChange={(e) => setFormLng(Number(e.target.value))}
                    className="w-full h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs font-mono text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                Titik koordinat terisi secara presisi dari Google Maps. Anda juga dapat mengklik langsung di mini peta preview di atas untuk menyetel pin atau mengetikkan angka secara manual.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kontak / No. Telepon PIC
                </label>
                <input
                  type="text"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Rating Layanan (1.0 - 5.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formRating}
                  onChange={(e) => setFormRating(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Toggle Status Aktif */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
              <div>
                <span className="font-bold text-xs text-[var(--text-primary)] block">Status Kemitraan Aktif</span>
                <span className="text-[11px] text-[var(--text-muted)]">Mitra aktif langsung tersedia untuk dihitung oleh solver LP</span>
              </div>
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="gradient" size="sm" className="font-semibold">
                {editingPartner ? "Simpan Perubahan" : "Tambahkan Mitra"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Manajemen Zonasi Wilayah & Titik Jangkar Wisata */}
      {isZoneModalOpen && (
        <Modal
          isOpen={isZoneModalOpen}
          onClose={() => {
            setIsZoneModalOpen(false);
            setIsAddingZone(false);
            setEditingZone(null);
          }}
          title={
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Manajemen Zonasi Wilayah & Titik Jangkar Wisata</span>
            </div>
          }
          description="Kelola cakupan zonasi operasional, titik jangkar wisata utama (Anchor Zone), serta koordinat GIS untuk acuan radius transit &le; 25 menit bagi solver Linear Programming dan peta satelit."
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {zones.length} Total Zona
                </span>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {zones.filter((z) => z.isActive).length} Zona Aktif
                </span>
              </div>

              {!isAddingZone ? (
                <Button
                  type="button"
                  variant="gradient"
                  size="sm"
                  onClick={handleStartAddZone}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Zonasi Baru</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingZone(false);
                    setEditingZone(null);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Tutup Form</span>
                </Button>
              )}
            </div>

            {/* FORM CARD: Tambah / Edit Zona */}
            {isAddingZone && (
              <form
                onSubmit={handleSaveZone}
                className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/60">
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{editingZone ? `Edit Zona: ${editingZone.name}` : "Form Tambah Zonasi Wilayah Baru"}</span>
                  </h4>
                  <span className="text-[10px] text-[var(--text-muted)]">* Wajib diisi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Nama Zona Wilayah *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Zona Gili Trawangan & Kuta Mandalika"
                      value={zoneFormName}
                      onChange={(e) => setZoneFormName(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Kota Destinasi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Lombok / Bali / Yogyakarta"
                      value={zoneFormCity}
                      onChange={(e) => setZoneFormCity(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* Quick City Pills */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {["Lombok", "Yogyakarta", "Bali", "Bandung", "Bromo - Malang", "Banyuwangi"].map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setZoneFormCity(city)}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-600 transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Google Maps Search for Anchor Spot */}
                <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/80 bg-[var(--surface-card)]">
                  <GoogleMapsPlacePicker
                    apiKey={apiKey}
                    currentLat={zoneFormLat}
                    currentLng={zoneFormLng}
                    currentName={zoneFormAnchor}
                    onSelectPlace={handlePlaceSelectForZone}
                    onOpenKeyModal={() => {
                      setInputKey(apiKey);
                      setShowKeyModal(true);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Nama Titik Jangkar Wisata (Anchor Spot) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Wisata Gili Trawangan & Pantai Mandalika"
                      value={zoneFormAnchor}
                      onChange={(e) => setZoneFormAnchor(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Batas Waktu Tempuh Maksimum (Menit)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={zoneFormTransitTime}
                      onChange={(e) => setZoneFormTransitTime(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                      Standar NusaTrip: &le; 25 menit dari hotel & resto ke wisata
                    </span>
                  </div>
                </div>

                {/* GPS Coordinates of Anchor Spot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Latitude Titik Jangkar
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={zoneFormLat}
                      onChange={(e) => setZoneFormLat(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-mono text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Longitude Titik Jangkar
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={zoneFormLng}
                      onChange={(e) => setZoneFormLng(Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-mono text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Deskripsi / Catatan Wilayah (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gugusan pulau eksotis Gili dan sirkuit balap Mandalika"
                    value={zoneFormDescription}
                    onChange={(e) => setZoneFormDescription(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Checkbox Status Aktif */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <div>
                    <span className="font-bold text-xs text-[var(--text-primary)] block">Status Zonasi Aktif</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Zona aktif akan langsung muncul pada filter GIS dan solver Linear Programming
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={zoneFormIsActive}
                    onChange={(e) => setZoneFormIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingZone(false);
                      setEditingZone(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" className="font-semibold">
                    {editingZone ? "Perbarui Zona" : "Simpan Zona Baru"}
                  </Button>
                </div>
              </form>
            )}

            {/* TABEL MASTER ZONA */}
            <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="overflow-x-auto max-h-[360px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[var(--surface-subtle)] z-10">
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Nama Zona & Kota</th>
                      <th className="py-2.5 px-3">Titik Jangkar (Anchor)</th>
                      <th className="py-2.5 px-3 text-center">Radius Max</th>
                      <th className="py-2.5 px-3 text-center">Mitra Terkait</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {zones.map((zone) => {
                      const vendorCount = partners.filter((p) => p.zona_wisata === zone.name).length;
                      return (
                        <tr key={zone.id} className="hover:bg-[var(--surface-subtle)]/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[var(--text-primary)]">{zone.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                                {zone.destinationCity}
                              </span>
                            </div>
                            {zone.description && (
                              <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                                {zone.description}
                              </p>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
                              <Compass className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{zone.anchorName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                              [{zone.anchorCoordinates.lat.toFixed(3)}, {zone.anchorCoordinates.lng.toFixed(3)}]
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                              &le; {zone.maxTransitMinutes} m
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                              {vendorCount} Rekanan
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleZoneActive(zone.id)}
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all border ${
                                zone.isActive
                                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                              }`}
                            >
                              {zone.isActive ? (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Aktif</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-2.5 h-2.5 text-rose-500" />
                                  <span>Nonaktif</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditZone(zone)}
                                title="Edit Zona"
                                className="p-1 rounded hover:bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:text-indigo-600 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteZone(zone.id, zone.name)}
                                title="Hapus Zona"
                                className="p-1 rounded hover:bg-rose-50 text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
              <span>Perubahan zona langsung tersimpan secara reaktif dan otomatis aktif di GIS Radar & Solver LP.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsZoneModalOpen(false);
                  setIsAddingZone(false);
                  setEditingZone(null);
                }}
              >
                Tutup Selesai
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Konfigurasi Google Maps API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-default)] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Konfigurasi Google Maps API Key
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Google Maps API Key digunakan untuk live autocompletion tempat/POI, geocoding otomatis, dan peta satelit presisi.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  API Key Google Cloud
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-[var(--text-secondary)] space-y-1">
                <div className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Belum punya key? Dapatkan Maps Demo Key Gratis:</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Buka link portal resmi Google Maps Platform, login akun Google, dan copy key:
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
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowKeyModal(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={() => {
                  if (inputKey.trim()) {
                    onSaveKey(inputKey.trim());
                    setShowKeyModal(false);
                  }
                }}
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
