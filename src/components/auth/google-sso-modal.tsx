"use client";

import React, { useState } from "react";
import {
  LogIn,
  User,
  Building2,
  Check,
  ShieldCheck,
  Phone,
  Briefcase,
  MapPin,
  ArrowRight,
  AlertCircle,
  Mail,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/select";
import { loginWithGoogle, type CustomerUser } from "@/lib/data/tour-store";
import { auth, googleProvider, db } from "@/lib/firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface GoogleSSOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: CustomerUser) => void;
  initialStep?: 1 | 2;
}

const INSTANCE_CATEGORIES = [
  { value: "Perusahaan (Corporate B2B)", label: "Perusahaan (Corporate B2B)" },
  { value: "Sekolah / Kampus (Study Tour)", label: "Sekolah / Kampus (Study Tour)" },
  { value: "Komunitas / Klub Hobi", label: "Komunitas / Klub Hobi" },
  { value: "Instansi Medis / Rumah Sakit", label: "Instansi Medis / Rumah Sakit" },
  { value: "Keluarga & Rombongan Pribadi", label: "Keluarga & Rombongan Pribadi" },
];

export function GoogleSSOModal({ isOpen, onClose, onSuccess, initialStep = 1 }: GoogleSSOModalProps) {
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // User Auth Data from Google
  const [tempUid, setTempUid] = useState<string>("");
  const [tempEmail, setTempEmail] = useState<string>("");
  const [tempName, setTempName] = useState<string>("");
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>("");

  // Additional Institution & PIC Profile Data Form
  const [picName, setPicName] = useState("");
  const [picRole, setPicRole] = useState("Ketua Panitia Rombongan");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionCategory, setInstitutionCategory] = useState("Perusahaan (Corporate B2B)");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Yogyakarta");
  const [notes, setNotes] = useState("");

  // Real Firebase Google Sign-In with popup
  const handleFirebaseGoogleLogin = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const uid = user.uid;
      const email = user.email || "";
      const name = user.displayName || email.split("@")[0] || "Pelanggan";
      const photo = user.photoURL || "";

      setTempUid(uid);
      setTempEmail(email);
      setTempName(name);
      setTempPhotoUrl(photo);
      setPicName(name);

      // Check existing document in Firestore
      try {
        const userDocRef = doc(db, "pelanggan", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data();
          if (firestoreData.institution && firestoreData.phone) {
            // Already complete profile -> direct login!
            const loggedIn = loginWithGoogle({
              uid,
              email,
              name,
              photoUrl: photo,
              institution: firestoreData.institution,
              phone: firestoreData.phone,
              picName: firestoreData.picName || name,
              picRole: firestoreData.picRole,
              institutionCategory: firestoreData.institutionCategory,
              city: firestoreData.city,
              notes: firestoreData.notes,
              isProfileComplete: true,
            });
            setIsLoadingAuth(false);
            onClose();
            if (onSuccess && loggedIn) onSuccess(loggedIn);
            return;
          }
        }
      } catch (err) {
        // Continue to step 2 to input data
      }

      // If profile not complete yet, go to step 2:
      setIsLoadingAuth(false);
      setStep(2);
    } catch (err: any) {
      setIsLoadingAuth(false);
      console.warn("Firebase sign-in note:", err?.message);

      if (err?.code === "auth/popup-closed-by-user") {
        setAuthError("Proses masuk Google dibatalkan. Silakan coba kembali atau daftarkan profil instansi di bawah.");
      } else if (err?.code === "auth/unauthorized-domain") {
        setAuthError(
          "Domain belum terdaftar di Firebase Console Authorized Domains. Anda dapat melengkapi profil instansi secara mandiri."
        );
      } else {
        setAuthError(err?.message || "Koneksi Google Auth tidak dapat diselesaikan. Silakan coba kembali.");
      }
    }
  };

  // Open manual registration directly without Google Auth
  const handleOpenManualRegistration = () => {
    setAuthError(null);
    setTempUid(`usr_${Date.now()}`);
    setTempEmail("");
    setTempName("");
    setPicName("");
    setStep(2);
  };

  // Submit Step 2 Profile Completion
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = tempEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      alert("Mohon masukkan alamat email aktif yang valid.");
      return;
    }

    if (!institutionName.trim() || !phone.trim() || !picName.trim()) {
      alert("Mohon lengkapi Nama Instansi, Nama Penanggung Jawab, dan Nomor WhatsApp aktif.");
      return;
    }

    const uid = tempUid || `usr_${Date.now()}`;
    const name = tempName.trim() || picName.trim();

    // 1. Save to Firebase Firestore
    try {
      const docRef = doc(db, "pelanggan", uid);
      await setDoc(docRef, {
        uid,
        email: cleanEmail,
        name,
        picName: picName.trim(),
        picRole: picRole.trim(),
        institution: institutionName.trim(),
        institutionCategory,
        phone: phone.trim(),
        city: city.trim(),
        notes: notes.trim(),
        photoURL: tempPhotoUrl,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore save note:", err);
    }

    // 2. Save to app store
    const user = loginWithGoogle({
      uid,
      email: cleanEmail,
      name,
      photoUrl: tempPhotoUrl,
      institution: institutionName.trim(),
      phone: phone.trim(),
      picName: picName.trim(),
      picRole: picRole.trim(),
      institutionCategory,
      city: city.trim(),
      notes: notes.trim(),
      isProfileComplete: true,
    });

    onClose();
    if (onSuccess && user) onSuccess(user);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 1
          ? "Masuk Pelanggan (Firebase Auth & Google SSO)"
          : "Lengkapi Data Instansi & Penanggung Jawab"
      }
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* STEP 1: GOOGLE AUTH */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-[11px] text-[var(--text-secondary)] space-y-1">
              <strong className="text-indigo-900 dark:text-indigo-200 block font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Autentikasi Terverifikasi Google & Firebase</span>
              </strong>
              <p>
                Fitur <strong>Dasbor Pelanggan</strong>, <strong>Lacak Pesanan</strong>, serta
                dokumen <strong>VIP Clearance</strong> hanya dapat diakses oleh akun pelanggan instansi terdaftar.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Main Firebase Google Login Button */}
            <div className="pt-1 space-y-3">
              <Button
                size="lg"
                variant="gradient"
                onClick={handleFirebaseGoogleLogin}
                isLoading={isLoadingAuth}
                className="w-full gap-2 text-xs font-bold shadow-md h-11"
              >
                <LogIn className="w-4 h-4" />
                <span>Lanjutkan dengan Akun Google (Firebase Auth)</span>
              </Button>

              <div className="relative py-1 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-subtle)]" />
                </div>
                <span className="relative bg-[var(--surface-modal)] px-3 text-[11px] text-[var(--text-muted)]">
                  atau
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleOpenManualRegistration}
                className="w-full gap-2 text-xs font-semibold h-10 border-[var(--border-subtle)] hover:border-indigo-500"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>Daftar / Lengkapi Profil Instansi Baru</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE COMPLETION FORM (INSTANSI & PIC) */}
        {step === 2 && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            {tempEmail ? (
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-[11px] text-[var(--text-secondary)]">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                  Akun Google Terhubung: {tempEmail}
                </span>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Data instansi di bawah ini akan tercantum di Surat Perintah Kerja (SPK), Faktur Pajak, dan Kartu VIP rombongan.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)] block">
                  Pendaftaran Profil Instansi & Penanggung Jawab
                </span>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Lengkapi data resmi untuk pembentukan dokumen penawaran B2B dan akun dasbor pelanggan.
                </p>
              </div>
            )}

            {!tempEmail && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Alamat Email PIC / Instansi *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="nama.pic@perusahaan.co.id"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Nama Penanggung Jawab (PIC) *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Nama lengkap PIC"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Nomor WhatsApp PIC Aktif *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Nama Instansi / Perusahaan / Lembaga *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Contoh: PT Telkom Akses / SMAN 1"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Jabatan / Posisi Penanggung Jawab
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={picRole}
                    onChange={(e) => setPicRole(e.target.value)}
                    placeholder="Contoh: HRD Manager / Ketua Panitia"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kategori Instansi / Rombongan
                </label>
                <CustomSelect
                  value={institutionCategory}
                  onChange={setInstitutionCategory}
                  options={INSTANCE_CATEGORIES}
                  buttonClassName="w-full h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Kota Domisili Instansi
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Bandung, Jakarta, Yogyakarta"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Catatan / Preferensi Rombongan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferensi konsumsi halal, bus eksekutif, request kru medis tambahan..."
                className="w-full p-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)]"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs">
                Kembali
              </Button>
              <Button type="submit" variant="gradient" size="sm" className="text-xs font-bold gap-1">
                <span>Simpan Profil & Buka Dasbor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
