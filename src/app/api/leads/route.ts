import { NextResponse } from "next/server";
import { type CustomerLeadItem } from "@/lib/data/tour-data";
import { checkAdminSession } from "@/lib/auth/session";
import { getDbLeads, insertDbLead, updateDbLeadStatus } from "@/lib/supabase/db";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { CreateLeadSchema, UpdateLeadStatusSchema } from "@/lib/security/schemas";

let memoryLeads: CustomerLeadItem[] | null = null;

export async function GET() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
  }

  try {
    if (!memoryLeads) {
      memoryLeads = await getDbLeads();
    }
    return NextResponse.json({ leads: memoryLeads });
  } catch {
    return NextResponse.json({ error: "Gagal memuat data leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Proteksi Anti-Spam Rate Limiting (Maks 10 pengajuan per menit per IP)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`leads:${clientIp}`, { limit: 10, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak permintaan pengajuan. Silakan tunggu ${rateCheck.resetSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    // 2. Validasi Skema Input dengan Zod
    const rawBody = await request.json();
    const parseResult = CreateLeadSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Format data tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

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
      userId,
      userEmail,
    } = parseResult.data;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

    // 3. Kalkulasi Modal Rahasia Z-Minimum Internal Biro
    const estCostPerPax = days * 380000;
    const estTransport = days * 5500000;
    const bottomLineCost = Math.round(estCostPerPax * pax + estTransport);
    const parsedBudget = budget > 0 ? budget : Math.round(bottomLineCost * 1.25);

    const newLead: CustomerLeadItem = {
      id: rawBody.id || `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      institution: institution || undefined,
      phone,
      destination,
      category,
      pax,
      days,
      hotel,
      budget: parsedBudget,
      customerBid: parsedBudget,
      bottomLineCost,
      targetMargin: Math.round(bottomLineCost * 0.22),
      selectedSpots,
      notes: notes || "",
      createdAt: timeStr,
      status: "baru",
      userId: userId || undefined,
      userEmail: userEmail || undefined,
      pettyCashInitial: 1500000,
      fieldExpenses: [],
    };

    if (!memoryLeads) {
      memoryLeads = await getDbLeads();
    }
    memoryLeads = [newLead, ...memoryLeads];

    // 4. Sinkronisasi Asinkron ke PostgreSQL Supabase
    await insertDbLead(newLead);

    // 5. Sanitasi Respons Publik (Menyembunyikan Parameter Rahasia Finansial)
    const sanitizedClientLead = {
      id: newLead.id,
      name: newLead.name,
      institution: newLead.institution,
      destination: newLead.destination,
      pax: newLead.pax,
      days: newLead.days,
      hotel: newLead.hotel,
      budget: newLead.budget,
      customerBid: newLead.customerBid,
      status: newLead.status,
      createdAt: newLead.createdAt,
    };

    return NextResponse.json({ success: true, lead: sanitizedClientLead });
  } catch {
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
    }

    const rawBody = await request.json();
    const parseResult = UpdateLeadStatusSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Parameter pembaruan tidak valid" }, { status: 400 });
    }

    const { id, status, customerBid, notes } = parseResult.data;

    if (!memoryLeads) {
      memoryLeads = await getDbLeads();
    }

    memoryLeads = memoryLeads.map((l) => {
      if (l.id === id) {
        return {
          ...l,
          ...(status ? { status } : {}),
          ...(customerBid !== undefined ? { customerBid } : {}),
          ...(notes !== undefined ? { notes } : {}),
        };
      }
      return l;
    });

    if (status) {
      await updateDbLeadStatus(id, status);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui data lead" }, { status: 500 });
  }
}
