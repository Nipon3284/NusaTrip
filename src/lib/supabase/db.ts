import { supabase, isSupabaseConfigured } from "./client";
import {
  type TourPackageItem,
  type PartnerItem,
  type ZoneItem,
  type CustomerLeadItem,
  INITIAL_PACKAGES,
  INITIAL_PARTNERS,
  INITIAL_ZONES,
  INITIAL_LEADS,
} from "@/lib/data/tour-data";

// ==============================================================================
// 1. REPOSITORI KATALOG PAKET WISATA (tbl_katalog_paket)
// ==============================================================================

export async function getDbPackages(): Promise<TourPackageItem[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_PACKAGES;
  }

  try {
    const { data, error } = await supabase
      .from("tbl_katalog_paket")
      .select("*")
      .order("waktu_dibuat", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_PACKAGES;
    }

    return data.map((row) => ({
      id: row.id_paket,
      title: row.judul_paket,
      destination: row.kota_destinasi,
      duration: row.durasi_trip,
      price: Number(row.harga_per_pax),
      badge: row.badge_label || "",
      anchorZone: row.id_zona || "",
      facilityStandard: row.standar_fasilitas || "",
      spots: Array.isArray(row.daftar_wisata) ? row.daftar_wisata : [],
      inclusions: Array.isArray(row.fasilitas_inklusif) ? row.fasilitas_inklusif : [],
      isActive: row.status_aktif ?? true,
    }));
  } catch {
    return INITIAL_PACKAGES;
  }
}

export async function saveDbPackages(packages: TourPackageItem[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const rows = packages.map((p) => ({
      id_paket: p.id,
      judul_paket: p.title,
      kota_destinasi: p.destination,
      durasi_trip: p.duration,
      harga_per_pax: p.price,
      badge_label: p.badge || null,
      standar_fasilitas: p.facilityStandard || "Bintang 3",
      daftar_wisata: p.spots,
      fasilitas_inklusif: p.inclusions,
      status_aktif: p.isActive,
    }));

    const { error } = await supabase.from("tbl_katalog_paket").upsert(rows);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 2. REPOSITORI MITRA REKANAN VENDOR (tbl_mitra_vendor)
// ==============================================================================

export async function getDbPartners(): Promise<PartnerItem[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_PARTNERS;
  }

  try {
    const { data, error } = await supabase
      .from("tbl_mitra_vendor")
      .select("*")
      .order("waktu_dibuat", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_PARTNERS;
    }

    return data.map((row) => ({
      id: row.id_mitra,
      name: row.nama_mitra,
      category: row.kategori,
      zona_wisata: row.id_zona || "",
      kualifikasi_standar: row.kualifikasi_standar,
      kapasitas_maksimal: row.kapasitas_maksimal,
      harga_modal_satuan: Number(row.harga_modal_satuan),
      syarat_minimum_order: row.syarat_minimum_order,
      waktu_tempuh_ke_wisata_menit: row.waktu_tempuh_ke_wisata_menit,
      titik_koordinat: {
        lat: Number(row.latitude) || -7.7956,
        lng: Number(row.longitude) || 110.3695,
      },
      status_surat_sehat: row.status_surat_sehat ?? false,
      status_aktif: row.status_aktif ?? true,
      contact: row.nomor_kontak || "",
      rating: Number(row.rating) || 4.8,
    }));
  } catch {
    return INITIAL_PARTNERS;
  }
}

export async function saveDbPartner(partner: PartnerItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const row = {
      id_mitra: partner.id,
      nama_mitra: partner.name,
      kategori: partner.category,
      id_zona: partner.zona_wisata || null,
      kualifikasi_standar: partner.kualifikasi_standar,
      kapasitas_maksimal: partner.kapasitas_maksimal,
      harga_modal_satuan: partner.harga_modal_satuan,
      syarat_minimum_order: partner.syarat_minimum_order,
      waktu_tempuh_ke_wisata_menit: partner.waktu_tempuh_ke_wisata_menit,
      latitude: partner.titik_koordinat?.lat || -7.7956,
      longitude: partner.titik_koordinat?.lng || 110.3695,
      status_surat_sehat: partner.status_surat_sehat,
      status_aktif: partner.status_aktif,
      nomor_kontak: partner.contact,
      rating: partner.rating,
    };

    const { error } = await supabase.from("tbl_mitra_vendor").upsert(row);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteDbPartner(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from("tbl_mitra_vendor").delete().eq("id_mitra", id);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 3. REPOSITORI ZONA ANCHOR & GIS (tbl_zona_wisata)
// ==============================================================================

export async function getDbZones(): Promise<ZoneItem[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_ZONES;
  }

  try {
    const { data, error } = await supabase
      .from("tbl_zona_wisata")
      .select("*")
      .order("waktu_dibuat", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_ZONES;
    }

    return data.map((row) => ({
      id: row.id_zona,
      name: row.nama_zona,
      destinationCity: row.kota_destinasi,
      anchorName: row.nama_titik_jangkar,
      anchorCoordinates: {
        lat: Number(row.latitude) || -7.7956,
        lng: Number(row.longitude) || 110.3695,
      },
      maxTransitMinutes: row.waktu_tempuh_maksimal_menit,
      isActive: row.status_aktif ?? true,
      description: row.deskripsi || "",
    }));
  } catch {
    return INITIAL_ZONES;
  }
}

export async function saveDbZone(zone: ZoneItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const row = {
      id_zona: zone.id,
      nama_zona: zone.name,
      kota_destinasi: zone.destinationCity,
      nama_titik_jangkar: zone.anchorName,
      latitude: zone.anchorCoordinates?.lat || -7.7956,
      longitude: zone.anchorCoordinates?.lng || 110.3695,
      waktu_tempuh_maksimal_menit: zone.maxTransitMinutes,
      status_aktif: zone.isActive,
      deskripsi: zone.description,
    };

    const { error } = await supabase.from("tbl_zona_wisata").upsert(row);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteDbZone(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from("tbl_zona_wisata").delete().eq("id_zona", id);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 4. REPOSITORI LEADS & PENGAJUAN TRIP B2B (tbl_pengajuan_paket_mandiri)
// ==============================================================================

export async function getDbLeads(): Promise<CustomerLeadItem[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_LEADS;
  }

  try {
    const { data, error } = await supabase
      .from("tbl_pengajuan_paket_mandiri")
      .select("*")
      .order("waktu_diajukan", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_LEADS;
    }

    return data.map((row) => ({
      id: row.id_pengajuan,
      name: row.nama_pemesan,
      institution: row.nama_instansi || undefined,
      phone: row.nomor_whatsapp,
      destination: row.kota_destinasi,
      category: row.kategori_acara,
      pax: row.jumlah_pax,
      days: row.durasi_hari,
      hotel: row.kelas_bintang_hotel,
      budget: Number(row.estimasi_anggaran),
      customerBid: Number(row.tawaran_pelanggan || row.estimasi_anggaran),
      bottomLineCost: Number(row.batas_bawah_modal_dss || 0),
      targetMargin: Number(row.margin_keuntungan_target || 15),
      createdAt: new Date(row.waktu_diajukan).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB",
      status: row.status_pengajuan as any,
      notes: row.catatan_tambahan || "",
      selectedSpots: [],
      pettyCashInitial: 1500000,
      fieldExpenses: [],
    }));
  } catch {
    return INITIAL_LEADS;
  }
}

export async function insertDbLead(lead: CustomerLeadItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const row = {
      id_pengajuan: lead.id,
      nama_pemesan: lead.name,
      nama_instansi: lead.institution || null,
      nomor_whatsapp: lead.phone,
      kota_destinasi: lead.destination,
      kategori_acara: lead.category,
      jumlah_pax: lead.pax,
      durasi_hari: lead.days,
      kelas_bintang_hotel: lead.hotel,
      estimasi_anggaran: lead.budget,
      tawaran_pelanggan: lead.customerBid,
      batas_bawah_modal_dss: lead.bottomLineCost,
      margin_keuntungan_target: lead.targetMargin,
      status_pengajuan: lead.status || "baru",
      catatan_tambahan: lead.notes || null,
    };

    const { error } = await supabase.from("tbl_pengajuan_paket_mandiri").insert(row);
    return !error;
  } catch {
    return false;
  }
}

export async function updateDbLeadStatus(id: string, status: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from("tbl_pengajuan_paket_mandiri")
      .update({ status_pengajuan: status })
      .eq("id_pengajuan", id);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 5. REPOSITORI KONFIGURASI SISTEM (tbl_konfigurasi_sistem)
// Sinkronisasi Kunci API (Google Maps, dsb.) ke seluruh perangkat admin
// ==============================================================================

export async function getDbSystemConfig(key: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("tbl_konfigurasi_sistem")
      .select("nilai")
      .eq("kunci", key)
      .maybeSingle();

    if (error || !data) return null;
    return (data as { nilai?: string }).nilai || null;
  } catch {
    return null;
  }
}

export async function saveDbSystemConfig(
  key: string,
  value: string,
  description?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const row = {
      kunci: key,
      nilai: value,
      keterangan: description || "Konfigurasi terpadu NusaTrip",
      waktu_diperbarui: new Date().toISOString(),
    };

    const { error } = await supabase.from("tbl_konfigurasi_sistem").upsert(row);
    return !error;
  } catch {
    return false;
  }
}
