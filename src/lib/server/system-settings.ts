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
}

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
  if (envKey && envKey.trim().length > 5 && !envKey.startsWith("AIzaSy...")) {
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
        if (fileKey) {
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
    if (dbKey && dbKey.trim()) {
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
        if (parsedKey && !parsedKey.startsWith("AIzaSy...")) {
          globalThis.__NUSATRIP_MAPS_KEY = parsedKey;
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = parsedKey;
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
