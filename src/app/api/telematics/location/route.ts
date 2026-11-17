import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface TelematicsPing {
  leadId: string;
  beaconToken?: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  statusRundown?: string;
}

let latestLocationCache = new Map<string, TelematicsPing & { updatedAt: string }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId");

  if (!leadId) {
    return NextResponse.json({ error: "leadId wajib disertakan" }, { status: 400 });
  }

  const cached = latestLocationCache.get(leadId);
  return NextResponse.json({
    success: true,
    location: cached || {
      leadId,
      latitude: -7.7956,
      longitude: 110.3695,
      speedKmh: 45,
      statusRundown: "Perjalanan Menuju Destinasi Utama",
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`gps:${clientIp}`, { limit: 60, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Frekuensi ping GPS terlalu tinggi (maks 1 ping per detik)" },
        { status: 429 }
      );
    }

    const body: TelematicsPing = await request.json();
    const { leadId, latitude, longitude, speedKmh = 0, statusRundown = "Sedang Berjalan" } = body;

    if (!leadId || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Data koordinat GPS tidak lengkap" }, { status: 400 });
    }

    const updatedRecord = {
      leadId,
      latitude,
      longitude,
      speedKmh: Math.max(0, Math.round(speedKmh)),
      statusRundown,
      updatedAt: new Date().toISOString(),
    };

    latestLocationCache.set(leadId, updatedRecord);

    // Sinkronisasi ke PostgreSQL jika Supabase terhubung
    if (isSupabaseConfigured()) {
      await supabase
        .from("tbl_pesanan_pelanggan")
        .update({
          latitude_bus_terakhir: latitude,
          longitude_bus_terakhir: longitude,
          kecepatan_bus_kmh: speedKmh,
          waktu_lokasi_terakhir: new Date().toISOString(),
        })
        .eq("id_pengajuan", leadId);
    }

    return NextResponse.json({ success: true, recorded: updatedRecord });
  } catch {
    return NextResponse.json({ error: "Gagal memproses ping telematika" }, { status: 500 });
  }
}
