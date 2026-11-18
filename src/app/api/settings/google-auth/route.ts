import { NextResponse } from "next/server";
import { getSystemGoogleClientId, saveSystemGoogleClientId } from "@/lib/server/system-settings";

export async function GET() {
  try {
    const clientId = await getSystemGoogleClientId();
    return NextResponse.json(
      { success: true, clientId: clientId || "" },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error reading Google Client ID:", error);
    return NextResponse.json(
      { success: false, clientId: "", error: "Gagal memuat konfigurasi Google Client ID" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientId = typeof body.clientId === "string" ? body.clientId.trim() : "";

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: "Google Client ID tidak boleh kosong" },
        { status: 400 }
      );
    }

    await saveSystemGoogleClientId(clientId);

    return NextResponse.json({
      success: true,
      clientId,
      message: "Google Client ID berhasil disimpan dan disinkronkan ke seluruh sistem.",
    });
  } catch (error) {
    console.error("Error saving Google Client ID:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan Google Client ID" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await saveSystemGoogleClientId("");
    return NextResponse.json({
      success: true,
      message: "Google Client ID telah dihapus dari konfigurasi sistem.",
    });
  } catch (error) {
    console.error("Error deleting Google Client ID:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus Google Client ID" },
      { status: 500 }
    );
  }
}
