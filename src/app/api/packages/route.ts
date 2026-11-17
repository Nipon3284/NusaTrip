import { NextResponse } from "next/server";
import { type TourPackageItem } from "@/lib/data/tour-data";
import { checkAdminSession } from "@/lib/auth/session";
import { getDbPackages, saveDbPackages } from "@/lib/supabase/db";

let memoryPackages: TourPackageItem[] | null = null;

export async function GET() {
  try {
    if (!memoryPackages) {
      memoryPackages = await getDbPackages();
    }
    return NextResponse.json({ packages: memoryPackages });
  } catch {
    return NextResponse.json({ error: "Gagal memuat paket wisata" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    if (Array.isArray(body)) {
      memoryPackages = body;
      // Sinkronisasi asinkron ke database Supabase
      await saveDbPackages(body);
      return NextResponse.json({ success: true, count: memoryPackages.length });
    }

    return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data paket" }, { status: 500 });
  }
}
