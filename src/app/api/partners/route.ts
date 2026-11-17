import { NextResponse } from "next/server";
import { type PartnerItem } from "@/lib/data/tour-data";
import { checkAdminSession } from "@/lib/auth/session";
import { getDbPartners, saveDbPartner, deleteDbPartner } from "@/lib/supabase/db";

let memoryPartners: PartnerItem[] | null = null;

export async function GET() {
  try {
    if (!memoryPartners) {
      memoryPartners = await getDbPartners();
    }
    return NextResponse.json({ partners: memoryPartners });
  } catch {
    return NextResponse.json({ error: "Gagal memuat data mitra" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    if (!memoryPartners) {
      memoryPartners = await getDbPartners();
    }

    if (Array.isArray(body)) {
      memoryPartners = body;
      return NextResponse.json({ success: true, count: memoryPartners.length });
    }

    if (body && typeof body === "object" && (body.name || body.nama)) {
      const newPartner: PartnerItem = {
        ...body,
        name: body.name || body.nama,
        id: body.id || `pt-${Date.now()}`,
      };
      memoryPartners = [newPartner, ...memoryPartners];
      await saveDbPartner(newPartner);
      return NextResponse.json({ success: true, partner: newPartner });
    }

    return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data mitra" }, { status: 500 });
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

    if (!memoryPartners) {
      memoryPartners = await getDbPartners();
    }

    memoryPartners = memoryPartners.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const updated = memoryPartners.find((p) => p.id === id);

    if (updated) {
      await saveDbPartner(updated);
    }

    return NextResponse.json({ success: true, partner: updated });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui data mitra" }, { status: 500 });
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

    if (!memoryPartners) {
      memoryPartners = await getDbPartners();
    }

    memoryPartners = memoryPartners.filter((p) => p.id !== id);
    await deleteDbPartner(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus mitra" }, { status: 500 });
  }
}
