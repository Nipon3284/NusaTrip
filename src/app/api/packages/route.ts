import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { INITIAL_PACKAGES, type TourPackageItem } from "@/lib/data/tour-data";

let serverPackages: TourPackageItem[] = [...INITIAL_PACKAGES];

export async function GET() {
  return NextResponse.json({ packages: serverPackages });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("nusatrip_session");
    if (!session || session.value !== "nusatrip_internal_auth_token_2026") {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    if (Array.isArray(body)) {
      serverPackages = body;
      return NextResponse.json({ success: true, count: serverPackages.length });
    }

    return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data paket" }, { status: 500 });
  }
}
