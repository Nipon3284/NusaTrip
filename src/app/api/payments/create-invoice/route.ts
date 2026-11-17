import { NextResponse } from "next/server";
import {
  generateInvoiceNumber,
  calculatePaymentSplits,
  type InvoiceItem,
} from "@/lib/payments/invoice";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`pay:${clientIp}`, { limit: 15, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan invoice. Silakan tunggu ${rateCheck.resetSeconds} detik.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { leadId, customerName, totalBudget, paymentType = "dp", channel = "bca_va" } = body;

    if (!leadId || !totalBudget || totalBudget <= 0) {
      return NextResponse.json(
        { error: "ID pesanan dan nominal anggaran valid wajib disertakan" },
        { status: 400 }
      );
    }

    const { dpAmount, repaymentAmount } = calculatePaymentSplits(Number(totalBudget));
    const amountDue =
      paymentType === "dp" ? dpAmount : paymentType === "pelunasan" ? repaymentAmount : Number(totalBudget);

    const invoiceNumber = generateInvoiceNumber(leadId);

    // Nomor Virtual Account deterministic berbasis hash lead ID
    const vaSuffix = Math.abs(
      leadId.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 1000)
    )
      .toString()
      .slice(0, 8)
      .padStart(8, "0");

    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const invoice: InvoiceItem = {
      invoiceNumber,
      leadId,
      customerName: customerName || "Pelanggan B2B NusaTrip",
      totalAmount: Number(totalBudget),
      dpAmount,
      repaymentAmount,
      paymentType,
      amountDue,
      status: "menunggu_pembayaran",
      paymentChannel: channel,
      vaNumber: channel.includes("va") ? `88012${vaSuffix}` : undefined,
      qrisQrString: channel === "qris" ? `00020101021226${invoiceNumber}520459995802ID` : undefined,
      dueDate,
    };

    return NextResponse.json({ success: true, invoice });
  } catch {
    return NextResponse.json({ error: "Gagal memproses pembuatan invoice" }, { status: 500 });
  }
}
