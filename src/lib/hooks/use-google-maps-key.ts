"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nusatrip_gmaps_api_key";
const EVENT_NAME = "nusatrip_gmaps_key_change";

export function useGoogleMapsKey() {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    }
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return false;
    }
    return !Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  });

  // Background sync with centralized backend so ANY device logging into admin
  // automatically receives the Google Maps API Key previously input on another device.
  useEffect(() => {
    let isMounted = true;

    async function syncWithServer() {
      try {
        const res = await fetch("/api/settings/maps-key", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.apiKey) {
            setApiKey((current) => {
              if (current !== data.apiKey) {
                if (typeof window !== "undefined") {
                  localStorage.setItem(STORAGE_KEY, data.apiKey);
                  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data.apiKey }));
                }
                return data.apiKey;
              }
              return current;
            });
          }
        }
      } catch {
        // Fallback silently ke cache lokal / environment jika server offline
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    syncWithServer();

    const handleKeyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail !== undefined) {
        setApiKey(customEvent.detail);
      } else if (typeof window !== "undefined") {
        setApiKey(localStorage.getItem(STORAGE_KEY) || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "");
      }
    };

    window.addEventListener(EVENT_NAME, handleKeyChange);
    window.addEventListener("storage", handleKeyChange);

    return () => {
      isMounted = false;
      window.removeEventListener(EVENT_NAME, handleKeyChange);
      window.removeEventListener("storage", handleKeyChange);
    };
  }, []);

  const saveKey = useCallback(async (newKey: string) => {
    const trimmed = newKey.trim();
    if (typeof window !== "undefined") {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: trimmed }));
    }
    setApiKey(trimmed);

    // Kirim dan sinkronkan ke server terpusat agar perangkat admin lain tidak perlu input ulang
    try {
      await fetch("/api/settings/maps-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });
    } catch (e) {
      console.warn("Gagal menyinkronkan API key ke server:", e);
    }
  }, []);

  const removeKey = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: "" }));
    }
    setApiKey("");

    try {
      await fetch("/api/settings/maps-key", { method: "DELETE" });
    } catch (e) {
      console.warn("Gagal menghapus API key dari server:", e);
    }
  }, []);

  return { apiKey, saveKey, removeKey, isLoading };
}
