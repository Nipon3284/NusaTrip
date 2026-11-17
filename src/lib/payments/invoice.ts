import crypto from "crypto";

export interface InvoiceItem {
  invoiceNumber: string;
  leadId: string;
  customerName: string;
  totalAmount: number;
  dpAmount: number;
  repaymentAmount: number;
  paymentType: "dp" | "pelunasan" | "full";
  amountDue: number;
  status: "menunggu_pembayaran" | "lunas" | "kedaluwarsa";
  paymentChannel: "qris" | "bca_va" | "mandiri_va" | "bni_va";
  vaNumber?: string;
  qrisQrString?: string;
  dueDate: string;
  paidAt?: string;
}

const PAYMENT_WEBHOOK_SECRET =
  process.env.PAYMENT_WEBHOOK_SECRET || "nusatrip_payment_secret_change_in_production";

/**
 * Membuat nomor invoice formal enterprise
 */
export function generateInvoiceNumber(leadId: string): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV/NT/${dateStr}/${leadId.replace(/[^a-zA-Z0-9]/g, "")}-${randomSuffix}`;
}

/**
 * Menghitung rincian Down Payment (30%) dan Pelunasan (70%)
 */
export function calculatePaymentSplits(totalBudget: number) {
  const dpAmount = Math.round(totalBudget * 0.3);
  const repaymentAmount = totalBudget - dpAmount;
  return { dpAmount, repaymentAmount };
}

/**
 * Memverifikasi keabsahan signature payload dari webhook Payment Gateway
 */
export function verifyPaymentWebhookSignature(
  payloadString: string,
  incomingSignature: string | null
): boolean {
  if (!incomingSignature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", PAYMENT_WEBHOOK_SECRET)
    .update(payloadString)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(incomingSignature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
