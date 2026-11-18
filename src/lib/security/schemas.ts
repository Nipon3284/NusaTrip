import { z } from "zod";

// Skema Validasi Pengajuan Lead Baru (Kustom Trip B2B)
export const CreateLeadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter").trim(),
  institution: z.string().max(120).optional().nullable(),
  phone: z
    .string()
    .min(8, "Nomor telepon minimal 8 digit")
    .max(20, "Nomor telepon maksimal 20 digit")
    .regex(/^[0-9+\s\-()]+$/, "Format nomor telepon tidak valid")
    .trim(),
  destination: z.string().min(2, "Destinasi wajib dipilih").max(80).trim(),
  category: z.string().max(80).default("Company Gathering & Outing"),
  pax: z.coerce.number().int().min(1, "Minimal 1 peserta").max(2000, "Maksimal 2000 peserta"),
  days: z.coerce.number().int().min(1, "Minimal 1 hari").max(30, "Maksimal 30 hari"),
  hotel: z.string().max(50).default("Bintang 3"),
  budget: z.coerce.number().min(0, "Anggaran tidak boleh negatif"),
  selectedSpots: z.array(z.string()).default([]),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional().nullable(),
  userId: z.string().optional().nullable(),
  userEmail: z.string().optional().nullable(),
});

// Skema Login Admin Internal Gate
export const AdminLoginSchema = z.object({
  employeeId: z.string().min(1, "ID Pegawai wajib diisi").max(50).trim(),
  secretPin: z.string().min(4, "PIN minimal 4 digit").max(20).trim(),
});

// Skema Pembaruan Status Lead
export const UpdateLeadStatusSchema = z.object({
  id: z.string().min(1, "ID Lead diperlukan"),
  status: z
    .enum(["baru", "negosiasi", "menunggu_dp", "proses_dss", "final_h7", "selesai"])
    .optional(),
  customerBid: z.coerce.number().optional(),
  notes: z.string().max(500).optional(),
});
