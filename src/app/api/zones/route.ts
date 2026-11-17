import { NextResponse } from "next/server";
import { type ZoneItem } from "@/lib/data/tour-data";
import { checkAdminSession } from "@/lib/auth/session";
import { getDbZones, saveDbZone, deleteDbZone } from "@/lib/supabase/db";

let memoryZones: ZoneItem[] | null = null;

export async function GET() {
  try {
    if (!memoryZones) {
      memoryZones = await getDbZones();
    }
    return NextResponse.json({ zones: memoryZones });
  } catch {
    return NextResponse.json({ error: "Gagal memuat data zona" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    if (!memoryZones) {
      memoryZones = await getDbZones();
    }

    if (Array.isArray(body)) {
      memoryZones = body;
      return NextResponse.json({ success: true, count: memoryZones.length });
    }

    if (body && typeof body === "object" && body.name) {
      const newZone: ZoneItem = {
        ...body,
        id: body.id || `zn-${Date.now()}`,
      };
      memoryZones = [...memoryZones, newZone];
      await saveDbZone(newZone);
      return NextResponse.json({ success: true, zone: newZone });
    }

    return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data zona" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Parameter id atau updates tidak lengkap" }, { status: 400 });
    }

    if (!memoryZones) {
      memoryZones = await getDbZones();
    }

    memoryZones = memoryZones.map((z) => (z.id === id ? { ...z, ...updates } : z));
    const updated = memoryZones.find((z) => z.id === id);

    if (updated) {
      await saveDbZone(updated);
    }

    return NextResponse.json({ success: true, zone: updated });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui data zona" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Parameter id wajib disertakan" }, { status: 400 });
    }

    if (!memoryZones) {
      memoryZones = await getDbZones();
    }

    memoryZones = memoryZones.filter((z) => z.id !== id);
    await deleteDbZone(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus zona" }, { status: 500 });
  }
}
