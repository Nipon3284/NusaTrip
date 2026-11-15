import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_ID = process.env.ADMIN_ID || "admin";
const ADMIN_PIN = process.env.ADMIN_PIN || "123456";
const SESSION_SECRET = "nusatrip_internal_auth_token_2026";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("nusatrip_session");
    const isAuthenticated = session?.value === SESSION_SECRET;
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, secretPin } = body;

    if (
      employeeId &&
      secretPin &&
      employeeId.trim().toLowerCase() === ADMIN_ID.toLowerCase() &&
      secretPin === ADMIN_PIN
    ) {
      const cookieStore = await cookies();
      cookieStore.set("nusatrip_session", SESSION_SECRET, {
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
