"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";

interface Stats {
  total_orders: number;
  total_sales: number;
  total_earnings: number;
  completed: number;
  pending: number;
}

interface AgencyProfile {
  name: string;
  domain: string;
  commission_rate: number;
  is_active: boolean;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  flight: "Ucak",
  hotel: "Otel",
  bus: "Otobus",
  car: "Arac Kiralama",
  transfer: "Transfer",
  tour: "Tur",
};

export default function AcentaPaneli() {
  const { isAgencyUser, isLoggedIn, loading: authLoading, agencyUser } = useAgencyAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [agency, setAgency] = useState<AgencyProfile | null>(null);
  const [markups, setMarkups] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    if (!isAgencyUser) return;
    fetch("/api/agency/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.agency) setAgency(data.agency);
        if (data.stats) setStats(data.stats);
        if (data.markups) setMarkups(data.markups);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    fetch("/api/agency/bookings?status=new")
      .then((r) => r.json())
      .then((d) => setPendingRequestCount((d.requests || []).length))
      .catch(() => {});
  }, [isAgencyUser]);

  if (authLoading) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    );
  }

  if (!isLoggedIn || !isAgencyUser) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">
              {!isLoggedIn ? "Bu sayfayi goruntulemek icin giris yapmalisiniz." : "Bu sayfaya erisim yetkiniz bulunmamaktadir."}
            </p>
            {!isLoggedIn && (
              <a href="/giris?redirect=/acenta/panel" className="text-brand-red font-semibold hover:underline">Giris Yap</a>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Acenta Paneli</h1>
              <p className="text-sm text-gray-500 mt-1">
                {agencyUser?.agencyName} — <span className="capitalize">{agencyUser?.role}</span>
              </p>
            </div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">Siteye Git</Link>
          </div>

          {/* Stats cards */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bu Ay Siparis</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Toplam Satis</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_sales.toLocaleString("tr-TR")} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Kazanciniz</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.total_earnings.toLocaleString("tr-TR")} TL</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bekleyen</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
            </div>
          )}

          {/* Quick panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Link
              href="/acenta/panel/fiyatlar"
              className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Fiyat Ayarlari</h3>
              <p className="text-sm text-gray-500">Hizmet turune gore kar marji belirleyin</p>
            </Link>

            <Link
              href="/acenta/panel/siparisler"
              className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Siparislerim</h3>
              <p className="text-sm text-gray-500">Satis gecmisi ve siparis takibi</p>
            </Link>

            <Link
              href="/acenta/panel/urunlerim"
              className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Ürünlerim</h3>
              <p className="text-sm text-gray-500">Kendi transfer ve turlarınızı yönetin</p>
            </Link>

            <Link
              href="/acenta/panel/talepler"
              className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative"
            >
              {pendingRequestCount > 0 && (
                <span className="absolute top-4 right-4 bg-brand-red text-white text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center">
                  {pendingRequestCount}
                </span>
              )}
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Rezervasyon Talepleri</h3>
              <p className="text-sm text-gray-500">
                {pendingRequestCount > 0 ? `${pendingRequestCount} yeni talep bekliyor` : "Müşteri talepleri"}
              </p>
            </Link>
          </div>

          {/* Current markups overview */}
          {Object.keys(markups).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Mevcut Kar Marjlariniz</h3>
                <Link href="/acenta/panel/fiyatlar" className="text-xs text-brand-red hover:underline">Duzenle &rarr;</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-lg font-bold text-gray-900">%{markups[key] || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
