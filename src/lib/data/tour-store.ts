"use client";

import { useSyncExternalStore } from "react";
export * from "./tour-data";
import {
  INITIAL_PACKAGES,
  INITIAL_LEADS,
  type TourPackageItem,
  type CustomerLeadItem,
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

let cachedPackagesRaw: string | null = null;
let cachedPackagesList: TourPackageItem[] = INITIAL_PACKAGES;

export const getPackagesSnapshot = (): TourPackageItem[] => {
  if (typeof window === "undefined") return INITIAL_PACKAGES;
  const raw = localStorage.getItem("nusatrip_packages");
  if (!raw) {
    return INITIAL_PACKAGES;
  }
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

  // Sinkronisasi asinkron ke server backend
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

let cachedLeadsRaw: string | null = null;
let cachedLeadsList: CustomerLeadItem[] = INITIAL_LEADS;

export const getLeadsSnapshot = (): CustomerLeadItem[] => {
  if (typeof window === "undefined") return INITIAL_LEADS;
  const raw = localStorage.getItem("nusatrip_leads");
  if (!raw) {
    return INITIAL_LEADS;
  }
  if (raw !== cachedLeadsRaw) {
    try {
      cachedLeadsList = JSON.parse(raw);
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

export const saveCustomerLeads = (leads: CustomerLeadItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("nusatrip_leads", JSON.stringify(leads));
  emitChange();
};

export const addCustomerLead = async (lead: Omit<CustomerLeadItem, "id" | "createdAt" | "status">) => {
  const current = getLeadsSnapshot();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
  const newLead: CustomerLeadItem = {
    ...lead,
    id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: timeStr,
    status: "baru",
  };
  saveCustomerLeads([newLead, ...current]);

  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  } catch {}
};

export const updateLeadStatus = async (id: string, status: "baru" | "dihitung" | "deal") => {
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
