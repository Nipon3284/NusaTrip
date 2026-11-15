export interface TourPackageItem {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  badge?: string;
  spots: string[];
  inclusions: string[];
  isActive: boolean;
  minPax?: number;
}

export interface CustomerLeadItem {
  id: string;
  name: string;
  phone: string;
  destination: string;
  category: string;
  pax: number;
  days: number;
  hotel: string;
  notes?: string;
  createdAt: string;
  status: "baru" | "dihitung" | "deal";
}

export const INITIAL_PACKAGES: TourPackageItem[] = [
  {
    id: "pkg-1",
    title: "1 Hari Heritage & Volcano Lava Tour",
    destination: "Yogyakarta",
    duration: "1 Hari (City Tour)",
    price: 275000,
    badge: "Terlaris",
    spots: ["Jeep Lava Tour Merapi", "Candi Prambanan", "Malioboro Heritage", "Pusat Oleh-Oleh"],
    inclusions: ["Mobil AC + Driver", "Tiket Masuk Wisata", "Makan Siang Khas", "Air Mineral"],
    isActive: true,
    minPax: 2,
  },
  {
    id: "pkg-2",
    title: "2 Hari 1 Malam Eksotisme Bahari & Budaya",
    destination: "Bali",
    duration: "2D1N",
    price: 980000,
    badge: "Favorit Keluarga",
    spots: ["Tanjung Benoa Watersport", "Pantai Melasti", "Garuda Wisnu Kencana", "Sunset Jimbaran"],
    inclusions: ["Hotel Bintang 3", "Transportasi Pariwisata", "Konsumsi 4x", "Pemandu Berlisensi"],
    isActive: true,
    minPax: 4,
  },
  {
    id: "pkg-3",
    title: "3 Hari 2 Malam Kawah Bromo & Pesona Batu",
    destination: "Bromo - Malang",
    duration: "3D2N",
    price: 1450000,
    badge: "Petualangan",
    spots: ["Sunrise Point Penanjakan", "Kawah Bromo & Pasir Berbisik", "Museum Angkut", "Jatim Park 3"],
    inclusions: ["Jeep 4x4 Hardtop Bromo", "Hotel 2 Malam", "Konsumsi Lengkap", "Dokumentasi Foto"],
    isActive: true,
    minPax: 4,
  },
  {
    id: "pkg-4",
    title: "3 Hari 2 Malam Healing & Sejuk Priangan",
    destination: "Bandung",
    duration: "3D2N",
    price: 1150000,
    badge: "Populer",
    spots: ["Kawah Putih Ciwidey", "Glamping Lakeside Rancabali", "Floating Market Lembang", "Dusun Bambu"],
    inclusions: ["Transportasi Wisata", "Hotel Bintang 3/4", "Tiket Terusan Wisata", "Tour Leader Standby"],
    isActive: true,
    minPax: 4,
  },
  {
    id: "pkg-5",
    title: "4 Hari 3 Malam The Real Tropical Paradise",
    destination: "Lombok",
    duration: "4D3N",
    price: 2250000,
    badge: "Eksklusif",
    spots: ["Snorkeling 3 Gili", "Desa Adat Sade", "Bukit Merese", "Pantai Kuta Mandalika"],
    inclusions: ["Private Boat Snorkeling", "Resort Tepi Pantai", "Makan Malam Romantis", "Transport Full AC"],
    isActive: true,
    minPax: 2,
  },
  {
    id: "pkg-6",
    title: "2 Hari 1 Malam Blue Fire Ijen & Savana Baluran",
    destination: "Banyuwangi",
    duration: "2D1N",
    price: 890000,
    badge: "Eksotis",
    spots: ["Kawah Ijen Blue Fire", "Savana Bekol Baluran", "Pantai Bama", "Pusat Oleh-Oleh Osing"],
    inclusions: ["Masker Gas & Pemandu Ijen", "Trooper Baluran", "Hotel Bintang 3", "Makan 3x"],
    isActive: true,
    minPax: 4,
  },
];

export const INITIAL_LEADS: CustomerLeadItem[] = [
  {
    id: "LEAD-9012",
    name: "PT Nusantara Prima (Ibu Cindy)",
    phone: "081298765432",
    destination: "Yogyakarta",
    category: "Company Gathering & Outing",
    pax: 120,
    days: 3,
    hotel: "Bintang 4",
    notes: "Membutuhkan 3 bus eksekutif, outbound di Kaliurang, dan gala dinner.",
    createdAt: "10:15 WIB",
    status: "baru",
  },
  {
    id: "LEAD-8841",
    name: "Keluarga Bpk. Hendrawan",
    phone: "085611223344",
    destination: "Bali",
    category: "Wisata Keluarga",
    pax: 14,
    days: 4,
    hotel: "Bintang 3 / 4",
    notes: "Private trip santai, ada 2 balita dan 2 lansia.",
    createdAt: "09:30 WIB",
    status: "dihitung",
  },
];
