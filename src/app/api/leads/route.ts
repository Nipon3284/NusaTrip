import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { INITIAL_LEADS, type CustomerLeadItem } from "@/lib/data/tour-data";

let serverLeads: CustomerLeadItem[] = [...INITIAL_LEADS];

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("nusatrip_session");
  if (!session || session.value !== "nusatrip_internal_auth_token_2026") {
    return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
  }
  return NextResponse.json({ leads: serverLeads });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, destination, category, pax, days, hotel, notes } = body;

    if (!name || !phone || !destination) {
      return NextResponse.json(
        { error: "Nama, nomor telepon, dan destinasi wajib diisi" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/[^\d+]/g, "").slice(0, 20);
    const cleanName = String(name).slice(0, 100);
    const cleanNotes = notes ? String(notes).slice(0, 500) : "";

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

    const newLead: CustomerLeadItem = {
      id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanName,
      phone: cleanPhone,
      destination: String(destination),
      category: String(category || "Company Gathering & Outing"),
      pax: Math.max(1, Number(pax) || 1),
      days: Math.max(1, Number(days) || 1),
      hotel: String(hotel || "Bintang 4"),
      notes: cleanNotes,
      createdAt: timeStr,
      status: "baru",
    };

    serverLeads = [newLead, ...serverLeads];
    return NextResponse.json({ success: true, lead: newLead });
  } catch {
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("nusatrip_session");
    if (!session || session.value !== "nusatrip_internal_auth_token_2026") {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const { id, status } = await request.json();
    serverLeads = serverLeads.map((l) => (l.id === id ? { ...l, status } : l));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui status lead" }, { status: 500 });
  }
}
