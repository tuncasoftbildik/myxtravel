"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";

const SERVICE_TYPES = [
  { key: "flight", label: "Ucak Bileti", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
  { key: "hotel", label: "Otel", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { key: "bus", label: "Otobus", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "car", label: "Arac Kiralama", icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10" },
  { key: "transfer", label: "Transfer", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
  { key: "tour", label: "Tur", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
];

const EXAMPLE_PRICES = [1000, 2500, 5000, 10000];

export default function AcentaFiyatlar() {
  const { isAgencyUser, isLoggedIn, loading: authLoading, agencyUser } = useAgencyAuth();
  const [markups, setMarkups] = useState<Record<string, number>>({});
  const [platformRate, setPlatformRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAgencyUser) return;

    // Fetch current markups and agency info
    Promise.all([
      fetch("/api/agency/markups").then((r) => r.json()),
      fetch("/api/agency/profile").then((r) => r.json()),
    ])
      .then(([markupData, profileData]) => {
        if (markupData.markups) setMarkups(markupData.markups);
        if (profileData.agency?.commission_rate) setPlatformRate(Number(profileData.agency.commission_rate));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAgencyUser]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/agency/markups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markups }),
      });
      if (res.ok) setSaved(true);
    } catch {}
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function calcPrice(base: number, markupRate: number) {
    const agencyCost = base * (1 + platformRate / 100);
    return Math.round(agencyCost * (1 + markupRate / 100));
  }

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
            <p className="text-gray-600 mb-4">Bu sayfaya erisim yetkiniz bulunmamaktadir.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fiyat Ayarlari</h1>
              <p className="text-sm text-gray-500 mt-1">Hizmet turune gore kar marjinizi belirleyin</p>
            </div>
            <Link href="/acenta/panel" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
          </div>

          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Nasil calisir?</strong> API fiyatina platform komisyonu (%{platformRate}) eklenir,
              sizin maliyet fiyatiniz olusur. Belirlediginiz kar marji bu maliyet uzerine eklenerek
              musterinizin gorecegi satis fiyati hesaplanir.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Markup inputs per service type */}
              <div className="space-y-4 mb-8">
                {SERVICE_TYPES.map((st) => (
                  <div key={st.key} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={st.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900">{st.label}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Kar Marji:</span>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={markups[st.key] || 0}
                            onChange={(e) => setMarkups({ ...markups, [st.key]: Number(e.target.value) })}
                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right font-mono focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Price examples */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {EXAMPLE_PRICES.map((base) => {
                        const salePrice = calcPrice(base, markups[st.key] || 0);
                        const profit = salePrice - Math.round(base * (1 + platformRate / 100));
                        return (
                          <div key={base} className="bg-gray-50 rounded-lg p-2.5 text-center">
                            <p className="text-[10px] text-gray-400">API: {base.toLocaleString("tr-TR")} TL</p>
                            <p className="text-sm font-bold text-gray-900">{salePrice.toLocaleString("tr-TR")} TL</p>
                            <p className="text-[10px] text-emerald-600">+{profit.toLocaleString("tr-TR")} TL kar</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save button */}
              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <span className="text-sm text-emerald-600 font-medium">Kaydedildi!</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-brand-red text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
