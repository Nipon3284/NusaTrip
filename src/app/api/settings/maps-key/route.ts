import { NextResponse } from "next/server";
import { getSystemMapsKey, saveSystemMapsKey } from "@/lib/server/system-settings";

export async function GET() {
  try {
    const apiKey = await getSystemMapsKey();
    return NextResponse.json(
      { success: true, apiKey: apiKey || "" },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error reading Google Maps API key:", error);
    return NextResponse.json(
      { success: false, apiKey: "", error: "Gagal memuat konfigurasi API key" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Kunci API tidak boleh kosong" },
        { status: 400 }
      );
    }

    await saveSystemMapsKey(apiKey);

    return NextResponse.json({
      success: true,
      apiKey,
      message: "Kunci Google Maps berhasil disimpan dan disinkronkan ke seluruh perangkat.",
    });
  } catch (error) {
    console.error("Error saving Google Maps API key:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan konfigurasi API key" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await saveSystemMapsKey("");
    return NextResponse.json({
      success: true,
      message: "Kunci Google Maps telah dihapus dari seluruh konfigurasi sistem.",
    });
  } catch (error) {
    console.error("Error deleting Google Maps API key:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus konfigurasi API key" },
      { status: 500 }
    );
  }
}
