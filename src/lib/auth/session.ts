import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "nusatrip_internal_secure_fallback_key_2026_change_in_production";

export interface SessionPayload {
  employeeId: string;
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Memvalidasi apakah cookie request saat ini memiliki sesi admin yang sah
 */
export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("nusatrip_session");
    const { valid } = verifySessionToken(session?.value);
    return valid;
  } catch {
    return false;
  }
}

/**
 * Membuat token sesi bertanda tangan kriptografis (HMAC-SHA256)
 * Berlaku selama 12 jam sejak diterbitkan
 */
export function createSessionToken(employeeId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    employeeId: employeeId.trim().toLowerCase(),
    role: "admin",
    iat: now,
    exp: now + 12 * 60 * 60, // 12 jam masa berlaku
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Memvalidasi keaslian tanda tangan token dan masa kedaluwarsa
 */
export function verifySessionToken(token: string | undefined | null): {
  valid: boolean;
  payload?: SessionPayload;
} {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadB64, signature] = parts;

  // Verifikasi tanda tangan kriptografis dengan waktu konstan untuk cegah timing attacks
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isSignatureValid) {
      return { valid: false };
    }

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false }; // Token kedaluwarsa
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
