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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CustomSelect } from "@/components/ui/select";
import {
  useTourPackages,
  addTourPackage,
  updateTourPackage,
  deleteTourPackage,
  toggleTourPackageActive,
  type TourPackageItem,
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

export function ModuleCmsPackages() {
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
  const [formSpots, setFormSpots] = useState("");
  const [formInclusions, setFormInclusions] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

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

  const activeCount = packages.filter((p) => p.isActive).length;
  const inactiveCount = packages.filter((p) => !p.isActive).length;

  const handleOpenCreateModal = () => {
    setEditingPackageId(null);
    setFormTitle("");
    setFormDestination("Yogyakarta");
    setFormDuration("3D2N");
    setFormPrice(750000);
    setFormBadge("Populer");
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

    if (editingPackageId) {
      updateTourPackage(editingPackageId, {
        title: formTitle.trim(),
        destination: formDestination,
        duration: formDuration,
        price: Number(formPrice),
        badge: formBadge.trim() || undefined,
        spots: spotsList.length > 0 ? spotsList : ["Destinasi Pilihan"],
        inclusions: inclusionsList.length > 0 ? inclusionsList : ["Transportasi Wisata"],
        isActive: formIsActive,
      });
    } else {
      addTourPackage({
        title: formTitle.trim(),
        destination: formDestination,
        duration: formDuration,
        price: Number(formPrice),
        badge: formBadge.trim() || undefined,
        spots: spotsList.length > 0 ? spotsList : ["Destinasi Pilihan"],
        inclusions: inclusionsList.length > 0 ? inclusionsList : ["Transportasi Wisata"],
        isActive: formIsActive,
      });
    }

    setIsModalOpen(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Katalog Landing Page
          </span>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">
            Kelola Paket Wisata Publik
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Paket yang diaktifkan di sini langsung tampil di landing page utama NusaTrip secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="md"
            onClick={handleOpenCreateModal}
            className="gap-2 text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Paket Wisata</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5" />
            <input
              type="text"
              aria-label="Cari nama paket atau spot wisata"
              placeholder="Cari nama paket, kota, atau spot wisata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="w-full sm:w-56">
            <CustomSelect
              id="cms-dest-filter"
              value={selectedDestination}
              onChange={(val) => setSelectedDestination(val)}
              options={DESTINATION_OPTIONS}
            />
          </div>

          <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Semua ({packages.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "active"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "inactive"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Nonaktif ({inactiveCount})
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-[var(--text-secondary)]">Sinkronisasi Landing</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {activeCount} Live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-2xl border transition-all flex flex-col justify-between bg-[var(--surface-card)] p-5 ${
              pkg.isActive
                ? "border-[var(--border-subtle)] shadow-sm hover:shadow-md"
                : "border-dashed border-gray-300 dark:border-neutral-700 opacity-60 bg-gray-50/50 dark:bg-neutral-900/50"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md">
                  {pkg.destination}
                </span>

                <div className="flex items-center gap-1.5">
                  {pkg.badge && (
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200">
                      {pkg.badge}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pkg.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-neutral-800 dark:text-gray-300"
                    }`}
                  >
                    {pkg.isActive ? "Tampil di Landing" : "Disembunyikan"}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 line-clamp-2">
                {pkg.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-indigo-600 text-sm">
                    {formatRupiah(pkg.price)}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">/pax</span>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Destinasi Spot:
                </span>
                <div className="flex flex-wrap gap-1">
                  {pkg.spots.map((spot, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-medium border border-[var(--border-subtle)]"
                    >
                      {spot}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1.5">
                  Fasilitas Termasuk:
                </span>
                <div className="flex flex-wrap gap-1">
                  {pkg.inclusions.map((inc, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    >
                      {inc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleTourPackageActive(pkg.id)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  pkg.isActive
                    ? "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                    : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                {pkg.isActive ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Sembunyikan</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Aktifkan</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditModal(pkg)}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Ubah</span>
                </Button>
                <button
                  type="button"
                  onClick={() => deleteTourPackage(pkg.id)}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  title="Hapus Paket"
                  aria-label={`Hapus paket ${pkg.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackageId ? "Perbarui Paket Wisata" : "Tambah Paket Wisata Baru"}
        description="Perubahan informasi paket akan langsung terlihat pada halaman depan NusaTrip."
        maxWidth="lg"
      >
        <form onSubmit={handleSavePackage} className="space-y-4 py-2">
          <div>
            <label htmlFor="form-pkg-title" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Judul Paket Wisata
            </label>
            <input
              id="form-pkg-title"
              type="text"
              required
              placeholder="Contoh: 3 Hari 2 Malam Kawah Bromo & Pesona Batu"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomSelect
              id="form-pkg-dest"
              label="Destinasi Kota"
              value={formDestination}
              onChange={(val) => setFormDestination(val)}
              options={DESTINATION_OPTIONS.filter((d) => d.value !== "Semua Destinasi")}
            />

            <CustomSelect
              id="form-pkg-dur"
              label="Durasi Wisata"
              value={formDuration}
              onChange={(val) => setFormDuration(val)}
              options={DURATION_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="form-pkg-price" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Harga per Orang (Rp)
              </label>
              <input
                id="form-pkg-price"
                type="number"
                required
                min={50000}
                step={25000}
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="form-pkg-badge" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Badge Promosi (Opsional)
              </label>
              <input
                id="form-pkg-badge"
                type="text"
                placeholder="Contoh: Terlaris, Favorit, Hemat"
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="form-pkg-spots" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Spot Wisata yang Dikunjungi (pisahkan dengan koma)
            </label>
            <textarea
              id="form-pkg-spots"
              rows={2}
              placeholder="Contoh: Sunrise Penanjakan, Kawah Bromo, Pasir Berbisik"
              value={formSpots}
              onChange={(e) => setFormSpots(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="form-pkg-inclusions" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Fasilitas Termasuk / Inclusions (pisahkan dengan koma)
            </label>
            <textarea
              id="form-pkg-inclusions"
              rows={2}
              placeholder="Contoh: Transportasi AC, Hotel Bintang 3, Makan Siang & Malam, Tiket Masuk"
              value={formInclusions}
              onChange={(e) => setFormInclusions(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="form-pkg-active"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="form-pkg-active" className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
              Tampilkan langsung paket ini di Landing Page publik
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="gradient" size="sm" type="submit">
              Simpan Paket Wisata
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
