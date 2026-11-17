import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { AdminLoginSchema } from "@/lib/security/schemas";

const ADMIN_ID = process.env.ADMIN_ID || "admin";
const ADMIN_PIN = process.env.ADMIN_PIN || "123456";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("nusatrip_session");
    const { valid } = verifySessionToken(session?.value);
    return NextResponse.json({ authenticated: valid });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Proteksi Rate Limiting (Maks 5 percobaan per menit per IP untuk cegah brute-force)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`auth:${clientIp}`, { limit: 5, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${rateCheck.resetSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    // 2. Validasi Skema Input dengan Zod
    const rawBody = await request.json();
    const parseResult = AdminLoginSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: "Format ID atau PIN tidak valid" },
        { status: 400 }
      );
    }

    const { employeeId, secretPin } = parseResult.data;

    // 3. Verifikasi Kredensial
    if (
      employeeId.toLowerCase() === ADMIN_ID.toLowerCase() &&
      secretPin === ADMIN_PIN
    ) {
      const signedToken = createSessionToken(employeeId);
      const cookieStore = await cookies();
      cookieStore.set("nusatrip_session", signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12, // 12 jam
      });
      return NextResponse.json({ success: true, message: "Otorisasi berhasil" });
    }

    return NextResponse.json(
      { success: false, message: "ID Pegawai atau PIN Otorisasi tidak valid" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Permintaan tidak valid" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("nusatrip_session");
    return NextResponse.json({ success: true, message: "Sesi telah ditutup" });
  } catch {
    return NextResponse.json({ success: false });
  }
}
