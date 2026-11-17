import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { INITIAL_ZONES, type ZoneItem } from "@/lib/data/tour-data";

let serverZones: ZoneItem[] = [...INITIAL_ZONES];

export async function GET() {
  return NextResponse.json({ zones: serverZones });
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
      serverZones = body;
      return NextResponse.json({ success: true, count: serverZones.length });
    }

    if (body && typeof body === "object" && body.name) {
      const newZone: ZoneItem = {
        ...body,
        id: body.id || `zn-${Date.now()}`,
      };
      serverZones = [...serverZones, newZone];
      return NextResponse.json({ success: true, zone: newZone });
    }

    return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data zona" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("nusatrip_session");
    if (!session || session.value !== "nusatrip_internal_auth_token_2026") {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Parameter id atau updates tidak lengkap" }, { status: 400 });
    }

    serverZones = serverZones.map((z) => (z.id === id ? { ...z, ...updates } : z));
    const updated = serverZones.find((z) => z.id === id);

    return NextResponse.json({ success: true, zone: updated });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui data zona" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("nusatrip_session");
    if (!session || session.value !== "nusatrip_internal_auth_token_2026") {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Parameter id wajib disertakan" }, { status: 400 });
    }

    serverZones = serverZones.filter((z) => z.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus zona" }, { status: 500 });
  }
}
