"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { loginWithGoogle } from "@/lib/data/tour-store";

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memproses otentikasi akun Google...");

  useEffect(() => {
    try {
      // 1. Ekstrak data dari Hash (#access_token=...&id_token=...) atau Query (?token=...)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash || window.location.search);

      const idToken = params.get("id_token");
      const accessToken = params.get("access_token");

      if (idToken) {
        // Decode payload JWT
        const parts = idToken.split(".");
        if (parts.length >= 2) {
          const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(payloadBase64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const userData = JSON.parse(jsonPayload);

          const email = userData.email || "";
          const name = userData.name || userData.given_name || email.split("@")[0];
          const photoUrl = userData.picture || "";
          const googleId = userData.sub || `goog_${Date.now()}`;

          // Kirim pesan ke parent window jika dibuka via popup
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              {
                type: "GOOGLE_AUTH_SUCCESS",
                payload: {
                  email,
                  name,
                  photoUrl,
                  googleId,
                },
              },
              window.location.origin
            );
            setStatus("success");
            setMessage("Login berhasil! Menutup jendela...");
            setTimeout(() => {
              window.close();
            }, 600);
            return;
          }

          // Fallback jika dibuka di tab/jendela yang sama
          loginWithGoogle({
            email,
            name,
            photoUrl,
            googleId,
            isProfileComplete: false,
          });

          setStatus("success");
          setMessage("Login berhasil! Mengalihkan ke Dasbor Pelanggan...");
          setTimeout(() => {
            router.push("/pelanggan");
          }, 800);
          return;
        }
      }

      // Jika hanya menerima access token, ambil profile via Google UserInfo API
      if (accessToken) {
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((profile) => {
            const email = profile.email || "";
            const name = profile.name || profile.given_name || email.split("@")[0];
            const photoUrl = profile.picture || "";
            const googleId = profile.sub || `goog_${Date.now()}`;

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(
                {
                  type: "GOOGLE_AUTH_SUCCESS",
                  payload: { email, name, photoUrl, googleId },
                },
                window.location.origin
              );
              setStatus("success");
              setTimeout(() => window.close(), 600);
              return;
            }

            loginWithGoogle({ email, name, photoUrl, googleId, isProfileComplete: false });
            setStatus("success");
            setTimeout(() => router.push("/pelanggan"), 800);
          })
          .catch(() => {
            setStatus("error");
            setMessage("Gagal memverifikasi profil Google");
          });
        return;
      }

      // Jika tidak ada token pada URL
      setStatus("error");
      setMessage("Token otentikasi Google tidak ditemukan.");
    } catch (err: any) {
      console.error("OAuth callback error:", err);
      setStatus("error");
      setMessage("Terjadi kesalahan saat memproses otentikasi Google.");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--surface-page)] text-[var(--text-primary)]">
      <div className="w-full max-w-sm p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-center shadow-lg space-y-4">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
            <p className="text-sm font-semibold">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--status-success-subtle)] text-[var(--status-success)] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[var(--status-success)]">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--status-danger-subtle)] text-[var(--status-danger)] flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[var(--status-danger)]">{message}</p>
            <button
              type="button"
              onClick={() => {
                if (window.opener) window.close();
                else router.push("/");
              }}
              className="text-xs font-bold text-[var(--brand-primary)] hover:underline pt-2"
            >
              Kembali ke NusaTrip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
