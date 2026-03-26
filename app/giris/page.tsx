"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    // Session yenilendikten sonra rolü kontrol et
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser && redirect === "/") {
        // Check admin role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id);
        const roleList = (roles || []).map((r: { role: string }) => r.role);
        if (roleList.includes("super_admin") || roleList.includes("admin")) {
          router.push("/admin");
          return;
        }

        // Check agency user
        const { data: agencyUser } = await supabase
          .from("agency_users")
          .select("agency_id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .single();
        if (agencyUser) {
          router.push("/acenta/panel");
          return;
        }
      }
    } catch (err) {
      // role check failed, continue to default redirect
    }

    router.push(redirect);
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) setError("Giriş başarısız oldu. Tekrar deneyin.");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol — Görsel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#0f0520] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <Image src="/logo.png" alt="X Travel" width={160} height={160} className="mx-auto mb-8 drop-shadow-2xl" />
          <h2 className="text-3xl font-bold text-white mb-4">Seyahatini Keşfet</h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Uçak, otel, transfer ve tur — tek platformda karşılaştır, en uygun fiyatla rezerve et.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 text-white/40 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white/80">500+</div>
              <div>Havayolu</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white/80">50K+</div>
              <div>Otel</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white/80">1M+</div>
              <div>Mutlu Yolcu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobil logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/logo.png" alt="X Travel" width={80} height={80} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Giriş Yap</h1>
          <p className="text-gray-500 mb-8">Hesabınıza giriş yaparak devam edin</p>

          {/* Sosyal giriş */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile devam et
            </button>

            <button
              onClick={() => handleSocialLogin("apple")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-black text-white rounded-2xl text-sm font-medium hover:bg-gray-900 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple ile devam et
            </button>
          </div>

          {/* Ayırıcı */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">veya</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* E-posta/şifre formu */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Şifre</label>
                <Link href="/sifremi-unuttum" className="text-xs text-brand-red hover:text-red-700 transition">
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.01] active:scale-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Giriş yapılıyor...
                </span>
              ) : "Giriş Yap"}
            </button>
          </form>

          {/* Kayıt ol */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Hesabınız yok mu?{" "}
            <Link href={`/kayit${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-brand-red font-semibold hover:text-red-700 transition">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
