interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Bersihkan rekaman kedaluwarsa secara berkala setiap 5 menit
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number; // Jumlah permintaan maksimum
  windowMs: number; // Jendela waktu dalam milidetik (misal 60000 = 1 menit)
}

/**
 * Memeriksa apakah request melebihi batas laju (Rate Limiting)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter hanya timestamp dalam jendela saat ini
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + options.windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetSeconds: Math.max(1, resetSeconds) };
  }

  record.timestamps.push(now);
  const remaining = options.limit - record.timestamps.length;
  return { allowed: true, remaining, resetSeconds: Math.ceil(options.windowMs / 1000) };
}

/**
 * Ekstraksi IP klien secara aman dari header request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
