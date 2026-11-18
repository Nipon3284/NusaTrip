import fs from "fs";
import path from "path";
import { getDbSystemConfig, saveDbSystemConfig } from "@/lib/supabase/db";

const CONFIG_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(CONFIG_DIR, "system-config.json");
const ENV_LOCAL_FILE = path.join(process.cwd(), ".env.local");

// Global in-memory cache across API requests in Node runtime
declare global {
  // eslint-disable-next-line no-var
  var __NUSATRIP_MAPS_KEY: string | undefined;
  // eslint-disable-next-line no-var
  var __NUSATRIP_GOOGLE_CLIENT_ID: string | undefined;
}

export const DEFAULT_GOOGLE_MAPS_API_KEY = "AIzaSyDortaUbmafxHS3FYI5RUcPoCHtfQfzFzg";

/**
 * Membaca Google Maps API Key dari berbagai lapisan penyimpanan (Environment, DB, File Lokal)
 * sehingga dapat diterapkan di semua perangkat admin tanpa perlu diinputkan berulang kali.
 */
export async function getSystemMapsKey(): Promise<string> {
  // 1. Cek Process Environment
  const envKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";
  if (envKey && envKey.trim().length > 5 && !envKey.includes("...")) {
    globalThis.__NUSATRIP_MAPS_KEY = envKey.trim();
    return envKey.trim();
  }

  // 2. Cek In-Memory Cache
  if (globalThis.__NUSATRIP_MAPS_KEY && globalThis.__NUSATRIP_MAPS_KEY.trim()) {
    return globalThis.__NUSATRIP_MAPS_KEY.trim();
  }

  // 3. Cek File Konfigurasi Server Lokal (data/system-config.json)
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.google_maps_api_key && typeof parsed.google_maps_api_key === "string") {
        const fileKey = parsed.google_maps_api_key.trim();
        if (fileKey && !fileKey.includes("...")) {
          globalThis.__NUSATRIP_MAPS_KEY = fileKey;
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = fileKey;
          return fileKey;
        }
      }
    }
  } catch {
    // Abaikan jika berkas belum ada
  }

  // 4. Cek Database Cloud Supabase (tbl_konfigurasi_sistem)
  try {
    const dbKey = await getDbSystemConfig("google_maps_api_key");
    if (dbKey && dbKey.trim() && !dbKey.includes("...")) {
      const trimmed = dbKey.trim();
      globalThis.__NUSATRIP_MAPS_KEY = trimmed;
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = trimmed;
      return trimmed;
    }
  } catch {
    // Abaikan jika database belum terhubung
  }

  // 5. Cek File .env.local jika ada
  try {
    if (fs.existsSync(ENV_LOCAL_FILE)) {
      const envContent = fs.readFileSync(ENV_LOCAL_FILE, "utf-8");
      const match = envContent.match(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=(.+)/);
      if (match && match[1]) {
        const parsedKey = match[1].trim().replace(/^["']|["']$/g, "");
        if (parsedKey && !parsedKey.includes("...")) {
          globalThis.__NUSATRIP_MAPS_KEY = parsedKey;
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = parsedKey;
          return parsedKey;
        }
      }
    }
  } catch {
    // Abaikan
  }

  // 6. Default Fallback Kunci Resmi NusaTrip
  globalThis.__NUSATRIP_MAPS_KEY = DEFAULT_GOOGLE_MAPS_API_KEY;
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = DEFAULT_GOOGLE_MAPS_API_KEY;
  return DEFAULT_GOOGLE_MAPS_API_KEY;
}

/**
 * Menyimpan Google Maps API Key ke seluruh lapisan (Memory, File Konfigurasi, .env.local, dan Supabase DB)
 * sehingga sekali disimpan oleh admin, seluruh perangkat lain otomatis tersinkronisasi.
 */
export async function saveSystemMapsKey(newKey: string): Promise<boolean> {
  const trimmedKey = newKey.trim();

  // 1. Update In-Memory & Process Env
  globalThis.__NUSATRIP_MAPS_KEY = trimmedKey;
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = trimmedKey;
  process.env.GOOGLE_MAPS_API_KEY = trimmedKey;

  // 2. Simpan ke File Konfigurasi Server (data/system-config.json)
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const configData: Record<string, any> = {};
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const existing = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
        Object.assign(configData, existing);
      } catch {
        // override jika rusak
      }
    }
    configData.google_maps_api_key = trimmedKey;
    configData.updated_at = new Date().toISOString();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan ke data/system-config.json:", err);
  }

  // 3. Simpan atau Perbarui ke .env.local
  try {
    let envContent = "";
    if (fs.existsSync(ENV_LOCAL_FILE)) {
      envContent = fs.readFileSync(ENV_LOCAL_FILE, "utf-8");
      if (envContent.includes("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=")) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*/g,
          `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${trimmedKey}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${trimmedKey}\n`;
      }
    } else {
      envContent = `# NusaTrip Environment Variables (Dibuat otomatis dari Dasbor Admin)\nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${trimmedKey}\n`;
    }
    fs.writeFileSync(ENV_LOCAL_FILE, envContent, "utf-8");
  } catch (err) {
    console.error("Gagal menulis ke .env.local:", err);
  }

  // 4. Simpan ke Database Cloud Supabase jika aktif
  try {
    await saveDbSystemConfig(
      "google_maps_api_key",
      trimmedKey,
      "Google Maps Platform API Key tersinkronisasi antar perangkat"
    );
  } catch (err) {
    console.warn("Gagal menyimpan ke tabel Supabase:", err);
  }

  return true;
}

/**
 * Membaca Google OAuth Client ID dari berbagai lapisan penyimpanan
 */
export async function getSystemGoogleClientId(): Promise<string> {
  // 1. Cek Process Environment
  const envKey =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    "";
  if (envKey && envKey.trim().length > 5 && !envKey.includes("...")) {
    globalThis.__NUSATRIP_GOOGLE_CLIENT_ID = envKey.trim();
    return envKey.trim();
  }

  // 2. Cek In-Memory Cache
  if (globalThis.__NUSATRIP_GOOGLE_CLIENT_ID && globalThis.__NUSATRIP_GOOGLE_CLIENT_ID.trim()) {
    return globalThis.__NUSATRIP_GOOGLE_CLIENT_ID.trim();
  }

  // 3. Cek File Konfigurasi Server Lokal
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.google_client_id && typeof parsed.google_client_id === "string") {
        const fileKey = parsed.google_client_id.trim();
        if (fileKey && !fileKey.includes("...")) {
          globalThis.__NUSATRIP_GOOGLE_CLIENT_ID = fileKey;
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = fileKey;
          return fileKey;
        }
      }
    }
  } catch {
    // Abaikan
  }

  // 4. Cek Database Supabase
  try {
    const dbKey = await getDbSystemConfig("google_client_id");
    if (dbKey && dbKey.trim() && !dbKey.includes("...")) {
      const trimmed = dbKey.trim();
      globalThis.__NUSATRIP_GOOGLE_CLIENT_ID = trimmed;
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = trimmed;
      return trimmed;
    }
  } catch {
    // Abaikan
  }

  // 5. Cek File .env.local
  try {
    if (fs.existsSync(ENV_LOCAL_FILE)) {
      const envContent = fs.readFileSync(ENV_LOCAL_FILE, "utf-8");
      const match = envContent.match(/NEXT_PUBLIC_GOOGLE_CLIENT_ID=(.+)/);
      if (match && match[1]) {
        const parsedKey = match[1].trim().replace(/^["']|["']$/g, "");
        if (parsedKey && !parsedKey.includes("...")) {
          globalThis.__NUSATRIP_GOOGLE_CLIENT_ID = parsedKey;
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = parsedKey;
          return parsedKey;
        }
      }
    }
  } catch {
    // Abaikan
  }

  return "";
}

/**
 * Menyimpan Google OAuth Client ID ke konfigurasi sistem
 */
export async function saveSystemGoogleClientId(newClientId: string): Promise<boolean> {
  const trimmed = newClientId.trim();

  // 1. Update In-Memory & Process Env
  globalThis.__NUSATRIP_GOOGLE_CLIENT_ID = trimmed;
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = trimmed;
  process.env.GOOGLE_CLIENT_ID = trimmed;

  // 2. Simpan ke File Konfigurasi Server
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const configData: Record<string, any> = {};
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const existing = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
        Object.assign(configData, existing);
      } catch {
        // Abaikan
      }
    }
    configData.google_client_id = trimmed;
    configData.updated_at = new Date().toISOString();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan google_client_id ke data/system-config.json:", err);
  }

  // 3. Simpan ke .env.local
  try {
    let envContent = "";
    if (fs.existsSync(ENV_LOCAL_FILE)) {
      envContent = fs.readFileSync(ENV_LOCAL_FILE, "utf-8");
      if (envContent.includes("NEXT_PUBLIC_GOOGLE_CLIENT_ID=")) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_GOOGLE_CLIENT_ID=.*/g,
          `NEXT_PUBLIC_GOOGLE_CLIENT_ID=${trimmed}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_GOOGLE_CLIENT_ID=${trimmed}\n`;
      }
    } else {
      envContent = `# NusaTrip Environment Variables\nNEXT_PUBLIC_GOOGLE_CLIENT_ID=${trimmed}\n`;
    }
    fs.writeFileSync(ENV_LOCAL_FILE, envContent, "utf-8");
  } catch (err) {
    console.error("Gagal menulis google_client_id ke .env.local:", err);
  }

  // 4. Simpan ke Database Cloud Supabase
  try {
    await saveDbSystemConfig(
      "google_client_id",
      trimmed,
      "Google OAuth 2.0 Web Client ID untuk login Google SSO resmi"
    );
  } catch (err) {
    console.warn("Gagal menyimpan google_client_id ke Supabase:", err);
  }

  return true;
}
