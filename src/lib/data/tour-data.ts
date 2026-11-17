export interface TourPackageItem {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  badge?: string;
  anchorZone: string;
  facilityStandard: string;
  spots: string[];
  inclusions: string[];
  isActive: boolean;
  minPax?: number;
}

export type LeadStatus =
  | "baru"
  | "negosiasi"
  | "menunggu_dp"
  | "proses_dss"
  | "final_h7"
  | "selesai";

export interface PenggunaItem {
  id_pengguna: string;
  email: string;
  nama_lengkap: string;
  nomor_telepon?: string;
  peran_pengguna: "admin" | "pelanggan";
  google_id?: string;
  foto_profil_url?: string;
  nama_instansi?: string;
}

export interface NegotiationMessageItem {
  id: string;
  sender: "pelanggan" | "admin" | "sistem_dss";
  message: string;
  proposedBid?: number;
  timestamp: string;
}

export interface RatingKomponenItem {
  ratingHotel?: number;
  ratingRestoran?: number;
  ratingBus?: number;
  ratingTourLeader?: number;
  ulasan?: string;
  waktuRating?: string;
}

export interface WebBeaconTrackingItem {
  token: string;
  isActive: boolean;
  busLat: number;
  busLng: number;
  speedKmh: number;
  lastUpdated: string;
  statusRundown: string;
  driverPhone?: string;
}

export interface FieldExpenseItem {
  id: string;
  reporter: string;
  category: "Ban & Kendaraan" | "Parkir & Retribusi" | "Obat & Medis" | "Konsumsi Darurat" | "Lain-lain";
  amount: number;
  receiptNote: string;
  time: string;
  receiptImage?: string;
}

export interface CustomerLeadItem {
  id: string;
  name: string;
  institution?: string;
  phone: string;
  destination: string;
  category: string;
  pax: number;
  days: number;
  hotel: string;
  budget?: number;
  selectedSpots?: string[];
  notes?: string;
  createdAt: string;
  departureDate?: string;
  status: LeadStatus;
  
  // Asosiasi Pengguna & Jalur Pemesanan
  userId?: string;
  userEmail?: string;
  orderTrack?: "katalog_ritel" | "kustom_b2b";
  commandCenterPhase?: "masa_tunggu" | "h7_terbuka" | "hari_h_berjalan" | "selesai_h1";

  // Fitur Ruang Negosiasi & Shadow Price DSS
  customerBid?: number;
  bottomLineCost?: number; // Z-Minimum rahasia modal DSS
  targetMargin?: number;
  counterOffer?: string;
  dpAmount?: number;
  isDealApproved?: boolean;
  negotiationMessages?: NegotiationMessageItem[];

  // Pelunasan H-7
  repaymentAmount?: number;
  isRepaymentPaid?: boolean;

  // Fitur H-7 Command Center
  h7Alert?: boolean;
  assignedCrew?: {
    tourLeader: { name: string; license: string; phone: string; certified: boolean };
    documentation: { name: string; equip: string; certified: boolean };
    medic: { name: string; cert: string; certified: boolean };
    supervisor: { name: string; phone: string; certified: boolean };
  };
  allocatedVendors?: {
    hotel: { name: string; zone: string; roomType: string; address: string };
    restaurant: { name: string; zone: string; menu: string; address: string };
    souvenir: { name: string; zone: string; specialty: string; address: string };
    transport: { name: string; fleet: string; capacity: number; platNo: string };
  };

  // Fitur Hari-H: VIP Group Clearance & Web-Beacon GPS Live Tracking
  vipClearanceCode?: string;
  webBeacon?: WebBeaconTrackingItem;

  // Fitur H+1: LPJ Invoice & Rating Berbasis Komponen
  componentRatings?: RatingKomponenItem;

  // Fitur Kas Kecil & Pengeluaran Lapangan
  pettyCashInitial?: number;
  fieldExpenses?: FieldExpenseItem[];
}

export interface PartnerItem {
  id: string;
  name: string;
  category:
    | "Wisata (Anchor Zone)"
    | "Hotel"
    | "Restoran"
    | "Pusat Oleh-oleh"
    | "Transportasi"
    | "Tour Leader"
    | "Tim Dokumentasi"
    | "Tim Medis"
    | "Tim Pengawas";
  zona_wisata: string;
  kualifikasi_standar: string;
  kapasitas_maksimal: number;
  harga_modal_satuan: number;
  syarat_minimum_order: number;
  waktu_tempuh_ke_wisata_menit: number; // Optimal <= 25 menit
  titik_koordinat: { lat: number; lng: number };
  status_surat_sehat?: boolean; // Khusus kru lapangan
  status_aktif: boolean;
  contact: string;
  rating: number;
}

export interface ZoneItem {
  id: string;
  name: string;
  destinationCity: string;
  anchorName: string;
  anchorCoordinates: { lat: number; lng: number };
  maxTransitMinutes: number;
  description?: string;
  isActive: boolean;
}

export const INITIAL_ZONES: ZoneItem[] = [
  {
    id: "zn-borobudur",
    name: "Zona Borobudur & Magelang",
    destinationCity: "Yogyakarta",
    anchorName: "Candi Borobudur & Dagi Abhayagiri",
    anchorCoordinates: { lat: -7.6079, lng: 110.2038 },
    maxTransitMinutes: 25,
    description: "Zona cagar budaya dunia UNESCO, perbukitan Menoreh, dan sentra kuliner Magelang.",
    isActive: true,
  },
  {
    id: "zn-prambanan",
    name: "Zona Prambanan & Sleman",
    destinationCity: "Yogyakarta",
    anchorName: "Candi Prambanan & Ratu Boko",
    anchorCoordinates: { lat: -7.752, lng: 110.4915 },
    maxTransitMinutes: 25,
    description: "Zona candi Hindu terbesar, lereng Gunung Merapi, dan sentra wisata Sleman.",
    isActive: true,
  },
  {
    id: "zn-malioboro",
    name: "Zona Kota & Malioboro",
    destinationCity: "Yogyakarta",
    anchorName: "Malioboro Heritage & Keraton Yogyakarta",
    anchorCoordinates: { lat: -7.7956, lng: 110.3695 },
    maxTransitMinutes: 20,
    description: "Pusat denyut budaya Kraton Ngayogyakarta, belanja Malioboro, dan sentra kuliner gudeg.",
    isActive: true,
  },
  {
    id: "zn-jateng-diy",
    name: "Jawa Tengah & DIY (Kru & Armada)",
    destinationCity: "Jawa Tengah & DIY",
    anchorName: "Pool Terpadu Armada & Kru Pariwisata",
    anchorCoordinates: { lat: -7.795, lng: 110.37 },
    maxTransitMinutes: 30,
    description: "Pusat pool bus antar-kota, divisi pemandu HPI, tim medis K3, dan kru dokumentasi Jawa Tengah.",
    isActive: true,
  },
  {
    id: "zn-lombok",
    name: "Zona Gili Trawangan & Kuta Mandalika",
    destinationCity: "Lombok",
    anchorName: "Pelabuhan Bangsal & Sirkuit Internasional Mandalika",
    anchorCoordinates: { lat: -8.352, lng: 116.042 },
    maxTransitMinutes: 30,
    description: "Destinasi bahari pulau 3 Gili, perbukitan Kuta Mandalika, dan sentra tenun tradisional Sasak.",
    isActive: true,
  },
  {
    id: "zn-bali",
    name: "Zona Pantai Melasti & GWK",
    destinationCity: "Bali",
    anchorName: "Garuda Wisnu Kencana & Pantai Melasti",
    anchorCoordinates: { lat: -8.845, lng: 115.163 },
    maxTransitMinutes: 25,
    description: "Kawasan semenanjung Bukit Jimbaran, tebing kapur Pantai Melasti, dan sunset seafood.",
    isActive: true,
  },
  {
    id: "zn-bromo",
    name: "Zona Kaldera Bromo & Wisata Batu",
    destinationCity: "Bromo - Malang",
    anchorName: "Sunrise Point Penanjakan & Gunung Bromo",
    anchorCoordinates: { lat: -7.9425, lng: 112.953 },
    maxTransitMinutes: 30,
    description: "Kawasan lautan pasir Bromo, jeep 4x4 offroad, dan taman wisata dataran tinggi Kota Batu.",
    isActive: true,
  },
  {
    id: "zn-bandung",
    name: "Zona Lembang & Ciwidey",
    destinationCity: "Bandung",
    anchorName: "Kawah Putih Ciwidey & Floating Market Lembang",
    anchorCoordinates: { lat: -6.815, lng: 107.618 },
    maxTransitMinutes: 30,
    description: "Wisata alam sejuk Parahyangan, kebun teh Ciwidey, glamping dan kuliner khas Sunda.",
    isActive: true,
  },
  {
    id: "zn-banyuwangi",
    name: "Zona Kawah Ijen & Savana Baluran",
    destinationCity: "Banyuwangi",
    anchorName: "Kawah Ijen Blue Fire & Savana Bekol",
    anchorCoordinates: { lat: -8.058, lng: 114.242 },
    maxTransitMinutes: 35,
    description: "Wisata fenomena api biru kawah belerang Ijen dan padang savana Afrika van Java Baluran.",
    isActive: true,
  },
];

export const INITIAL_PACKAGES: TourPackageItem[] = [
  {
    id: "pkg-1",
    title: "1 Hari Heritage & Volcano Lava Tour",
    destination: "Yogyakarta",
    duration: "1 Hari (City Tour)",
    price: 275000,
    badge: "Terlaris",
    anchorZone: "Zona Candi Prambanan & Merapi",
    facilityStandard: "Bus Pariwisata Medium AC + Resto Prasmanan Setaraf Bintang 3",
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
    anchorZone: "Zona Pantai Melasti & GWK",
    facilityStandard: "Hotel Setaraf Bintang 3 Zona Kuta-Jimbaran + Bus Eksekutif",
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
    anchorZone: "Zona Kaldera Bromo & Wisata Batu",
    facilityStandard: "Hotel Setaraf Bintang 3/4 Zona Kota Batu + Jeep 4x4 & Bus Pariwisata",
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
    anchorZone: "Zona Lembang & Ciwidey",
    facilityStandard: "Hotel Setaraf Bintang 3/4 Zona Lembang-Setiabudi + Bus Pariwisata",
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
    anchorZone: "Zona Gili Trawangan & Kuta Mandalika",
    facilityStandard: "Resort Setaraf Bintang 4 Tepi Pantai + Private Speedboat",
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
    anchorZone: "Zona Kawah Ijen & Savana Baluran",
    facilityStandard: "Hotel Setaraf Bintang 3 Zona Kota Banyuwangi + Trooper Baluran",
    spots: ["Kawah Ijen Blue Fire", "Savana Bekol Baluran", "Pantai Bama", "Pusat Oleh-Oleh Osing"],
    inclusions: ["Masker Gas & Pemandu Ijen", "Trooper Baluran", "Hotel Bintang 3", "Makan 3x"],
    isActive: true,
    minPax: 4,
  },
];

export const INITIAL_LEADS: CustomerLeadItem[] = [
  {
    id: "LEAD-9012",
    name: "Ibu Cindy Permatasari",
    institution: "PT Nusantara Prima Mandiri",
    phone: "081298765432",
    destination: "Yogyakarta",
    category: "Company Gathering & Outing",
    pax: 115,
    days: 3,
    hotel: "Bintang 3",
    budget: 65000000,
    customerBid: 52000000,
    bottomLineCost: 50400000, // Z-Minimum modal DSS
    targetMargin: 12000000,
    counterOffer: "Kami ajukan penyesuaian di Rp 58.500.000 dengan upgrade menu gala dinner prasmanan khas keraton.",
    selectedSpots: ["Candi Prambanan", "Jeep Lava Tour Merapi", "Tebing Breksi", "Malioboro"],
    notes: "Membutuhkan 2 bus eksekutif + 1 hiace, outbound di Kaliurang, dan gala dinner.",
    createdAt: "10:15 WIB",
    departureDate: "2026-11-28",
    status: "negosiasi",
    orderTrack: "kustom_b2b",
    commandCenterPhase: "masa_tunggu",
    h7Alert: false,
    pettyCashInitial: 1500000,
    fieldExpenses: [],
    negotiationMessages: [
      {
        id: "msg-1",
        sender: "pelanggan",
        message: "Halo NusaTrip, kami mengajukan anggaran Rp 52.000.000 untuk 115 orang karyawan PT Nusantara Prima Mandiri.",
        proposedBid: 52000000,
        timestamp: "10:15 WIB",
      },
      {
        id: "msg-2",
        sender: "sistem_dss",
        message: "Rekomendasi Penyesuaian DSS: Modal dasar armada 2 Big Bus + 1 Hiace dan hotel bintang 3 berada di kisaran Rp 50.400.000. Tawaran optimal yang disarankan adalah Rp 58.500.000.",
        timestamp: "10:16 WIB",
      },
      {
        id: "msg-3",
        sender: "admin",
        message: "Kami ajukan penyesuaian di Rp 58.500.000 dengan upgrade menu gala dinner prasmanan khas keraton dan live akustik.",
        proposedBid: 58500000,
        timestamp: "10:20 WIB",
      },
    ],
  },
  {
    id: "ORD-H7-7721",
    name: "Bpk. Hendra Gunawan",
    institution: "Komite SMAN 1 Surakarta",
    phone: "081388776655",
    destination: "Yogyakarta",
    category: "Study Tour & Kunjungan Edukasi",
    pax: 120,
    days: 3,
    hotel: "Bintang 3",
    budget: 72000000,
    customerBid: 72000000,
    bottomLineCost: 54000000,
    targetMargin: 18000000,
    dpAmount: 36000000,
    repaymentAmount: 36000000,
    isRepaymentPaid: false,
    isDealApproved: true,
    selectedSpots: ["Candi Borobudur", "Candi Prambanan", "Taman Sari", "Malioboro Heritage"],
    notes: "DP 50% telah diterima. Tagihan pelunasan diterbitkan pada fase H-7.",
    createdAt: "08:20 WIB",
    departureDate: "2026-11-20", // H-3 keberangkatan (masuk H-7)
    status: "final_h7",
    orderTrack: "kustom_b2b",
    commandCenterPhase: "h7_terbuka",
    h7Alert: true,
    assignedCrew: {
      tourLeader: { name: "Budi Santoso, S.Par", license: "HPI-DIY-2021-089", phone: "081234567890", certified: true },
      documentation: { name: "Reza Mahendra", equip: "Sony A7IV + DJI Mavic 3 Pro", certified: true },
      medic: { name: "Ns. Maya Indah, S.Kep", cert: "K3 Kemenkes & P3K Par", certified: true },
      supervisor: { name: "Aris Munandar", phone: "081399887766", certified: true },
    },
    allocatedVendors: {
      hotel: { name: "Grand Keisha Yogyakarta", zone: "Zona Sleman-UGM", roomType: "Deluxe Twin Room (30 Kamar)", address: "Jl. Affandi No.9, Gejayan, Sleman" },
      restaurant: { name: "RM Bale Raos Keraton", zone: "Zona Keraton", menu: "Prasmanan Tradisional Raja", address: "Jl. Magangan Kulon No.1, Keraton Yogyakarta" },
      souvenir: { name: "Pusat Bakpia Pathok 25", zone: "Zona Malioboro", specialty: "Bakpia Kukus & Kacang Hijau", address: "Jl. KS Tubun No.65, Ngampilan" },
      transport: { name: "PO Haryanto Pariwisata", fleet: "2x Big Bus Mercedes-Benz 50 Seat + 1x Hiace Premio", capacity: 120, platNo: "AB 7788 CD / AB 7789 CD" },
    },
    pettyCashInitial: 1500000,
    fieldExpenses: [
      { id: "fe-1", reporter: "Budi Santoso (TL)", category: "Ban & Kendaraan", amount: 250000, receiptNote: "Tambal ban tubeless Bus 1 di Rest Area Prambanan", time: "11:20 WIB" },
      { id: "fe-2", reporter: "Ns. Maya Indah (Medis)", category: "Obat & Medis", amount: 120000, receiptNote: "Beli Tolak Angin, Oksigen Portabel & Antasida peserta", time: "14:45 WIB" },
    ],
  },
  {
    id: "ORD-H0-4491",
    name: "Bpk. Aditya Pratama",
    institution: "Bank Mandiri Region Jateng & DIY",
    phone: "081223344556",
    destination: "Yogyakarta",
    category: "Company Gathering & Outing",
    pax: 80,
    days: 2,
    hotel: "Bintang 4",
    budget: 48000000,
    customerBid: 48000000,
    bottomLineCost: 35000000,
    targetMargin: 13000000,
    dpAmount: 24000000,
    repaymentAmount: 24000000,
    isRepaymentPaid: true,
    isDealApproved: true,
    selectedSpots: ["Candi Prambanan", "Tebing Breksi", "Malioboro"],
    notes: "Pelunasan 100% LUNAS. Sedang berlangsung Hari-H dengan sistem VIP Group Clearance.",
    createdAt: "Kemarin",
    departureDate: "2026-11-17", // Hari-H
    status: "final_h7",
    orderTrack: "kustom_b2b",
    commandCenterPhase: "hari_h_berjalan",
    vipClearanceCode: "VIP-MANDIRI-4491-LUNAS",
    h7Alert: false,
    webBeacon: {
      token: "wb-mandiri-4491-live",
      isActive: true,
      busLat: -7.7525,
      busLng: 110.492,
      speedKmh: 45,
      lastUpdated: "Baru saja (10 detik lalu)",
      statusRundown: "Rombongan Bus sedang melintas Jl. Solo menuju Restoran Jejamuran",
    },
    assignedCrew: {
      tourLeader: { name: "Farhan Hakim, S.Par", license: "HPI-DIY-2022-044", phone: "08119887766", certified: true },
      documentation: { name: "Dimas Anggara", equip: "Sony FX3 Cinema + Drone", certified: true },
      medic: { name: "dr. Siska Rahmawati", cert: "K3 Kemenkes & ATLS", certified: true },
      supervisor: { name: "Bambang Trihatmojo", phone: "081299001122", certified: true },
    },
    allocatedVendors: {
      hotel: { name: "Hotel Tentrem Yogyakarta", zone: "Zona Kota & Malioboro", roomType: "Premier King/Twin (25 Kamar)", address: "Jl. P. Mangkubumi No.72A, Yogyakarta" },
      restaurant: { name: "RM Jejamuran Sleman", zone: "Zona Prambanan & Sleman", menu: "Paket Prasmanan Spesial Jamur", address: "Jl. Pendowoharjo, Niron, Sleman" },
      souvenir: { name: "Hamzah Batik Malioboro", zone: "Zona Kota & Malioboro", specialty: "Batik Tulis & Souvenir Nusantara", address: "Jl. Malioboro No.9, Sosromenduran" },
      transport: { name: "PO Haryanto Pariwisata (2x Bus Medium)", fleet: "2x Medium Bus Adiputro 35 Seat", capacity: 80, platNo: "AB 8899 EF / AB 8890 EF" },
    },
    pettyCashInitial: 2000000,
    fieldExpenses: [
      { id: "fe-m1", reporter: "Farhan Hakim (TL)", category: "Parkir & Retribusi", amount: 150000, receiptNote: "Retribusi parkir 2 Bus di Candi Prambanan & porter", time: "09:15 WIB" },
    ],
  },
  {
    id: "ORD-H1-2233",
    name: "Ibu Dr. Ratna Dewi",
    institution: "Ikatan Dokter Indonesia (IDI) DIY",
    phone: "081765432109",
    destination: "Yogyakarta",
    category: "Family Gathering",
    pax: 40,
    days: 2,
    hotel: "Bintang 3",
    budget: 25000000,
    customerBid: 25000000,
    bottomLineCost: 18500000,
    targetMargin: 6500000,
    dpAmount: 12500000,
    repaymentAmount: 12500000,
    isRepaymentPaid: true,
    isDealApproved: true,
    selectedSpots: ["Malioboro", "Taman Sari", "Keraton"],
    notes: "Event telah sukses terlaksana. LPJ dan kuesioner rating komponen telah terbit.",
    createdAt: "2 hari lalu",
    departureDate: "2026-11-15", // H+1 Selesai
    status: "selesai",
    orderTrack: "katalog_ritel",
    commandCenterPhase: "selesai_h1",
    h7Alert: false,
    componentRatings: {
      ratingHotel: 5,
      ratingRestoran: 5,
      ratingBus: 4,
      ratingTourLeader: 5,
      ulasan: "Pelayanan sangat memuaskan, Tour Leader berlisensi sangat ramah dan menguasai sejarah lokal!",
      waktuRating: "Kemarin 19:30 WIB",
    },
    assignedCrew: {
      tourLeader: { name: "Budi Santoso, S.Par", license: "HPI-DIY-2021-089", phone: "081234567890", certified: true },
      documentation: { name: "Reza Mahendra", equip: "Sony A7IV", certified: true },
      medic: { name: "Ns. Maya Indah, S.Kep", cert: "K3 Kemenkes", certified: true },
      supervisor: { name: "Aris Munandar", phone: "081399887766", certified: true },
    },
    allocatedVendors: {
      hotel: { name: "Hotel Santika Premiere Jogja", zone: "Zona Kota & Malioboro", roomType: "Superior Room", address: "Jl. Jend. Sudirman No.19, Cokrodiningratan" },
      restaurant: { name: "RM Bale Raos Keraton", zone: "Zona Keraton", menu: "Prasmanan Tradisional", address: "Jl. Magangan Kulon No.1, Keraton Yogyakarta" },
      souvenir: { name: "Pusat Bakpia Pathok 25", zone: "Zona Malioboro", specialty: "Sentra Bakpia", address: "Jl. KS Tubun No.65" },
      transport: { name: "PO Borobudur Trans", fleet: "1x Big Bus Executive 50 Seat", capacity: 45, platNo: "AA 1234 CD" },
    },
    pettyCashInitial: 1000000,
    fieldExpenses: [
      { id: "fe-d1", reporter: "Budi Santoso (TL)", category: "Konsumsi Darurat", amount: 180000, receiptNote: "Snack box tambahan peserta di Malioboro", time: "16:00 WIB" },
    ],
  },
  {
    id: "LEAD-8841",
    name: "Keluarga Bpk. Hendrawan",
    institution: "Paguyuban Trah Hendrawan",
    phone: "085611223344",
    destination: "Bali",
    category: "Family Gathering",
    pax: 16,
    days: 4,
    hotel: "Bintang 3",
    budget: 22000000,
    customerBid: 16500000,
    bottomLineCost: 17800000, // Z-Minimum di atas penawaran klien (Warning Merah!)
    targetMargin: 4000000,
    counterOffer: "Tawaran Anda di bawah harga modal sewa Hiace dan akomodasi Bali. Minimal penawaran aman Rp 19.800.000.",
    selectedSpots: ["Pantai Melasti", "GWK", "Sunset Jimbaran", "Tanjung Benoa"],
    notes: "Private trip santai, ada 2 balita dan 2 lansia.",
    createdAt: "09:30 WIB",
    departureDate: "2026-12-05",
    status: "proses_dss",
    h7Alert: false,
    pettyCashInitial: 800000,
    fieldExpenses: [],
  },
];

export const INITIAL_PARTNERS: PartnerItem[] = [
  // 1. Wisata (Anchor Zone)
  {
    id: "pt-w-1",
    name: "Candi Borobudur & Dagi Abhayagiri",
    category: "Wisata (Anchor Zone)",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "UNESCO World Heritage",
    kapasitas_maksimal: 1000,
    harga_modal_satuan: 50000,
    syarat_minimum_order: 10,
    waktu_tempuh_ke_wisata_menit: 0,
    titik_koordinat: { lat: -7.6079, lng: 110.2038 },
    status_aktif: true,
    contact: "0293-788131",
    rating: 4.9,
  },
  {
    id: "pt-w-2",
    name: "Candi Prambanan & Ratu Boko",
    category: "Wisata (Anchor Zone)",
    zona_wisata: "Zona Prambanan & Sleman",
    kualifikasi_standar: "UNESCO World Heritage",
    kapasitas_maksimal: 1500,
    harga_modal_satuan: 50000,
    syarat_minimum_order: 10,
    waktu_tempuh_ke_wisata_menit: 0,
    titik_koordinat: { lat: -7.752, lng: 110.4915 },
    status_aktif: true,
    contact: "0274-496401",
    rating: 4.8,
  },
  {
    id: "pt-w-3",
    name: "Malioboro Heritage & Keraton",
    category: "Wisata (Anchor Zone)",
    zona_wisata: "Zona Kota & Malioboro",
    kualifikasi_standar: "Cultural Heritage Center",
    kapasitas_maksimal: 2000,
    harga_modal_satuan: 15000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 0,
    titik_koordinat: { lat: -7.7956, lng: 110.3695 },
    status_aktif: true,
    contact: "0274-566865",
    rating: 4.7,
  },

  // 2. Hotel
  {
    id: "pt-h-1",
    name: "Hotel Grand Keisha Yogyakarta",
    category: "Hotel",
    zona_wisata: "Zona Prambanan & Sleman",
    kualifikasi_standar: "Bintang 4",
    kapasitas_maksimal: 160,
    harga_modal_satuan: 380000,
    syarat_minimum_order: 5,
    waktu_tempuh_ke_wisata_menit: 18, // <= 25m optimal
    titik_koordinat: { lat: -7.765, lng: 110.389 },
    status_aktif: true,
    contact: "0274-5012200",
    rating: 4.6,
  },
  {
    id: "pt-h-2",
    name: "Hotel Santika Premiere Jogja",
    category: "Hotel",
    zona_wisata: "Zona Kota & Malioboro",
    kualifikasi_standar: "Bintang 4",
    kapasitas_maksimal: 180,
    harga_modal_satuan: 450000,
    syarat_minimum_order: 10,
    waktu_tempuh_ke_wisata_menit: 10,
    titik_koordinat: { lat: -7.7825, lng: 110.3672 },
    status_aktif: true,
    contact: "0274-563036",
    rating: 4.7,
  },
  {
    id: "pt-h-3",
    name: "Wisma Gajah Mada",
    category: "Hotel",
    zona_wisata: "Zona Prambanan & Sleman",
    kualifikasi_standar: "Bintang 2",
    kapasitas_maksimal: 80,
    harga_modal_satuan: 180000,
    syarat_minimum_order: 5,
    waktu_tempuh_ke_wisata_menit: 22,
    titik_koordinat: { lat: -7.7712, lng: 110.3775 },
    status_aktif: true,
    contact: "0274-583000",
    rating: 4.2,
  },
  {
    id: "pt-h-4",
    name: "Hotel Tentrem Yogyakarta",
    category: "Hotel",
    zona_wisata: "Zona Kota & Malioboro",
    kualifikasi_standar: "Bintang 5 Luxury",
    kapasitas_maksimal: 240,
    harga_modal_satuan: 850000,
    syarat_minimum_order: 10,
    waktu_tempuh_ke_wisata_menit: 14,
    titik_koordinat: { lat: -7.7725, lng: 110.3685 },
    status_aktif: true,
    contact: "0274-6415555",
    rating: 4.9,
  },

  // 3. Restoran
  {
    id: "pt-r-1",
    name: "RM Bale Raos Keraton",
    category: "Restoran",
    zona_wisata: "Zona Kota & Malioboro",
    kualifikasi_standar: "Prasmanan Tradisional Keraton",
    kapasitas_maksimal: 250,
    harga_modal_satuan: 45000, // Harga grosir konsolidasi
    syarat_minimum_order: 30,
    waktu_tempuh_ke_wisata_menit: 12,
    titik_koordinat: { lat: -7.807, lng: 110.362 },
    status_aktif: true,
    contact: "0274-415550",
    rating: 4.8,
  },
  {
    id: "pt-r-2",
    name: "RM Jejamuran Sleman",
    category: "Restoran",
    zona_wisata: "Zona Prambanan & Sleman",
    kualifikasi_standar: "Prasmanan Jamur Spesial",
    kapasitas_maksimal: 300,
    harga_modal_satuan: 38000,
    syarat_minimum_order: 25,
    waktu_tempuh_ke_wisata_menit: 20,
    titik_koordinat: { lat: -7.7128, lng: 110.354 },
    status_aktif: true,
    contact: "0274-868170",
    rating: 4.6,
  },

  // 4. Pusat Oleh-oleh
  {
    id: "pt-s-1",
    name: "Pusat Bakpia Pathok 25",
    category: "Pusat Oleh-oleh",
    zona_wisata: "Zona Kota & Malioboro",
    kualifikasi_standar: "Sentra Bakpia Asli Yogyakarta",
    kapasitas_maksimal: 400,
    harga_modal_satuan: 25000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 8,
    titik_koordinat: { lat: -7.7985, lng: 110.3585 },
    status_aktif: true,
    contact: "0274-566122",
    rating: 4.7,
  },
  {
    id: "pt-s-2",
    name: "Hamzah Batik Malioboro",
    category: "Pusat Oleh-oleh",
    zona_wisata: "Zona Kota & Malioboro",
    kualifikasi_standar: "Kerajinan Batik & Souvenir",
    kapasitas_maksimal: 350,
    harga_modal_satuan: 40000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 5,
    titik_koordinat: { lat: -7.7998, lng: 110.3654 },
    status_aktif: true,
    contact: "0274-588524",
    rating: 4.8,
  },

  // 5. Transportasi
  {
    id: "pt-t-1",
    name: "PO Haryanto Pariwisata (Big Bus 50 Seat)",
    category: "Transportasi",
    zona_wisata: "Jawa Tengah & DIY",
    kualifikasi_standar: "Executive SHD Mercedes-Benz",
    kapasitas_maksimal: 50,
    harga_modal_satuan: 5500000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 15,
    titik_koordinat: { lat: -7.795, lng: 110.37 },
    status_aktif: true,
    contact: "0812-9988-7711",
    rating: 4.8,
  },
  {
    id: "pt-t-2",
    name: "Kirana Transport (Toyota Hiace Premio 15 Seat)",
    category: "Transportasi",
    zona_wisata: "Jawa Tengah & DIY",
    kualifikasi_standar: "Van Eksekutif Pariwisata",
    kapasitas_maksimal: 15,
    harga_modal_satuan: 1200000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 15,
    titik_koordinat: { lat: -7.785, lng: 110.38 },
    status_aktif: true,
    contact: "0813-2233-4455",
    rating: 4.7,
  },

  // 6. Kru Lapangan (4 Kategori Wajib dengan Sertifikasi & Surat Sehat)
  {
    id: "pt-c-1",
    name: "Budi Santoso, S.Par",
    category: "Tour Leader",
    zona_wisata: "Jawa Tengah & DIY",
    kualifikasi_standar: "Pemandu Senior HPI (English & Japan Fluent)",
    kapasitas_maksimal: 1,
    harga_modal_satuan: 500000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 10,
    titik_koordinat: { lat: -7.795, lng: 110.37 },
    status_surat_sehat: true,
    status_aktif: true,
    contact: "0812-3456-7890",
    rating: 4.9,
  },
  {
    id: "pt-c-2",
    name: "Reza Mahendra",
    category: "Tim Dokumentasi",
    zona_wisata: "Jawa Tengah & DIY",
    kualifikasi_standar: "DJI Certified Pilot & Mirrorless 4K",
    kapasitas_maksimal: 1,
    harga_modal_satuan: 600000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 12,
    titik_koordinat: { lat: -7.79, lng: 110.38 },
    status_surat_sehat: true,
    status_aktif: true,
    contact: "0813-4455-6677",
    rating: 4.9,
  },
  {
    id: "pt-c-3",
    name: "Ns. Maya Indah, S.Kep",
    category: "Tim Medis",
    zona_wisata: "Jawa Tengah & DIY",
    kualifikasi_standar: "Perawat STR Aktif & Bersertifikat P3K Par",
    kapasitas_maksimal: 1,
    harga_modal_satuan: 400000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 15,
    titik_koordinat: { lat: -7.78, lng: 110.375 },
    status_surat_sehat: true,
    status_aktif: true,
    contact: "0817-8899-0011",
    rating: 4.8,
  },
  {
    id: "pt-c-4",
    name: "Aris Munandar",
    category: "Tim Pengawas",
    zona_wisata: "Jawa Tengah & DIY",
    kualifikasi_standar: "Internal QA & Koordinator Lapangan",
    kapasitas_maksimal: 1,
    harga_modal_satuan: 450000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 10,
    titik_koordinat: { lat: -7.792, lng: 110.368 },
    status_surat_sehat: true,
    status_aktif: true,
    contact: "0813-9988-7766",
    rating: 4.8,
  },

  // 6. Mitra Wilayah Zona Borobudur & Magelang
  {
    id: "pt-h-bdr-1",
    name: "Hotel Saraswati Borobudur",
    category: "Hotel",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Bintang 3",
    kapasitas_maksimal: 90,
    harga_modal_satuan: 320000,
    syarat_minimum_order: 5,
    waktu_tempuh_ke_wisata_menit: 8,
    titik_koordinat: { lat: -7.6045, lng: 110.21 },
    status_aktif: true,
    contact: "0293-788843",
    rating: 4.6,
  },
  {
    id: "pt-h-bdr-2",
    name: "Plataran Heritage Borobudur Resort",
    category: "Hotel",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Bintang 4",
    kapasitas_maksimal: 120,
    harga_modal_satuan: 650000,
    syarat_minimum_order: 10,
    waktu_tempuh_ke_wisata_menit: 12,
    titik_koordinat: { lat: -7.599, lng: 110.2085 },
    status_aktif: true,
    contact: "0293-788888",
    rating: 4.9,
  },
  {
    id: "pt-h-bdr-3",
    name: "Balkondes Wanurejo Eco-Lodge",
    category: "Hotel",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Bintang 2",
    kapasitas_maksimal: 75,
    harga_modal_satuan: 160000,
    syarat_minimum_order: 5,
    waktu_tempuh_ke_wisata_menit: 15,
    titik_koordinat: { lat: -7.615, lng: 110.198 },
    status_aktif: true,
    contact: "0812-8877-6655",
    rating: 4.5,
  },
  {
    id: "pt-r-bdr-1",
    name: "RM Pondok Tingal Borobudur",
    category: "Restoran",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Prasmanan Tradisional Jawa & Ikan Bakar",
    kapasitas_maksimal: 220,
    harga_modal_satuan: 35000,
    syarat_minimum_order: 20,
    waktu_tempuh_ke_wisata_menit: 9,
    titik_koordinat: { lat: -7.6105, lng: 110.216 },
    status_aktif: true,
    contact: "0293-788145",
    rating: 4.7,
  },
  {
    id: "pt-r-bdr-2",
    name: "Resto Mangut Beong Sehati Borobudur",
    category: "Restoran",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Kuliner Khas Mangut Beong Gurih Pedas",
    kapasitas_maksimal: 160,
    harga_modal_satuan: 28000,
    syarat_minimum_order: 15,
    waktu_tempuh_ke_wisata_menit: 14,
    titik_koordinat: { lat: -7.625, lng: 110.192 },
    status_aktif: true,
    contact: "0813-2211-9988",
    rating: 4.6,
  },
  {
    id: "pt-r-bdr-3",
    name: "RM Sekar Kedhaton Magelang",
    category: "Restoran",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Prasmanan VIP Nusantara & Kolonial",
    kapasitas_maksimal: 260,
    harga_modal_satuan: 42000,
    syarat_minimum_order: 30,
    waktu_tempuh_ke_wisata_menit: 18,
    titik_koordinat: { lat: -7.585, lng: 110.219 },
    status_aktif: true,
    contact: "0293-363555",
    rating: 4.8,
  },
  {
    id: "pt-s-bdr-1",
    name: "Sentra Getuk Trio & Keripik Magelang",
    category: "Pusat Oleh-oleh",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Pusat Oleh-oleh Legendaris Getuk Tiga Warna",
    kapasitas_maksimal: 300,
    harga_modal_satuan: 22000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 16,
    titik_koordinat: { lat: -7.575, lng: 110.225 },
    status_aktif: true,
    contact: "0293-362241",
    rating: 4.7,
  },
  {
    id: "pt-t-bdr-1",
    name: "PO Borobudur Trans Wisata",
    category: "Transportasi",
    zona_wisata: "Zona Borobudur & Magelang",
    kualifikasi_standar: "Armada Pariwisata Medium & Big Bus Karoseri Adiputro",
    kapasitas_maksimal: 100,
    harga_modal_satuan: 4200000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 10,
    titik_koordinat: { lat: -7.592, lng: 110.221 },
    status_aktif: true,
    contact: "0293-789012",
    rating: 4.8,
  },

  // 7. Mitra Wilayah Zona Lombok & Gili
  {
    id: "pt-w-lbk-1",
    name: "Gili Trawangan & Sirkuit Mandalika",
    category: "Wisata (Anchor Zone)",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Kawasan Strategis Pariwisata Nasional (KSPN)",
    kapasitas_maksimal: 800,
    harga_modal_satuan: 40000,
    syarat_minimum_order: 10,
    waktu_tempuh_ke_wisata_menit: 0,
    titik_koordinat: { lat: -8.352, lng: 116.042 },
    status_aktif: true,
    contact: "0370-6123456",
    rating: 4.9,
  },
  {
    id: "pt-h-lbk-1",
    name: "Hotel Vila Ombak Gili Trawangan",
    category: "Hotel",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Bintang 4 Resort Tepi Pantai",
    kapasitas_maksimal: 140,
    harga_modal_satuan: 550000,
    syarat_minimum_order: 5,
    waktu_tempuh_ke_wisata_menit: 5,
    titik_koordinat: { lat: -8.353, lng: 116.045 },
    status_aktif: true,
    contact: "0370-642333",
    rating: 4.8,
  },
  {
    id: "pt-h-lbk-2",
    name: "Kuta Beach Hotel Lombok",
    category: "Hotel",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Bintang 3 Modern",
    kapasitas_maksimal: 90,
    harga_modal_satuan: 320000,
    syarat_minimum_order: 5,
    waktu_tempuh_ke_wisata_menit: 15,
    titik_koordinat: { lat: -8.895, lng: 116.278 },
    status_aktif: true,
    contact: "0370-653444",
    rating: 4.6,
  },
  {
    id: "pt-r-lbk-1",
    name: "RM Ayam Taliwang Irama Mataram",
    category: "Restoran",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Prasmanan Kuliner Khas Sasak & Taliwang",
    kapasitas_maksimal: 250,
    harga_modal_satuan: 38000,
    syarat_minimum_order: 20,
    waktu_tempuh_ke_wisata_menit: 20,
    titik_koordinat: { lat: -8.583, lng: 116.115 },
    status_aktif: true,
    contact: "0370-623123",
    rating: 4.8,
  },
  {
    id: "pt-r-lbk-2",
    name: "Resto Segara Anak Kuta Mandalika",
    category: "Restoran",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Seafood Pantai & Masakan Nusantara",
    kapasitas_maksimal: 200,
    harga_modal_satuan: 45000,
    syarat_minimum_order: 15,
    waktu_tempuh_ke_wisata_menit: 10,
    titik_koordinat: { lat: -8.892, lng: 116.282 },
    status_aktif: true,
    contact: "0370-654888",
    rating: 4.7,
  },
  {
    id: "pt-s-lbk-1",
    name: "Sentra Mutiara & Tenun Sasak Sukarara",
    category: "Pusat Oleh-oleh",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Sentra Kerajinan Tenun Songket & Mutiara Air Laut",
    kapasitas_maksimal: 350,
    harga_modal_satuan: 28000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 18,
    titik_koordinat: { lat: -8.67, lng: 116.22 },
    status_aktif: true,
    contact: "0370-671234",
    rating: 4.8,
  },
  {
    id: "pt-t-lbk-1",
    name: "PO Sasak Trans Wisata Lombok",
    category: "Transportasi",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Armada Bus Medium AC & Hiace Premio Lombok",
    kapasitas_maksimal: 60,
    harga_modal_satuan: 2800000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 15,
    titik_koordinat: { lat: -8.58, lng: 116.12 },
    status_aktif: true,
    contact: "0812-7788-9900",
    rating: 4.8,
  },
  {
    id: "pt-c-lbk-1",
    name: "Lalu Ahmad, S.Par",
    category: "Tour Leader",
    zona_wisata: "Zona Gili Trawangan & Kuta Mandalika",
    kualifikasi_standar: "Pemandu Senior HPI Lombok & Penutur Bahasa Sasak/Inggris",
    kapasitas_maksimal: 1,
    harga_modal_satuan: 500000,
    syarat_minimum_order: 1,
    waktu_tempuh_ke_wisata_menit: 10,
    titik_koordinat: { lat: -8.585, lng: 116.11 },
    status_surat_sehat: true,
    status_aktif: true,
    contact: "0819-3344-5566",
    rating: 4.9,
  },
];
