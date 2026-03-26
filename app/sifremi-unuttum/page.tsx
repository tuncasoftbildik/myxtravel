"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="X Travel" width={80} height={80} className="mx-auto object-contain" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">E-posta Gönderildi</h2>
              <p className="text-sm text-gray-500 mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu kontrol edin.
              </p>
              <Link href="/giris" className="text-sm text-brand-red hover:underline font-medium">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
              <p className="text-sm text-gray-500 mb-6">
                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ornek@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-red text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Şifrenizi hatırladınız mı?{" "}
                <Link href="/giris" className="text-brand-red hover:underline font-medium">Giriş Yap</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
