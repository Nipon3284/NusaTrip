import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { INITIAL_PARTNERS, type PartnerItem } from "@/lib/data/tour-data";

let serverPartners: PartnerItem[] = [...INITIAL_PARTNERS];

export async function GET() {
  return NextResponse.json({ partners: serverPartners });
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
      serverPartners = body;
      return NextResponse.json({ success: true, count: serverPartners.length });
    }

    if (body && typeof body === "object" && body.name) {
      const newPartner: PartnerItem = {
        ...body,
        id: body.id || `pt-${Date.now()}`,
      };
      serverPartners = [newPartner, ...serverPartners];
      return NextResponse.json({ success: true, partner: newPartner });
    }

    return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data mitra" }, { status: 500 });
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

    serverPartners = serverPartners.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const updated = serverPartners.find((p) => p.id === id);

    return NextResponse.json({ success: true, partner: updated });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui data mitra" }, { status: 500 });
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

    serverPartners = serverPartners.filter((p) => p.id !== id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus mitra" }, { status: 500 });
  }
}
