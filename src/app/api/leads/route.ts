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
    const {
      name,
      institution,
      phone,
      destination,
      category,
      pax,
      days,
      hotel,
      budget,
      selectedSpots,
      notes,
    } = body;

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

    const estCostPerPax = (Number(days) || 2) * 380000;
    const estTransport = (Number(days) || 2) * 5500000;
    const bottomLineCost = Math.round(estCostPerPax * (Number(pax) || 20) + estTransport);
    const parsedBudget = Number(budget) || Math.round(bottomLineCost * 1.25);

    const newLead: CustomerLeadItem = {
      id: body.id || `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanName,
      institution: institution ? String(institution).slice(0, 120) : undefined,
      phone: cleanPhone,
      destination: String(destination),
      category: String(category || "Company Gathering & Outing"),
      pax: Math.max(1, Number(pax) || 1),
      days: Math.max(1, Number(days) || 1),
      hotel: String(hotel || "Bintang 3"),
      budget: parsedBudget,
      customerBid: parsedBudget,
      bottomLineCost,
      targetMargin: Math.round(bottomLineCost * 0.22),
      selectedSpots: Array.isArray(selectedSpots) ? selectedSpots : [],
      notes: cleanNotes,
      createdAt: timeStr,
      status: "baru",
      pettyCashInitial: 1500000,
      fieldExpenses: [],
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

    const updates = await request.json();
    const { id } = updates;
    if (!id) {
      return NextResponse.json({ error: "ID lead diperlukan" }, { status: 400 });
    }

    serverLeads = serverLeads.map((l) => (l.id === id ? { ...l, ...updates } : l));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui data lead" }, { status: 500 });
  }
}
