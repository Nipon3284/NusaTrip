"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nusatrip_gmaps_api_key";
const EVENT_NAME = "nusatrip_gmaps_key_change";

export function useGoogleMapsKey() {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
      return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    }
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  });

  useEffect(() => {
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
      window.removeEventListener(EVENT_NAME, handleKeyChange);
      window.removeEventListener("storage", handleKeyChange);
    };
  }, []);

  const saveKey = useCallback((newKey: string) => {
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
  }, []);

  const removeKey = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: "" }));
    }
    setApiKey("");
  }, []);

  return { apiKey, saveKey, removeKey };
}
