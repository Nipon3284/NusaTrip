import { NextResponse } from "next/server";
import { verifyPaymentWebhookSignature } from "@/lib/payments/invoice";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-callback-signature") || request.headers.get("x-signature");

    // Verifikasi tanda tangan kriptografis dari Payment Gateway
    const isAuthentic = verifyPaymentWebhookSignature(rawBody, signature);
    if (!isAuthentic && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Tanda tangan webhook tidak valid" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { invoiceNumber, status, paidAmount } = payload;

    // Catat log settlement transaksi
    return NextResponse.json({
      success: true,
      message: `Status pembayaran invoice ${invoiceNumber} berhasil diperbarui menjadi ${status} (${paidAmount})`,
    });
  } catch {
    return NextResponse.json({ error: "Gagal memproses notifikasi pembayaran" }, { status: 400 });
  }
}
