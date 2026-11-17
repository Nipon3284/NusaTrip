"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Building2,
  Utensils,
  ShoppingBag,
  Bus,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Phone,
  ShieldCheck,
  Sliders,
  Image as ImageIcon,
  Palette,
  Save,
  RotateCcw,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { CustomSelect } from "@/components/ui/select";
import {
  useTourPackages,
  addTourPackage,
  updateTourPackage,
  deleteTourPackage,
  toggleTourPackageActive,
  usePartners,
  addPartner,
  updatePartner,
  togglePartnerActive,
  useZones,
  useHeroSettings,
  saveHeroSettings,
  resetHeroSettings,
  HERO_PRESETS,
  DEFAULT_HERO_SETTINGS,
  getHeroGradientCss,
  type TourPackageItem,
  type PartnerItem,
  type HeroBackgroundSettings,
} from "@/lib/data/tour-store";

const DESTINATION_OPTIONS = [
  { value: "Semua Destinasi", label: "Semua Destinasi" },
  { value: "Yogyakarta", label: "Yogyakarta" },
  { value: "Bali", label: "Bali" },
  { value: "Bromo - Malang", label: "Bromo - Malang" },
  { value: "Bandung", label: "Bandung" },
  { value: "Lombok", label: "Lombok" },
  { value: "Banyuwangi", label: "Banyuwangi" },
];

const DURATION_OPTIONS = [
  { value: "1 Hari (City Tour)", label: "1 Hari (City Tour)" },
  { value: "2D1N", label: "2 Hari 1 Malam (2D1N)" },
  { value: "3D2N", label: "3 Hari 2 Malam (3D2N)" },
  { value: "4D3N", label: "4 Hari 3 Malam (4D3N)" },
  { value: "5D4N", label: "5 Hari 4 Malam (5D4N)" },
];

const PARTNER_CATEGORIES = [
  "Semua Kategori",
  "Wisata (Anchor Zone)",
  "Hotel",
  "Restoran",
  "Pusat Oleh-oleh",
  "Transportasi",
  "Kru Lapangan",
] as const;

export function ModuleCmsPackages() {
  const [mainTab, setMainTab] = useState<"packages" | "partners" | "hero">("packages");

  // Hero Background Settings state
  const currentHeroSettings = useHeroSettings();
  const [draftHero, setDraftHero] = useState<HeroBackgroundSettings>(currentHeroSettings);
  const [heroSaveSuccess, setHeroSaveSuccess] = useState(false);

  // Keep draft in sync if external change
  React.useEffect(() => {
    setDraftHero(currentHeroSettings);
  }, [currentHeroSettings]);

  const handleSaveHero = () => {
    saveHeroSettings(draftHero);
    setHeroSaveSuccess(true);
    setTimeout(() => setHeroSaveSuccess(false), 3500);
  };

  const handleResetHero = () => {
    resetHeroSettings();
    setDraftHero(DEFAULT_HERO_SETTINGS);
    setHeroSaveSuccess(true);
    setTimeout(() => setHeroSaveSuccess(false), 3500);
  };

  // Packages state
  const packages = useTourPackages();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("Semua Destinasi");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDestination, setFormDestination] = useState("Yogyakarta");
  const [formDuration, setFormDuration] = useState("3D2N");
  const [formPrice, setFormPrice] = useState<number>(500000);
  const [formBadge, setFormBadge] = useState("");
  const [formAnchorZone, setFormAnchorZone] = useState("");
  const [formFacilityStandard, setFormFacilityStandard] = useState("");
  const [formSpots, setFormSpots] = useState("");
  const [formInclusions, setFormInclusions] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Partners state
  const partners = usePartners();
  const zones = useZones();
  const zoneGisOptions = useMemo(() => {
    return zones
      .filter((z) => z.isActive)
      .map((z) => ({ value: z.name, label: `${z.name} (${z.destinationCity})` }));
  }, [zones]);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerCategoryFilter, setPartnerCategoryFilter] = useState<string>("Semua Kategori");
  const [selectedAnchorZoneForGis, setSelectedAnchorZoneForGis] = useState("Zona Prambanan & Sleman");
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Partner Form State
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState<PartnerItem["category"]>("Hotel");
  const [pZone, setPZone] = useState("Zona Prambanan & Sleman");
  const [pStandard, setPStandard] = useState("Bintang 3");
  const [pCap, setPCap] = useState(100);
  const [pPrice, setPPrice] = useState(300000);
  const [pTime, setPTime] = useState(15);
  const [pContact, setPContact] = useState("0812-3456-7890");

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchSearch =
        pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.spots.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDest =
        selectedDestination === "Semua Destinasi" || pkg.destination === selectedDestination;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && pkg.isActive) ||
        (statusFilter === "inactive" && !pkg.isActive);

      return matchSearch && matchDest && matchStatus;
    });
  }, [packages, searchQuery, selectedDestination, statusFilter]);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
        p.zona_wisata.toLowerCase().includes(partnerSearch.toLowerCase());

      const matchCategory =
        partnerCategoryFilter === "Semua Kategori" ||
        (partnerCategoryFilter === "Kru Lapangan"
          ? ["Tour Leader", "Tim Dokumentasi", "Tim Medis", "Tim Pengawas"].includes(p.category)
          : p.category === partnerCategoryFilter);

      return matchSearch && matchCategory;
    });
  }, [partners, partnerSearch, partnerCategoryFilter]);

  const activeCount = packages.filter((p) => p.isActive).length;
  const inactiveCount = packages.filter((p) => !p.isActive).length;

  const handleOpenCreateModal = () => {
    setEditingPackageId(null);
    setFormTitle("");
    setFormDestination("Yogyakarta");
    setFormDuration("3D2N");
    setFormPrice(750000);
    setFormBadge("Populer");
    setFormAnchorZone("Zona Candi Prambanan & Merapi");
    setFormFacilityStandard("Hotel Setaraf Bintang 3 + Bus Pariwisata AC");
    setFormSpots("Candi Prambanan, Malioboro, Lava Tour Merapi");
    setFormInclusions("Transport AC, Hotel Bintang 3, Makan, Tiket Objek");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg: TourPackageItem) => {
    setEditingPackageId(pkg.id);
    setFormTitle(pkg.title);
    setFormDestination(pkg.destination);
    setFormDuration(pkg.duration);
    setFormPrice(pkg.price);
    setFormBadge(pkg.badge || "");
    setFormAnchorZone(pkg.anchorZone || "Zona Destinasi Wisata");
    setFormFacilityStandard(pkg.facilityStandard || "Hotel Setaraf Bintang 3 + Bus Eksekutif");
    setFormSpots(pkg.spots.join(", "));
    setFormInclusions(pkg.inclusions.join(", "));
    setFormIsActive(pkg.isActive);
    setIsModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const spotsList = formSpots
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const inclusionsList = formInclusions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      destination: formDestination,
      duration: formDuration,
      price: Number(formPrice),
      badge: formBadge.trim() || undefined,
      anchorZone: formAnchorZone.trim() || "Zona Wisata Terintegrasi",
      facilityStandard: formFacilityStandard.trim() || "Hotel Setaraf Bintang 3 + Bus Eksekutif",
      spots: spotsList.length > 0 ? spotsList : ["Destinasi Pilihan"],
      inclusions: inclusionsList.length > 0 ? inclusionsList : ["Transportasi Wisata"],
      isActive: formIsActive,
    };

    if (editingPackageId) {
      updateTourPackage(editingPackageId, payload);
    } else {
      addTourPackage(payload);
    }

    setIsModalOpen(false);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    addPartner({
      name: pName.trim(),
      category: pCategory,
      zona_wisata: pZone,
      kualifikasi_standar: pStandard,
      kapasitas_maksimal: Number(pCap),
      harga_modal_satuan: Number(pPrice),
      syarat_minimum_order: 1,
      waktu_tempuh_ke_wisata_menit: Number(pTime),
      titik_koordinat: { lat: -7.795, lng: 110.37 },
      status_surat_sehat: true,
      status_aktif: true,
      contact: pContact,
      rating: 4.8,
    });

    setIsPartnerModalOpen(false);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Module Top Navigation Switcher */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setMainTab("packages")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              mainTab === "packages"
                ? "bg-[var(--surface-card)] text-indigo-600 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Katalog Paket Wisata ({packages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("partners")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              mainTab === "partners"
                ? "bg-[var(--surface-card)] text-indigo-600 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Database Mitra, Zonasi & GIS ({partners.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("hero")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              mainTab === "hero"
                ? "bg-[var(--surface-card)] text-indigo-600 shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Kustomisasi Background Beranda</span>
          </button>
        </div>

        {mainTab === "packages" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Paket Wisata
          </Button>
        ) : mainTab === "partners" ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPartnerModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Mitra / Kru Baru
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-page)] text-xs font-semibold text-[var(--text-primary)] hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Pratinjau Beranda</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetHero}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Default
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveHero}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan Background
            </Button>
          </div>
        )}
      </div>

      {/* ── TAB 1: KATALOG PAKET WISATA ── */}
      {mainTab === "packages" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Cari paket atau destinasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <CustomSelect
              options={DESTINATION_OPTIONS}
              value={selectedDestination}
              onChange={setSelectedDestination}
            />

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-page)] border border-[var(--border-default)]">
              {(["all", "active", "inactive"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? "bg-[var(--surface-card)] text-indigo-600 shadow-2xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {st === "all" ? `Semua (${packages.length})` : st === "active" ? `Aktif (${activeCount})` : `Nonaktif (${inactiveCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  pkg.isActive
                    ? "bg-[var(--surface-card)] border-[var(--border-subtle)] shadow-xs hover:shadow-md"
                    : "bg-[var(--surface-page)] border-dashed border-[var(--border-default)] opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {pkg.destination}
                    </span>
                    {pkg.badge && <Badge variant="brand">{pkg.badge}</Badge>}
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                    {pkg.title}
                  </h3>

                  {/* Blind Vendor Anchors */}
                  <div className="my-2.5 p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{pkg.anchorZone || "Zona Wisata Terintegrasi"}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)]">
                      Standar: {pkg.facilityStandard || "Hotel Setaraf Bintang 3 + Bus Eksekutif"}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] italic">
                      *Vendor riil dibuka H-7 keberangkatan
                    </div>
                  </div>

                  <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{pkg.duration}</span>
                  </div>

                  <div className="space-y-1 text-xs text-[var(--text-secondary)] mb-4">
                    <div className="font-semibold text-[var(--text-primary)]">Titik Kunjungan:</div>
                    <div className="flex flex-wrap gap-1">
                      {pkg.spots.map((spot, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[11px]"
                        >
                          {spot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Mulai dari</span>
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      {formatRupiah(pkg.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleTourPackageActive(pkg.id)}
                      title={pkg.isActive ? "Nonaktifkan" : "Aktifkan"}
                      className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                    >
                      {pkg.isActive ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(pkg)}
                      title="Edit Paket"
                      className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus paket "${pkg.title}"?`)) {
                          deleteTourPackage(pkg.id);
                        }
                      }}
                      title="Hapus Paket"
                      className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-rose-50 text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: DATABASE MITRA, ZONASI & GIS ── */}
      {mainTab === "partners" && (
        <div className="space-y-6">
          {/* Radial GIS Zoning Visualization Widget */}
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Matriks Waktu Tempuh & Zonasi Logistik (GIS)</span>
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                  Visualisasi Radius Mitra di Sekitar Titik Jangkar Wisata
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Standar operasional NusaTrip membatasi waktu tempuh hotel & resto ke wisata &le; 25 menit.
                </p>
              </div>

              <div className="w-64">
                <CustomSelect
                  options={zoneGisOptions}
                  value={selectedAnchorZoneForGis}
                  onChange={setSelectedAnchorZoneForGis}
                />
              </div>
            </div>

            {/* Radar Radius Concentric Rings Canvas */}
            <div className="p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ring 1: Optimal (<= 15m) */}
              <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                  <span>Ring 1: &le; 15 Menit (Sangat Dekat)</span>
                  <Badge variant="success">Optimal</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  {partners
                    .filter((p) => p.zona_wisata.includes(selectedAnchorZoneForGis.split(" ")[1]) && p.waktu_tempuh_ke_wisata_menit <= 15)
                    .slice(0, 4)
                    .map((p) => (
                      <div key={p.id} className="p-2 rounded-lg bg-[var(--surface-card)] border border-emerald-200 flex justify-between">
                        <span className="font-semibold truncate max-w-[170px]">{p.name}</span>
                        <span className="font-mono text-emerald-700 font-bold">{p.waktu_tempuh_ke_wisata_menit}m</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Ring 2: Standard (16 - 25m) */}
              <div className="p-3.5 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/30">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-800 dark:text-indigo-200 mb-2">
                  <span>Ring 2: 16 - 25 Menit (Standar Aman)</span>
                  <Badge variant="brand">Batas ILP</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  {partners
                    .filter((p) => p.waktu_tempuh_ke_wisata_menit > 15 && p.waktu_tempuh_ke_wisata_menit <= 25)
                    .slice(0, 4)
                    .map((p) => (
                      <div key={p.id} className="p-2 rounded-lg bg-[var(--surface-card)] border border-indigo-200 flex justify-between">
                        <span className="font-semibold truncate max-w-[170px]">{p.name}</span>
                        <span className="font-mono text-indigo-700 font-bold">{p.waktu_tempuh_ke_wisata_menit}m</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Ring 3: Warning (> 25m) */}
              <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-200 mb-2">
                  <span>Ring 3: &gt; 25 Menit (Zona Deviasi)</span>
                  <Badge variant="warning">Cadangan</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="p-2 rounded-lg bg-[var(--surface-card)] border border-amber-200">
                    <span className="font-semibold block">Cadangan Bromo / Wonosobo</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Hanya dipakai jika status krisis H-7 darurat.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Filter & List Table */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Cari mitra, hotel, resto, bus, kru..."
                  value={partnerSearch}
                  onChange={(e) => setPartnerSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                {PARTNER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPartnerCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-all ${
                      partnerCategoryFilter === cat
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider bg-[var(--surface-subtle)]">
                    <th className="py-3 px-3">Nama Mitra & Kategori</th>
                    <th className="py-3 px-3">Zona Wisata</th>
                    <th className="py-3 px-3">Kualifikasi Standar</th>
                    <th className="py-3 px-3 text-center">Kapasitas</th>
                    <th className="py-3 px-3 text-right">Modal Satuan</th>
                    <th className="py-3 px-3 text-center">Waktu Tempuh (GIS)</th>
                    <th className="py-3 px-3 text-center">Surat Sehat / Sertif</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredPartners.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-subtle)]/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                        <div>{item.name}</div>
                        <span className="text-[10px] text-indigo-600 font-normal">{item.category}</span>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{item.zona_wisata}</td>
                      <td className="py-3 px-3 text-[var(--text-secondary)]">{item.kualifikasi_standar}</td>
                      <td className="py-3 px-3 text-center font-bold">{item.kapasitas_maksimal}</td>
                      <td className="py-3 px-3 text-right font-bold text-[var(--text-primary)]">
                        {formatRupiah(item.harga_modal_satuan)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            item.waktu_tempuh_ke_wisata_menit <= 15
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : item.waktu_tempuh_ke_wisata_menit <= 25
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {item.waktu_tempuh_ke_wisata_menit === 0 ? "Anchor" : `${item.waktu_tempuh_ke_wisata_menit} Menit`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.status_surat_sehat !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Terverifikasi</span>
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => togglePartnerActive(item.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status_aktif
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-slate-100 text-slate-500 border border-slate-300"
                          }`}
                        >
                          {item.status_aktif ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: KUSTOMISASI BACKGROUND & HERO BERANDA ── */}
      {mainTab === "hero" && (
        <div className="space-y-6">
          {/* Header Info Banner */}
          <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-[var(--text-primary)]">
                  Kustomisasi Background & Gradasi Latar Beranda
                </span>
                <Badge variant="brand" size="sm">Live Customizer</Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                Sesuaikan foto latar belakang, warna gradasi overlay, dan tingkat opasitas agar teks judul dan tombol tetap memiliki kontras tinggi serta tidak bertabrakan dengan elemen visual gambar.
              </p>
            </div>

            {heroSaveSuccess && (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan background berhasil disimpan!</span>
              </div>
            )}
          </div>

          {/* Interactive Live Mini Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Pratinjau Interaktif Tampilan Hero (Real-Time):</span>
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                draftHero.overlayOpacity >= 75
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
                  : draftHero.overlayOpacity >= 50
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:border-amber-800"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:border-rose-800"
              }`}>
                Opasitas {draftHero.overlayOpacity}% &bull; {draftHero.overlayOpacity >= 75 ? "Kontras Sangat Jelas (Aman)" : draftHero.overlayOpacity >= 50 ? "Kontras Sedang" : "Peringatan: Teks Kurang Kontras"}
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-lg min-h-[300px] flex items-center justify-center p-6 text-center select-none">
              {/* Background Image Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-300 pointer-events-none"
                style={{
                  backgroundImage: `url(${draftHero.imageUrl})`,
                  filter:
                    draftHero.blurAmount === "sm"
                      ? "blur(4px)"
                      : draftHero.blurAmount === "md"
                      ? "blur(8px)"
                      : "none",
                }}
              />

              {/* Gradient Overlay Layer with dynamic opacity */}
              <div
                className="absolute inset-0 transition-all duration-300 pointer-events-none"
                style={{
                  background: getHeroGradientCss(draftHero),
                  opacity: draftHero.overlayOpacity / 100,
                }}
              />

              {/* Bottom Fade Layer */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {/* Mock Content */}
              <div className="relative z-10 max-w-xl mx-auto space-y-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                    draftHero.textTheme === "dark"
                      ? "bg-white/15 text-cyan-300 border border-white/20 backdrop-blur-md"
                      : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </span>
                  <span>Platform Agregator Pariwisata & Event Organizer Berbasis DSS</span>
                </span>

                <h3
                  className={`text-xl sm:text-2xl font-black leading-tight tracking-tight ${
                    draftHero.textTheme === "dark"
                      ? "text-white drop-shadow-md"
                      : "text-slate-900"
                  }`}
                >
                  Solusi Cerdas Tour Rombongan dengan{" "}
                  <span
                    className={
                      draftHero.textTheme === "dark"
                        ? "bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm"
                        : "bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent"
                    }
                  >
                    Riset Operasi & Blind Vendor
                  </span>
                </h3>

                <p
                  className={`text-xs max-w-md mx-auto leading-relaxed ${
                    draftHero.textTheme === "dark"
                      ? "text-slate-200 drop-shadow-2xs"
                      : "text-slate-700 font-medium"
                  }`}
                >
                  Menghitung alokasi bus tanpa kursi kosong, garansi keutuhan rombongan, akses VIP Group Clearance bebas antre, dan didampingi 4 kru berlisensi.
                </p>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[10px] shadow-sm">
                    Jelajahi Paket Wisata
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg border font-bold text-[10px] ${
                      draftHero.textTheme === "dark"
                        ? "bg-white/10 text-white border-white/30 backdrop-blur-xs"
                        : "bg-white text-indigo-700 border-indigo-200"
                    }`}
                  >
                    Rancang Trip Kustom
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Preset Photos & Custom URL */}
            <div className="space-y-4 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 mb-1">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>1. Pilih Foto Destinasi Nusantara (Preset Cepat)</span>
                </h4>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Pilih foto beresolusi tinggi bertema lanskap wisata Indonesia yang telah teroptimasi.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {HERO_PRESETS.map((preset) => {
                  const isSelected =
                    draftHero.presetId === preset.id ||
                    draftHero.imageUrl === preset.imageUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setDraftHero((prev) => ({
                          ...prev,
                          presetId: preset.id,
                          imageUrl: preset.imageUrl,
                          imageAlt: preset.name,
                          gradientStartColor: preset.defaultGradientStart,
                          gradientEndColor: preset.defaultGradientEnd,
                          overlayOpacity: preset.defaultOpacity,
                        }));
                      }}
                      className={`group relative rounded-xl overflow-hidden border text-left transition-all aspect-video ${
                        isSelected
                          ? "ring-2 ring-indigo-500 border-indigo-500 shadow-sm"
                          : "border-[var(--border-subtle)] hover:border-indigo-400"
                      }`}
                    >
                      <img
                        src={preset.imageUrl}
                        alt={preset.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex flex-col justify-end">
                        <strong className="text-[11px] font-bold text-white block leading-tight">
                          {preset.name}
                        </strong>
                        <span className="text-[9px] text-slate-300 font-medium">
                          {preset.location}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL Field */}
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  Atau Input URL Foto Kustom:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={draftHero.imageUrl}
                    onChange={(e) =>
                      setDraftHero((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                        presetId: undefined,
                      }))
                    }
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 h-9 px-3 text-xs font-mono rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                  />
                  {draftHero.imageUrl && (
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-[var(--border-default)] shrink-0">
                      <img
                        src={draftHero.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Gradient, Direction, Opacity & Contrast Controls */}
            <div className="space-y-5 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5 mb-1">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>2. Gradasi Warna & Pelindung Kontras Teks</span>
                </h4>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Lapisan gradasi warna menimpa gambar agar tulisan tidak berbaur dengan latar belakang.
                </p>
              </div>

              {/* Opacity Slider with Safety Guide */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[var(--text-primary)]">
                    Tingkat Opasitas Gradasi Overlay:
                  </label>
                  <strong className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
                    {draftHero.overlayOpacity}%
                  </strong>
                </div>

                <input
                  type="range"
                  min="20"
                  max="95"
                  step="1"
                  value={draftHero.overlayOpacity}
                  onChange={(e) =>
                    setDraftHero((prev) => ({
                      ...prev,
                      overlayOpacity: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>20% (Gambar Terang / Kontras Rendah)</span>
                  <span className="font-bold text-emerald-600">
                    75% - 85% (Rekomendasi Aman)
                  </span>
                  <span>95% (Hampir Solid)</span>
                </div>
              </div>

              {/* Gradient Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Warna Awal Gradasi:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draftHero.gradientStartColor}
                      onChange={(e) =>
                        setDraftHero((prev) => ({
                          ...prev,
                          gradientStartColor: e.target.value,
                        }))
                      }
                      className="w-9 h-9 p-0.5 rounded-xl border border-[var(--border-default)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={draftHero.gradientStartColor}
                      onChange={(e) =>
                        setDraftHero((prev) => ({
                          ...prev,
                          gradientStartColor: e.target.value,
                        }))
                      }
                      className="flex-1 h-9 px-2.5 font-mono text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Warna Akhir Gradasi:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draftHero.gradientEndColor}
                      onChange={(e) =>
                        setDraftHero((prev) => ({
                          ...prev,
                          gradientEndColor: e.target.value,
                        }))
                      }
                      className="w-9 h-9 p-0.5 rounded-xl border border-[var(--border-default)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={draftHero.gradientEndColor}
                      onChange={(e) =>
                        setDraftHero((prev) => ({
                          ...prev,
                          gradientEndColor: e.target.value,
                        }))
                      }
                      className="flex-1 h-9 px-2.5 font-mono text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Palette Quick Picks */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-semibold text-[var(--text-muted)]">
                  Pilihan Palet Gradasi Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Midnight Slate", start: "#0f172a", end: "#1e1b4b" },
                    { label: "Deep Oceanic", start: "#030712", end: "#075985" },
                    { label: "Forest Emerald", start: "#022c22", end: "#0f172a" },
                    { label: "Sunset Bronze", start: "#18181b", end: "#451a03" },
                    { label: "Royal Purple", start: "#0f172a", end: "#312e81" },
                    { label: "Soft Pearl Light", start: "#ffffff", end: "#f1f5f9" },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setDraftHero((prev) => ({
                          ...prev,
                          gradientStartColor: p.start,
                          gradientEndColor: p.end,
                          textTheme:
                            p.label === "Soft Pearl Light" ? "light" : "dark",
                        }))
                      }
                      className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] text-[11px] font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{
                          background: `linear-gradient(to right, ${p.start}, ${p.end})`,
                        }}
                      />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Direction & Text Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Arah Gradasi:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "to-b", label: "Atas ke Bawah" },
                      { id: "to-br", label: "Diagonal (BR)" },
                      { id: "to-t", label: "Bawah ke Atas" },
                      { id: "radial", label: "Radial Lingkar" },
                    ].map((dir) => (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() =>
                          setDraftHero((prev) => ({
                            ...prev,
                            gradientDirection: dir.id as any,
                          }))
                        }
                        className={`p-2 rounded-xl text-[11px] font-semibold border text-center transition-all ${
                          draftHero.gradientDirection === dir.id
                            ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-500 font-bold"
                            : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-page)]"
                        }`}
                      >
                        {dir.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Mode Kontras Teks:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setDraftHero((prev) => ({ ...prev, textTheme: "dark" }))
                      }
                      className={`p-2 rounded-xl text-[11px] font-semibold border text-center transition-all ${
                        draftHero.textTheme === "dark"
                          ? "bg-slate-900 text-white border-slate-900 font-bold shadow-xs"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-page)]"
                      }`}
                    >
                      Teks Putih (Dark)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftHero((prev) => ({ ...prev, textTheme: "light" }))
                      }
                      className={`p-2 rounded-xl text-[11px] font-semibold border text-center transition-all ${
                        draftHero.textTheme === "light"
                          ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-500 font-bold"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-page)]"
                      }`}
                    >
                      Teks Hitam (Light)
                    </button>
                  </div>
                </div>
              </div>

              {/* Blur softness */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[var(--text-primary)] block">
                    Efek Kelembutan Background (Blur):
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Membuat foto lebih halus agar teks semakin menonjol.
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: "none", label: "Tajam" },
                    { id: "sm", label: "Halus (4px)" },
                    { id: "md", label: "Sinematis (8px)" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        setDraftHero((prev) => ({
                          ...prev,
                          blurAmount: b.id as any,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        draftHero.blurAmount === b.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-indigo-400"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Save Button inside Column */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetHero}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset Default
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveHero}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Simpan Perubahan Background
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal CRUD Package */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPackageId ? "Edit Paket Wisata" : "Tambah Paket Wisata Baru"}
          maxWidth="lg"
        >
          <form onSubmit={handleSavePackage} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Judul Paket Wisata
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="misal: 3 Hari Eksotisme Candi & Pantai"
                className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Destinasi</label>
                <CustomSelect
                  options={DESTINATION_OPTIONS.filter((d) => d.value !== "Semua Destinasi")}
                  value={formDestination}
                  onChange={setFormDestination}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Durasi</label>
                <CustomSelect
                  options={DURATION_OPTIONS}
                  value={formDuration}
                  onChange={setFormDuration}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Harga Katalog (Rp / Pax)
                </label>
                <input
                  type="number"
                  required
                  step="50000"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Badge (Opsional)</label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="misal: Best Seller"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Blind Vendor Standard Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Titik Jangkar Wisata (Anchor Zone)
                </label>
                <input
                  type="text"
                  value={formAnchorZone}
                  onChange={(e) => setFormAnchorZone(e.target.value)}
                  placeholder="misal: Zona Candi Prambanan & Merapi"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                  Standar Fasilitas Setaraf (Blind Vendor)
                </label>
                <input
                  type="text"
                  value={formFacilityStandard}
                  onChange={(e) => setFormFacilityStandard(e.target.value)}
                  placeholder="misal: Hotel Setaraf Bintang 3 + Bus Eksekutif"
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Daftar Objek Wisata (Pisahkan dengan koma)
              </label>
              <textarea
                rows={2}
                value={formSpots}
                onChange={(e) => setFormSpots(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Simpan Paket Wisata
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Add Partner */}
      {isPartnerModalOpen && (
        <Modal
          isOpen={isPartnerModalOpen}
          onClose={() => setIsPartnerModalOpen(false)}
          title="Tambah Mitra / Kru Lapangan Baru"
          maxWidth="md"
        >
          <form onSubmit={handleSavePartner} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Nama Mitra / Kru</label>
              <input
                type="text"
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="misal: Hotel Melia Purosani"
                className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Kategori</label>
                <CustomSelect
                  options={[
                    { value: "Hotel", label: "Hotel" },
                    { value: "Restoran", label: "Restoran" },
                    { value: "Pusat Oleh-oleh", label: "Pusat Oleh-oleh" },
                    { value: "Transportasi", label: "Transportasi" },
                    { value: "Tour Leader", label: "Tour Leader" },
                    { value: "Tim Dokumentasi", label: "Tim Dokumentasi" },
                    { value: "Tim Medis", label: "Tim Medis" },
                    { value: "Tim Pengawas", label: "Tim Pengawas" },
                  ]}
                  value={pCategory}
                  onChange={(v) => setPCategory(v as any)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Zona Wisata</label>
                <input
                  type="text"
                  value={pZone}
                  onChange={(e) => setPZone(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Harga Modal Satuan (Rp)</label>
                <input
                  type="number"
                  value={pPrice}
                  onChange={(e) => setPPrice(Number(e.target.value))}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">Waktu Tempuh ke Anchor (Menit)</label>
                <input
                  type="number"
                  value={pTime}
                  onChange={(e) => setPTime(Number(e.target.value))}
                  className="w-full h-10 px-3 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsPartnerModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Simpan Mitra
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
