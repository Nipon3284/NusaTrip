"use client";

import { useSyncExternalStore } from "react";
export * from "./tour-data";
import {
  INITIAL_PACKAGES,
  INITIAL_LEADS,
  INITIAL_PARTNERS,
  INITIAL_ZONES,
  type TourPackageItem,
  type CustomerLeadItem,
  type PartnerItem,
  type ZoneItem,
  type LeadStatus,
  type FieldExpenseItem,
} from "./tour-data";

const emitChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nusatrip_data_change"));
  }
};

export const subscribeTourData = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("nusatrip_data_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nusatrip_data_change", callback);
  };
};

// Sinkronisasi latar belakang dengan server saat client inisialisasi
if (typeof window !== "undefined") {
  fetch("/api/packages")
    .then((r) => r.json())
    .then((d) => {
      if (d && Array.isArray(d.packages) && d.packages.length > 0) {
        localStorage.setItem("nusatrip_packages", JSON.stringify(d.packages));
        emitChange();
      }
    })
    .catch(() => {});

  fetch("/api/partners")
    .then((r) => r.json())
    .then((d) => {
      if (d && Array.isArray(d.partners) && d.partners.length > 0) {
        localStorage.setItem("nusatrip_partners", JSON.stringify(d.partners));
        emitChange();
      }
    })
    .catch(() => {});

  fetch("/api/zones")
    .then((r) => r.json())
    .then((d) => {
      if (d && Array.isArray(d.zones) && d.zones.length > 0) {
        localStorage.setItem("nusatrip_zones", JSON.stringify(d.zones));
        emitChange();
      }
    })
    .catch(() => {});
}

// ─── PACKAGES STORE ───────────────────────────────────────────
let cachedPackagesRaw: string | null = null;
let cachedPackagesList: TourPackageItem[] = INITIAL_PACKAGES;

export const getPackagesSnapshot = (): TourPackageItem[] => {
  if (typeof window === "undefined") return INITIAL_PACKAGES;
  const raw = localStorage.getItem("nusatrip_packages");
  if (!raw) return INITIAL_PACKAGES;
  if (raw !== cachedPackagesRaw) {
    try {
      cachedPackagesList = JSON.parse(raw);
      cachedPackagesRaw = raw;
    } catch {
      return INITIAL_PACKAGES;
    }
  }
  return cachedPackagesList;
};

export const getPackagesServerSnapshot = (): TourPackageItem[] => INITIAL_PACKAGES;

export const useTourPackages = (): TourPackageItem[] => {
  return useSyncExternalStore(subscribeTourData, getPackagesSnapshot, getPackagesServerSnapshot);
};

export const saveTourPackages = (packages: TourPackageItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nusatrip_packages", JSON.stringify(packages));
  emitChange();

  fetch("/api/packages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(packages),
  }).catch(() => {});
};

export const addTourPackage = (pkg: Omit<TourPackageItem, "id">) => {
  const current = getPackagesSnapshot();
  const newId = "pkg-" + Date.now();
  const updated = [{ ...pkg, id: newId }, ...current];
  saveTourPackages(updated);
};

export const updateTourPackage = (id: string, updates: Partial<TourPackageItem>) => {
  const current = getPackagesSnapshot();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveTourPackages(updated);
};

export const toggleTourPackageActive = (id: string) => {
  const current = getPackagesSnapshot();
  const updated = current.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
  saveTourPackages(updated);
};

export const deleteTourPackage = (id: string) => {
  const current = getPackagesSnapshot();
  const updated = current.filter((p) => p.id !== id);
  saveTourPackages(updated);
};

// ─── LEADS STORE ──────────────────────────────────────────────
let cachedLeadsRaw: string | null = null;
let cachedLeadsList: CustomerLeadItem[] = INITIAL_LEADS;

export const getLeadsSnapshot = (): CustomerLeadItem[] => {
  if (typeof window === "undefined") return INITIAL_LEADS;
  const raw = localStorage.getItem("nusatrip_leads");
  if (!raw) return INITIAL_LEADS;
  if (raw !== cachedLeadsRaw) {
    try {
      const parsed: CustomerLeadItem[] = JSON.parse(raw);
      // Pastikan lead bawaan demo memiliki asosiasi email akun demonya
      // agar tidak bocor ke akun pengguna baru yang baru mendaftar
      cachedLeadsList = parsed.map((item) => {
        if (!item.userEmail) {
          const match = INITIAL_LEADS.find((il) => il.id === item.id);
          if (match?.userEmail) {
            return { ...item, userEmail: match.userEmail, userId: match.userId };
          }
        }
        return item;
      });
      cachedLeadsRaw = raw;
    } catch {
      return INITIAL_LEADS;
    }
  }
  return cachedLeadsList;
};

export const getLeadsServerSnapshot = (): CustomerLeadItem[] => INITIAL_LEADS;

export const useCustomerLeads = (): CustomerLeadItem[] => {
  return useSyncExternalStore(subscribeTourData, getLeadsSnapshot, getLeadsServerSnapshot);
};

export const useLeads = useCustomerLeads;

export const saveCustomerLeads = (leads: CustomerLeadItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nusatrip_leads", JSON.stringify(leads));
  emitChange();
};

export const addCustomerLead = async (
  lead: Omit<CustomerLeadItem, "id" | "createdAt" | "status"> & { status?: LeadStatus }
): Promise<string> => {
  const current = getLeadsSnapshot();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
  
  // Hitung modal Z-Minimum estimasi (Per pax Rp 350.000/hari + Transport Rp 4.5jt/hari / pax)
  const estCostPerPax = (lead.days || 2) * 380000;
  const estTransport = (lead.days || 2) * 5500000;
  const bottomLineCost = Math.round(estCostPerPax * (lead.pax || 20) + estTransport);

  const newId = `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;
  const auth = getCustomerAuthSnapshot();
  const newLead: CustomerLeadItem = {
    ...lead,
    id: newId,
    userId: lead.userId || auth?.id || auth?.uid || undefined,
    userEmail: lead.userEmail || auth?.email || undefined,
    createdAt: timeStr,
    status: lead.status || "baru",
    customerBid: lead.budget || Math.round(bottomLineCost * 1.2),
    bottomLineCost: lead.bottomLineCost || bottomLineCost,
    targetMargin: lead.targetMargin || Math.round(bottomLineCost * 0.22),
    pettyCashInitial: 1500000,
    fieldExpenses: [],
  };

  saveCustomerLeads([newLead, ...current]);

  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead),
    });
  } catch {}

  return newId;
};

export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  const current = getLeadsSnapshot();
  const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
  saveCustomerLeads(updated);

  try {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  } catch {}
};

export const updateLeadDetails = async (id: string, updates: Partial<CustomerLeadItem>) => {
  const current = getLeadsSnapshot();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveCustomerLeads(updated);

  try {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
  } catch {}
};

export const addLeadFieldExpense = (leadId: string, expense: Omit<FieldExpenseItem, "id">) => {
  const current = getLeadsSnapshot();
  const newExpense: FieldExpenseItem = {
    ...expense,
    id: "fe-" + Date.now(),
  };
  const updated = current.map((item) => {
    if (item.id === leadId) {
      const existing = item.fieldExpenses || [];
      return { ...item, fieldExpenses: [newExpense, ...existing] };
    }
    return item;
  });
  saveCustomerLeads(updated);
};

// ─── PARTNERS & GIS STORE ─────────────────────────────────────
let cachedPartnersRaw: string | null = null;
let cachedPartnersList: PartnerItem[] = INITIAL_PARTNERS;

export const getPartnersSnapshot = (): PartnerItem[] => {
  if (typeof window === "undefined") return INITIAL_PARTNERS;
  const raw = localStorage.getItem("nusatrip_partners");
  if (!raw) return INITIAL_PARTNERS;
  if (raw !== cachedPartnersRaw) {
    try {
      cachedPartnersList = JSON.parse(raw);
      cachedPartnersRaw = raw;
    } catch {
      return INITIAL_PARTNERS;
    }
  }
  return cachedPartnersList;
};

export const getPartnersServerSnapshot = (): PartnerItem[] => INITIAL_PARTNERS;

export const usePartners = (): PartnerItem[] => {
  return useSyncExternalStore(subscribeTourData, getPartnersSnapshot, getPartnersServerSnapshot);
};

export const savePartners = (partners: PartnerItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nusatrip_partners", JSON.stringify(partners));
  emitChange();

  fetch("/api/partners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partners),
  }).catch(() => {});
};

export const addPartner = (partner: Omit<PartnerItem, "id">) => {
  const current = getPartnersSnapshot();
  const newPartner: PartnerItem = {
    ...partner,
    id: "pt-" + Date.now(),
  };
  savePartners([newPartner, ...current]);
};

export const updatePartner = (id: string, updates: Partial<PartnerItem>) => {
  const current = getPartnersSnapshot();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  savePartners(updated);
};

export const togglePartnerActive = (id: string) => {
  const current = getPartnersSnapshot();
  const updated = current.map((p) => (p.id === id ? { ...p, status_aktif: !p.status_aktif } : p));
  savePartners(updated);
};

export const deletePartner = (id: string) => {
  const current = getPartnersSnapshot();
  const updated = current.filter((p) => p.id !== id);
  savePartners(updated);
};

// ─── ZONES STORE ──────────────────────────────────────────────
let cachedZonesRaw: string | null = null;
let cachedZonesList: ZoneItem[] = INITIAL_ZONES;

export const getZonesSnapshot = (): ZoneItem[] => {
  if (typeof window === "undefined") return INITIAL_ZONES;
  const raw = localStorage.getItem("nusatrip_zones");
  if (!raw) return INITIAL_ZONES;
  if (raw !== cachedZonesRaw) {
    try {
      cachedZonesList = JSON.parse(raw);
      cachedZonesRaw = raw;
    } catch {
      return INITIAL_ZONES;
    }
  }
  return cachedZonesList;
};

export const getZonesServerSnapshot = (): ZoneItem[] => INITIAL_ZONES;

export const useZones = (): ZoneItem[] => {
  return useSyncExternalStore(subscribeTourData, getZonesSnapshot, getZonesServerSnapshot);
};

export const saveZones = (zones: ZoneItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nusatrip_zones", JSON.stringify(zones));
  emitChange();

  fetch("/api/zones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(zones),
  }).catch(() => {});
};

export const addZone = (zone: Omit<ZoneItem, "id">) => {
  const current = getZonesSnapshot();
  const newZone: ZoneItem = {
    ...zone,
    id: "zn-" + Date.now(),
  };
  saveZones([...current, newZone]);
};

export const updateZone = (id: string, updates: Partial<ZoneItem>) => {
  const current = getZonesSnapshot();
  const updated = current.map((z) => (z.id === id ? { ...z, ...updates } : z));
  saveZones(updated);
};

export const toggleZoneActive = (id: string) => {
  const current = getZonesSnapshot();
  const updated = current.map((z) => (z.id === id ? { ...z, isActive: !z.isActive } : z));
  saveZones(updated);
};

export const deleteZone = (id: string) => {
  const current = getZonesSnapshot();
  const updated = current.filter((z) => z.id !== id);
  saveZones(updated);
};

// ─── CUSTOMER AUTH STORE (GOOGLE SSO & FIREBASE) ─────────────
export interface CustomerUser {
  id: string;
  uid?: string;
  googleId: string;
  email: string;
  name: string;
  photoUrl: string;
  institution: string;
  phone: string;
  picName: string;
  picRole?: string;
  institutionCategory?: string;
  city?: string;
  notes?: string;
  isProfileComplete?: boolean;
}

let cachedCustomerUserRaw: string | null = null;
let cachedCustomerUser: CustomerUser | null = null;

export const getCustomerAuthSnapshot = (): CustomerUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("nusatrip_customer_auth");
  if (!raw) return null;
  if (raw !== cachedCustomerUserRaw) {
    try {
      cachedCustomerUser = JSON.parse(raw);
      cachedCustomerUserRaw = raw;
    } catch {
      return null;
    }
  }
  return cachedCustomerUser;
};

export const getCustomerAuthServerSnapshot = (): CustomerUser | null => null;

export const useCustomerAuth = (): CustomerUser | null => {
  return useSyncExternalStore(subscribeTourData, getCustomerAuthSnapshot, getCustomerAuthServerSnapshot);
};

export const loginWithGoogle = (user: {
  email: string;
  name: string;
  photoUrl?: string;
  institution?: string;
  phone?: string;
  googleId?: string;
  uid?: string;
  picName?: string;
  picRole?: string;
  institutionCategory?: string;
  city?: string;
  notes?: string;
  isProfileComplete?: boolean;
}) => {
  if (typeof window === "undefined") return;
  const customer: CustomerUser = {
    id: user.uid ? `usr-${user.uid.slice(0, 8)}` : "usr-" + Date.now(),
    uid: user.uid,
    googleId: user.googleId || user.uid || "goog_" + Math.random().toString(36).substring(2, 11),
    email: user.email,
    name: user.name,
    photoUrl:
      user.photoUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    institution: user.institution || "",
    phone: user.phone || "",
    picName: user.picName || user.name,
    picRole: user.picRole || "Penanggung Jawab Rombongan",
    institutionCategory: user.institutionCategory || "Perusahaan (Corporate B2B)",
    city: user.city || "Yogyakarta",
    notes: user.notes || "",
    isProfileComplete: user.isProfileComplete ?? Boolean(user.institution && user.phone),
  };
  localStorage.setItem("nusatrip_customer_auth", JSON.stringify(customer));
  emitChange();
  return customer;
};

export const saveCustomerProfile = (updates: Partial<CustomerUser>) => {
  if (typeof window === "undefined") return null;
  const current = getCustomerAuthSnapshot();
  if (!current) return null;
  const updated: CustomerUser = {
    ...current,
    ...updates,
    isProfileComplete: true,
  };
  localStorage.setItem("nusatrip_customer_auth", JSON.stringify(updated));
  emitChange();
  return updated;
};

export const logoutCustomer = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("nusatrip_customer_auth");
  emitChange();
};

// ─── HELPER TRANSAKSI & INTERAKSI CUSTOMER ────────────────────
export const sendNegotiationMessage = (
  leadId: string,
  message: string,
  proposedBid?: number,
  sender: "pelanggan" | "admin" = "pelanggan"
) => {
  const current = getLeadsSnapshot();
  const updated = current.map((lead) => {
    if (lead.id === leadId) {
      const messages = lead.negotiationMessages || [];
      const newMsg = {
        id: "msg-" + Date.now(),
        sender,
        message,
        proposedBid,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      };
      return {
        ...lead,
        customerBid: proposedBid ?? lead.customerBid,
        negotiationMessages: [...messages, newMsg],
      };
    }
    return lead;
  });
  saveCustomerLeads(updated);
};

export const submitComponentRating = (
  leadId: string,
  ratings: {
    ratingHotel?: number;
    ratingRestoran?: number;
    ratingBus?: number;
    ratingTourLeader?: number;
    ulasan?: string;
  }
) => {
  const current = getLeadsSnapshot();
  const updated = current.map((lead) => {
    if (lead.id === leadId) {
      return {
        ...lead,
        componentRatings: {
          ...ratings,
          waktuRating: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        },
      };
    }
    return lead;
  });
  saveCustomerLeads(updated);
};

export const updateRepaymentStatus = (leadId: string, isPaid: boolean) => {
  const current = getLeadsSnapshot();
  const updated = current.map((lead) => {
    if (lead.id === leadId) {
      return {
        ...lead,
        isRepaymentPaid: isPaid,
      };
    }
    return lead;
  });
  saveCustomerLeads(updated);
};

export const updateWebBeaconLocation = (
  leadId: string,
  busLat: number,
  busLng: number,
  speedKmh: number,
  statusRundown: string
) => {
  const current = getLeadsSnapshot();
  const updated = current.map((lead) => {
    if (lead.id === leadId) {
      return {
        ...lead,
        webBeacon: {
          token: lead.webBeacon?.token || "wb-" + Date.now(),
          isActive: true,
          busLat,
          busLng,
          speedKmh,
          lastUpdated: "Baru saja",
          statusRundown,
        },
      };
    }
    return lead;
  });
  saveCustomerLeads(updated);
};

// ─── HERO BACKGROUND SETTINGS STORE ──────────────────────────
export interface HeroBackgroundSettings {
  imageUrl: string;
  presetId?: string;
  imageAlt?: string;
  gradientDirection: "to-b" | "to-br" | "to-t" | "radial";
  gradientStartColor: string;
  gradientEndColor: string;
  overlayOpacity: number; // 10 to 95 (%)
  textTheme: "dark" | "light";
  blurAmount: "none" | "sm" | "md";
}

export const HERO_PRESETS: {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  defaultGradientStart: string;
  defaultGradientEnd: string;
  defaultOpacity: number;
}[] = [
  {
    id: "borobudur-sunrise",
    name: "Candi Borobudur Emas",
    location: "Magelang & DIY",
    imageUrl: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920&q=80",
    defaultGradientStart: "#0f172a",
    defaultGradientEnd: "#1e1b4b",
    defaultOpacity: 82,
  },
  {
    id: "bromo-kaldera",
    name: "Sunrise Kaldera Bromo",
    location: "Tengger & Bromo",
    imageUrl: "https://images.unsplash.com/photo-1609137144822-7772186835a2?auto=format&fit=crop&w=1920&q=80",
    defaultGradientStart: "#020617",
    defaultGradientEnd: "#1e1b4b",
    defaultOpacity: 80,
  },
  {
    id: "bali-kelingking",
    name: "Tebing Melasti & Nusa Penida",
    location: "Bali Tropis",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920&q=80",
    defaultGradientStart: "#030712",
    defaultGradientEnd: "#075985",
    defaultOpacity: 82,
  },
  {
    id: "lembang-ciwidey",
    name: "Kesejukan Perkebunan Teh",
    location: "Bandung & Ciwidey",
    imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1920&q=80",
    defaultGradientStart: "#022c22",
    defaultGradientEnd: "#0f172a",
    defaultOpacity: 85,
  },
  {
    id: "lombok-mandalika",
    name: "Pesisir Mandalika & Gili",
    location: "Lombok Eksotis",
    imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1920&q=80",
    defaultGradientStart: "#0f172a",
    defaultGradientEnd: "#0c4a6e",
    defaultOpacity: 80,
  },
  {
    id: "ekspedisi-nusantara",
    name: "Petualangan Armada Nusantara",
    location: "Indonesia",
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80",
    defaultGradientStart: "#0f172a",
    defaultGradientEnd: "#312e81",
    defaultOpacity: 85,
  },
];

export const DEFAULT_HERO_SETTINGS: HeroBackgroundSettings = {
  imageUrl: HERO_PRESETS[0].imageUrl,
  presetId: HERO_PRESETS[0].id,
  imageAlt: "Panorama Wisata Indonesia",
  gradientDirection: "to-b",
  gradientStartColor: "#0f172a",
  gradientEndColor: "#1e1b4b",
  overlayOpacity: 82,
  textTheme: "dark",
  blurAmount: "none",
};

let cachedHeroRaw: string | null = null;
let cachedHeroSettings: HeroBackgroundSettings = DEFAULT_HERO_SETTINGS;

export const getHeroSettingsSnapshot = (): HeroBackgroundSettings => {
  if (typeof window === "undefined") return DEFAULT_HERO_SETTINGS;
  const raw = localStorage.getItem("nusatrip_hero_settings");
  if (!raw) return DEFAULT_HERO_SETTINGS;
  if (raw !== cachedHeroRaw) {
    try {
      cachedHeroSettings = { ...DEFAULT_HERO_SETTINGS, ...JSON.parse(raw) };
      cachedHeroRaw = raw;
    } catch {
      return DEFAULT_HERO_SETTINGS;
    }
  }
  return cachedHeroSettings;
};

export const getHeroSettingsServerSnapshot = (): HeroBackgroundSettings => DEFAULT_HERO_SETTINGS;

export const useHeroSettings = (): HeroBackgroundSettings => {
  return useSyncExternalStore(subscribeTourData, getHeroSettingsSnapshot, getHeroSettingsServerSnapshot);
};

export const saveHeroSettings = (settings: HeroBackgroundSettings) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nusatrip_hero_settings", JSON.stringify(settings));
  emitChange();
};

export const resetHeroSettings = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("nusatrip_hero_settings");
  emitChange();
};

export const getHeroGradientCss = (settings: HeroBackgroundSettings): string => {
  const dirMap: Record<HeroBackgroundSettings["gradientDirection"], string> = {
    "to-b": "to bottom",
    "to-br": "to bottom right",
    "to-t": "to top",
    "radial": "circle at center",
  };

  if (settings.gradientDirection === "radial") {
    return `radial-gradient(circle at 50% 35%, ${settings.gradientStartColor}, ${settings.gradientEndColor})`;
  }

  const dir = dirMap[settings.gradientDirection] || "to bottom";
  return `linear-gradient(${dir}, ${settings.gradientStartColor}, ${settings.gradientEndColor})`;
};
