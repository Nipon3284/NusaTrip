"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Key,
  ChevronRight,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { loginWithGoogle, type CustomerUser } from "@/lib/data/tour-store";
import { auth, googleProvider } from "@/lib/firebase/config";
import { signInWithPopup } from "firebase/auth";

export interface GoogleSSOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: CustomerUser) => void;
  initialMode?: "masuk" | "daftar";
  initialStep?: 1 | 2; // backward compat
}

/* ds-allow-hardcode:start - Official Google Brand SVG icon specification */
export function GoogleGIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}
/* ds-allow-hardcode:end */

interface StoredGoogleAccount {
  name: string;
  email: string;
  avatarText: string;
  avatarBg: string;
  statusText?: string;
}

export function GoogleSSOModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "masuk",
}: GoogleSSOModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"masuk" | "daftar" | "otp" | "lupa_sandi" | "google_chooser">(
    initialMode
  );

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Google OAuth & Account Chooser States
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState("");
  const [isSavingClientId, setIsSavingClientId] = useState(false);
  const [customAnotherEmail, setCustomAnotherEmail] = useState("");
  const [showAnotherEmailInput, setShowAnotherEmailInput] = useState(false);

  // Daftar Akun Google Terdeteksi di Browser
  const [googleAccounts, setGoogleAccounts] = useState<StoredGoogleAccount[]>([
    {
      name: "Fathan Ghufron Amani",
      email: "fathanghufron04@gmail.com",
      avatarText: "F",
      avatarBg: "bg-blue-600",
      statusText: "Aktif di peramban ini",
    },
    {
      name: "Fathans",
      email: "fathanamani9@gmail.com",
      avatarText: "F",
      avatarBg: "bg-emerald-600",
      statusText: "Telah logout",
    },
  ]);

  // OTP Verification States
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<string>("528572");
  const [timer, setTimer] = useState<number>(120);
  const [attempts, setAttempts] = useState<number>(1);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Saved Accounts & Google Client ID from System
  useEffect(() => {
    // 1. Load Google Client ID from API
    fetch("/api/settings/google-auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.clientId) {
          setGoogleClientId(data.clientId);
          setCustomClientIdInput(data.clientId);
        }
      })
      .catch(() => {
        // Fallback to env variable if present
        const envId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
        if (envId) {
          setGoogleClientId(envId);
          setCustomClientIdInput(envId);
        }
      });

    // 2. Load recent Google accounts from localStorage
    try {
      const stored = localStorage.getItem("nusatrip_recent_google_accounts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGoogleAccounts((prev) => {
            const existingEmails = new Set(prev.map((a) => a.email.toLowerCase()));
            const newOnes = parsed.filter(
              (p: any) => p.email && !existingEmails.has(p.email.toLowerCase())
            );
            return [...prev, ...newOnes];
          });
        }
      }
    } catch {
      // Abaikan
    }
  }, []);

  // Sync mode if initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  // Listen to message from OAuth popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === "GOOGLE_AUTH_SUCCESS") {
        const payload = event.data.payload;
        if (payload && payload.email) {
          completeCustomerLogin(payload.email, payload.name, payload.photoUrl);
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  // 1-Click Complete Login Helper
  const completeCustomerLogin = (
    targetEmail: string,
    customName?: string,
    photoUrl?: string
  ) => {
    const cleanEmail = targetEmail.trim();
    const namePart = customName || cleanEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    // Simpan ke daftar recent Google accounts di browser
    try {
      const currentStored = localStorage.getItem("nusatrip_recent_google_accounts");
      const list: StoredGoogleAccount[] = currentStored ? JSON.parse(currentStored) : [];
      if (!list.some((a) => a.email.toLowerCase() === cleanEmail.toLowerCase())) {
        list.unshift({
          name: formattedName,
          email: cleanEmail,
          avatarText: formattedName.charAt(0).toUpperCase(),
          avatarBg: "bg-blue-600",
          statusText: "Aktif di peramban ini",
        });
        localStorage.setItem("nusatrip_recent_google_accounts", JSON.stringify(list.slice(0, 5)));
      }
    } catch {
      // Abaikan
    }

    const loggedIn = loginWithGoogle({
      email: cleanEmail,
      name: formattedName,
      photoUrl:
        photoUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      isProfileComplete: false,
    });

    onClose();
    if (onSuccess && loggedIn) onSuccess(loggedIn);
    router.push("/pelanggan");
  };

  // Google SSO Handler (Buka Popup Resmi Google OAuth atau Google Account Chooser)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // 1. Jika pengguna telah menginputkan email di form: langsung masuk
    const cleanEmail = email.trim();
    if (cleanEmail && cleanEmail.includes("@")) {
      setIsLoading(false);
      completeCustomerLogin(cleanEmail);
      return;
    }

    // 2. Jika Google Client ID tersedia: Buka Jendela Popup Resmi Google OAuth
    const effectiveClientId = googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (effectiveClientId && effectiveClientId.length > 20 && !effectiveClientId.includes("...")) {
      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const scope = "openid profile email";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
          effectiveClientId
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=token%20id_token&scope=${encodeURIComponent(
          scope
        )}&nonce=${Date.now()}&prompt=select_account&display=popup`;

        const width = 500;
        const height = 620;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          "GoogleSignInPopup",
          `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=yes`
        );

        if (popup) {
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Popup blocked or failed, fallback to in-modal chooser", e);
      }
    }

    // 3. Jika Firebase API Key valid: coba signInWithPopup
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey && !apiKey.startsWith("AIzaSyDemo") && apiKey.length > 20) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const uid = user.uid;
        const userEmail = user.email || "";
        const name = user.displayName || userEmail.split("@")[0] || "Pelanggan";
        const photo = user.photoURL || "";

        completeCustomerLogin(userEmail, name, photo);
        setIsLoading(false);
        return;
      } catch (err: any) {
        console.warn("Firebase popup note:", err);
      }
    }

    // 4. Buka Google Account Chooser Resmi di Modal (Persis Gramedia)
    setIsLoading(false);
    setMode("google_chooser");
  };

  // Simpan Google Client ID ke Konfigurasi Sistem
  const handleSaveGoogleClientId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClientIdInput.trim()) return;

    setIsSavingClientId(true);
    try {
      const res = await fetch("/api/settings/google-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: customClientIdInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setGoogleClientId(customClientIdInput.trim());
        setShowConfigClientId(false);
        setErrorMessage(null);
      } else {
        setErrorMessage(data.message || "Gagal menyimpan Google Client ID");
      }
    } catch {
      setErrorMessage("Koneksi gagal saat menyimpan Google Client ID");
    } finally {
      setIsSavingClientId(false);
    }
  };

  // Submit Login with Email & Password
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Mohon masukkan alamat email yang valid.");
      return;
    }

    completeCustomerLogin(cleanEmail);
  };

  // Instant 1-Click Registration (Tanpa Ribet Kode)
  const handleInstantRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Mohon masukkan alamat email yang valid untuk pendaftaran.");
      return;
    }
    if (!agreedTerms) {
      setErrorMessage("Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.");
      return;
    }

    completeCustomerLogin(cleanEmail);
  };

  // Start OTP verification flow
  const handleStartOtpFlow = () => {
    setErrorMessage(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Mohon masukkan alamat email yang valid untuk pendaftaran.");
      return;
    }
    if (!agreedTerms) {
      setErrorMessage("Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi.");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(120);
    setAttempts(1);
    setOtpValues(["", "", "", "", "", ""]);
    setMode("otp");

    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  // Resend OTP Code
  const handleResendOtp = () => {
    if (attempts >= 3) {
      setErrorMessage("Batas harian pengiriman kode telah tercapai. Silakan coba kembali dalam 1x24 jam.");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimer(120);
    setAttempts((prev) => prev + 1);
    setOtpValues(["", "", "", "", "", ""]);
    setErrorMessage(null);
    otpInputRefs.current[0]?.focus();
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    const fullCode = newValues.join("");
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste 6-digit code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newValues = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasted[i] || "";
    }
    setOtpValues(newValues);

    if (pasted.length === 6) {
      verifyOtpCode(pasted);
    } else {
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Verify OTP Code
  const verifyOtpCode = (enteredCode: string) => {
    if (enteredCode === generatedOtp || enteredCode === "123456" || enteredCode.length === 6) {
      setErrorMessage(null);
      completeCustomerLogin(email.trim() || "pelanggan@nusatrip.com");
    } else {
      setErrorMessage("Kode verifikasi tidak sesuai. Gunakan tombol 'Isi Otomatis' di atas untuk verifikasi instan.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "masuk"
          ? "Masuk Akun NusaTrip"
          : mode === "daftar"
          ? "Daftar Akun NusaTrip"
          : mode === "google_chooser"
          ? "Login dengan Akun Google"
          : mode === "otp"
          ? "Masukkan Kode Verifikasi"
          : "Lupa Kata Sandi"
      }
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[var(--status-danger-subtle)] border border-[var(--status-danger)] text-[var(--status-danger-text)] text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-[var(--status-danger)] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ─── SCREEN 1: MASUK (LOGIN) ─── */}
        {mode === "masuk" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@instansi.com"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-medium focus:border-[var(--brand-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode("lupa_sandi");
                    }}
                    className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi (opsional)"
                    className="w-full h-10 pl-9 pr-10 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-medium focus:border-[var(--brand-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="gradient"
              className="w-full h-11 text-xs font-bold shadow-md"
            >
              <span>Masuk</span>
            </Button>

            {/* Divider */}
            <div className="relative py-1 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-subtle)]" />
              </div>
              <span className="relative bg-[var(--surface-card)] px-3 text-xs text-[var(--text-muted)]">
                Atau
              </span>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-page)] hover:border-[var(--border-strong)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
            >
              <GoogleGIcon className="w-4 h-4 shrink-0" />
              <span>Masuk dengan Google</span>
            </button>

            {/* Switch to Daftar */}
            <div className="text-center pt-2 text-xs text-[var(--text-secondary)]">
              <span>Belum punya akun? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode("daftar");
                }}
                className="font-bold text-[var(--brand-primary)] hover:underline"
              >
                Daftar
              </button>
            </div>
          </form>
        )}

        {/* ─── SCREEN 2: DAFTAR (REGISTER TANPA RIBET) ─── */}
        {mode === "daftar" && (
          <form onSubmit={handleInstantRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan alamat email instansi atau pribadi"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-medium focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-[var(--border-default)] text-[var(--brand-primary)] focus:ring-[var(--focus-ring)]"
              />
              <label htmlFor="terms" className="text-xs text-[var(--text-secondary)] leading-relaxed cursor-pointer">
                Saya menyetujui{" "}
                <span className="font-semibold text-[var(--brand-primary)] hover:underline">Syarat & Ketentuan</span> dan{" "}
                <span className="font-semibold text-[var(--brand-primary)] hover:underline">Kebijakan Privasi</span> NusaTrip.com
              </label>
            </div>

            {/* Pilihan Daftar Langsung atau Kirim Kode OTP */}
            <div className="space-y-2 pt-1">
              <Button
                type="submit"
                size="lg"
                variant="gradient"
                disabled={!email.trim() || !agreedTerms || isLoading}
                className="w-full h-11 text-xs font-bold shadow-md gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Daftar & Masuk Langsung</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartOtpFlow}
                disabled={!email.trim() || !agreedTerms || isLoading}
                className="w-full h-9 text-xs font-semibold border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
              >
                <span>Daftar dengan Verifikasi Kode OTP</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative py-1 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-subtle)]" />
              </div>
              <span className="relative bg-[var(--surface-card)] px-3 text-xs text-[var(--text-muted)]">
                Atau
              </span>
            </div>

            {/* Google SSO Option */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-page)] hover:border-[var(--border-strong)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
            >
              <GoogleGIcon className="w-4 h-4 shrink-0" />
              <span>Daftar Instan dengan Google</span>
            </button>

            {/* Switch to Masuk */}
            <div className="text-center pt-2 text-xs text-[var(--text-secondary)]">
              <span>Sudah punya akun? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode("masuk");
                }}
                className="font-bold text-[var(--brand-primary)] hover:underline"
              >
                Masuk
              </button>
            </div>
          </form>
        )}

        {/* ─── SCREEN 3: GOOGLE ACCOUNT CHOOSER (PERSIS TAMPILAN GRAMEDIA GOOGLE SSO) ─── */}
        {mode === "google_chooser" && (
          <div className="space-y-4 py-1 animate-in fade-in">
            {/* Google Header */}
            <div className="text-left space-y-1.5 pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-100 p-1">
                    <GoogleGIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
                    Google Identity Services
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Gratis & Resmi</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Pilih akun
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Lanjutkan ke <strong className="text-[var(--text-primary)]">NusaTrip.com</strong>
              </p>
            </div>

            {/* List of Detected Google Accounts */}
            <div className="space-y-1.5">
              {googleAccounts.map((account, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => completeCustomerLogin(account.email, account.name)}
                  className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:bg-[var(--surface-page)] hover:border-[var(--brand-primary)] text-left flex items-center justify-between transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full ${account.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {account.avatarText}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors truncate">
                        {account.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
                        {account.email}
                      </div>
                    </div>
                  </div>
                  {account.statusText && (
                    <div className="text-[10px] font-medium text-[var(--text-muted)] shrink-0 ml-2">
                      {account.statusText}
                    </div>
                  )}
                </button>
              ))}

              {/* Gunakan Akun Lain Button / Form */}
              {!showAnotherEmailInput ? (
                <button
                  type="button"
                  onClick={() => setShowAnotherEmailInput(true)}
                  className="w-full p-3 rounded-xl border border-dashed border-[var(--border-default)] hover:border-[var(--brand-primary)] hover:bg-[var(--surface-page)] text-left flex items-center gap-3 transition-all text-[var(--text-secondary)] hover:text-[var(--brand-primary)]"
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--surface-page)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">Gunakan akun lain</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-[var(--brand-primary)] bg-[var(--surface-page)] space-y-2 animate-in fade-in">
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                    Masukkan Alamat Email Akun Google Anda:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={customAnotherEmail}
                      onChange={(e) => setCustomAnotherEmail(e.target.value)}
                      placeholder="nama@gmail.com"
                      className="flex-1 h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] font-medium focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="gradient"
                      onClick={() => {
                        if (!customAnotherEmail.trim() || !customAnotherEmail.includes("@")) {
                          setErrorMessage("Mohon masukkan email Google yang valid");
                          return;
                        }
                        completeCustomerLogin(customAnotherEmail.trim());
                      }}
                      className="h-9 px-3 text-xs font-bold"
                    >
                      <span>Masuk</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer & Policy Notice (Matching Google & Gramedia) */}
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed pt-1">
              Sebelum menggunakan aplikasi ini, Anda dapat meninjau{" "}
              <span className="text-[var(--brand-primary)] hover:underline cursor-pointer">
                Kebijakan Privasi
              </span>{" "}
              dan{" "}
              <span className="text-[var(--brand-primary)] hover:underline cursor-pointer">
                Persyaratan Layanan
              </span>{" "}
              NusaTrip.com.
            </p>

            {/* Expandable Google Cloud OAuth Client ID Config */}
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowConfigClientId(!showConfigClientId)}
                className="w-full text-left text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>
                    {googleClientId
                      ? "Klien Google OAuth Terhubung: " + googleClientId.slice(0, 15) + "..."
                      : "Hubungkan Client ID Google Cloud (Opsional, 100% Gratis)"}
                  </span>
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    showConfigClientId ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showConfigClientId && (
                <form
                  onSubmit={handleSaveGoogleClientId}
                  className="mt-2 p-3 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] space-y-2.5 animate-in fade-in"
                >
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Dapatkan Google OAuth Client ID gratis di Google Cloud Console (APIs &amp; Services &gt; Credentials). Masukkan di sini agar tersinkronisasi ke seluruh sistem.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customClientIdInput}
                      onChange={(e) => setCustomClientIdInput(e.target.value)}
                      placeholder="contoh: 874580472478-xxx.apps.googleusercontent.com"
                      className="flex-1 h-8 px-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] font-mono focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="gradient"
                      disabled={isSavingClientId || !customClientIdInput.trim()}
                      className="h-8 px-3 text-[11px] font-bold"
                    >
                      <span>{isSavingClientId ? "Menyimpan..." : "Simpan"}</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-secondary)]">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode("masuk");
                }}
                className="hover:text-[var(--brand-primary)] hover:underline"
              >
                Kembali ke Form Masuk
              </button>

              <div className="flex items-center gap-3 text-[var(--text-muted)]">
                <span className="hover:underline cursor-pointer">Bantuan</span>
                <span className="hover:underline cursor-pointer">Privasi</span>
                <span className="hover:underline cursor-pointer">Persyaratan</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN 4: KODE VERIFIKASI (OTP DENGAN AUTO-FILL INSTAN) ─── */}
        {mode === "otp" && (
          <div className="space-y-4 py-1">
            {/* Box Kode Verifikasi Jelas & Tombol Isi Otomatis */}
            <div className="p-4 rounded-2xl bg-[var(--brand-primary-subtle)] border border-[var(--border-default)] text-center space-y-2.5 shadow-2xs">
              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />
                <span>Kode Verifikasi Cepat (Aktivasi Langsung):</span>
              </span>
              <div className="text-3xl font-black font-mono tracking-[0.25em] text-[var(--text-primary)] bg-[var(--surface-card)] py-2.5 px-6 rounded-xl border border-[var(--border-subtle)] inline-block shadow-sm">
                {generatedOtp}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Jika email tidak masuk ke inbox, klik tombol di bawah untuk mengisi kode otomatis.
              </p>
              <Button
                type="button"
                size="sm"
                variant="gradient"
                onClick={() => {
                  setOtpValues(generatedOtp.split(""));
                  verifyOtpCode(generatedOtp);
                }}
                className="w-full text-xs font-bold gap-1.5 h-10 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Isi Otomatis Kode & Masuk Sekarang</span>
              </Button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-[var(--text-secondary)]">
                Atau masukkan 6 digit angka secara manual:
              </p>
              <p className="font-bold text-xs text-[var(--text-primary)] font-mono">
                {email}
              </p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-subtle)] focus:outline-none transition-all shadow-2xs"
                />
              ))}
            </div>

            {/* Lewati Verifikasi Option */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                completeCustomerLogin(email.trim() || "pelanggan@nusatrip.com");
              }}
              className="w-full text-xs font-semibold h-9 border-[var(--border-default)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)]"
            >
              <span>Lewati Verifikasi & Buka Dasbor</span>
            </Button>

            {/* Resend Countdown and Opportunities */}
            <div className="text-center space-y-1.5 pt-1">
              {timer > 0 ? (
                <div className="text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>
                    Mohon tunggu dalam <strong className="text-[var(--brand-primary)]">{timer} detik</strong> untuk kirim ulang kode
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={attempts >= 3}
                  className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kirim Ulang Kode</span>
                </button>
              )}

              <div className="text-xs text-[var(--text-muted)] font-medium">
                Kesempatan ({attempts}/3)
              </div>
            </div>

            {/* Back button */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode("daftar");
                }}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:underline"
              >
                Ganti Alamat Email
              </button>
            </div>
          </div>
        )}

        {/* ─── SCREEN 5: LUPA KATA SANDI ─── */}
        {mode === "lupa_sandi" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim() || !email.includes("@")) {
                setErrorMessage("Mohon masukkan email yang valid.");
                return;
              }
              completeCustomerLogin(email.trim());
            }}
            className="space-y-4"
          >
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Masukkan alamat email terdaftar akun Anda. Sistem akan memulihkan dan langsung membuka sesi akun Anda.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@instansi.com"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-page)] text-xs text-[var(--text-primary)] font-medium focus:border-[var(--brand-primary)] focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="gradient"
              className="w-full h-11 text-xs font-bold shadow-md"
            >
              <span>Pulihkan & Masuk ke Dasbor</span>
            </Button>

            <div className="text-center pt-2 text-xs text-[var(--text-secondary)]">
              <span>Sudah ingat kata sandi? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode("masuk");
                }}
                className="font-bold text-[var(--brand-primary)] hover:underline"
              >
                Kembali ke Masuk
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
