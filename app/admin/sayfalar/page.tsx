"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin, hasPermission } from "@/lib/supabase/use-admin";

type Tab = "otobus" | "arac";

interface Route {
  from: string;
  to: string;
  duration: string;
  price: string;
}

interface Feature {
  title: string;
  desc: string;
  color: string;
}

interface CarType {
  name: string;
  desc: string;
  price: string;
}

interface City {
  name: string;
  desc: string;
}

const DEFAULT_ROUTES: Route[] = [
  { from: "İstanbul", to: "Ankara", duration: "~5.5 saat", price: "350" },
  { from: "İstanbul", to: "İzmir", duration: "~6 saat", price: "400" },
  { from: "İstanbul", to: "Antalya", duration: "~8 saat", price: "500" },
];

const DEFAULT_OTOBUS_FEATURES: Feature[] = [
  { title: "Online Koltuk Seçimi", desc: "Otobüs planı üzerinden istediğiniz koltuğu seçin", color: "#10b981" },
  { title: "Fiyat Karşılaştırma", desc: "Tüm firmaların fiyatlarını tek ekranda karşılaştırın", color: "#6366f1" },
  { title: "Anında Onay", desc: "Biletiniz anında onaylanır, e-posta ile gönderilir", color: "#f59e0b" },
];

const DEFAULT_CARS: CarType[] = [
  { name: "Ekonomik", desc: "Fiat Egea, Renault Clio", price: "450" },
  { name: "Konfor", desc: "VW Passat, Toyota Corolla", price: "750" },
  { name: "SUV", desc: "Nissan Qashqai, VW Tiguan", price: "950" },
  { name: "Lüks", desc: "BMW 5, Mercedes E", price: "1.500" },
];

const DEFAULT_CITIES: City[] = [
  { name: "İstanbul", desc: "Sabiha Gökçen & İstanbul Havalimanı" },
  { name: "Antalya", desc: "Antalya Havalimanı" },
  { name: "İzmir", desc: "Adnan Menderes Havalimanı" },
  { name: "Ankara", desc: "Esenboğa Havalimanı" },
  { name: "Dalaman", desc: "Dalaman Havalimanı" },
  { name: "Bodrum", desc: "Milas-Bodrum Havalimanı" },
];

const DEFAULT_ARAC_FEATURES: Feature[] = [
  { title: "Km Sınırı Yok", desc: "Sınırsız kilometre ile özgürce seyahat edin", color: "#10b981" },
  { title: "Full Kasko Dahil", desc: "Tüm araçlarda kapsamlı kasko sigortası", color: "#6366f1" },
  { title: "Ücretsiz İptal", desc: "48 saat öncesine kadar ücretsiz iptal hakkı", color: "#f59e0b" },
];

export default function AdminSayfalar() {
  const [tab, setTab] = useState<Tab>("otobus");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [otobusRoutes, setOtobusRoutes] = useState<Route[]>(DEFAULT_ROUTES);
  const [otobusFeatures, setOtobusFeatures] = useState<Feature[]>(DEFAULT_OTOBUS_FEATURES);
  const [aracCars, setAracCars] = useState<CarType[]>(DEFAULT_CARS);
  const [aracCities, setAracCities] = useState<City[]>(DEFAULT_CITIES);
  const [aracFeatures, setAracFeatures] = useState<Feature[]>(DEFAULT_ARAC_FEATURES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { isAdmin, isLoggedIn, loading: authLoading, permissions } = useAdmin();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
          if (data.settings.otobus_routes_json) try { setOtobusRoutes(JSON.parse(data.settings.otobus_routes_json)); } catch {}
          if (data.settings.otobus_features_json) try { setOtobusFeatures(JSON.parse(data.settings.otobus_features_json)); } catch {}
          if (data.settings.arac_car_types_json) try { setAracCars(JSON.parse(data.settings.arac_car_types_json)); } catch {}
          if (data.settings.arac_cities_json) try { setAracCities(JSON.parse(data.settings.arac_cities_json)); } catch {}
          if (data.settings.arac_features_json) try { setAracFeatures(JSON.parse(data.settings.arac_features_json)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, string> = {
        otobus_title: settings.otobus_title || "",
        otobus_desc: settings.otobus_desc || "",
        otobus_routes_json: JSON.stringify(otobusRoutes),
        otobus_features_json: JSON.stringify(otobusFeatures),
        arac_title: settings.arac_title || "",
        arac_desc: settings.arac_desc || "",
        arac_car_types_json: JSON.stringify(aracCars),
        arac_cities_json: JSON.stringify(aracCities),
        arac_features_json: JSON.stringify(aracFeatures),
      };
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSaving(false);
    }
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

  if (!isLoggedIn || !isAdmin) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">
              {!isLoggedIn ? "Bu sayfayı görüntülemek için giriş yapmalısınız." : "Bu sayfaya erişim yetkiniz bulunmamaktadır."}
            </p>
            {!isLoggedIn ? (
              <a href="/giris" className="text-brand-red font-semibold hover:underline">Giriş Yap</a>
            ) : (
              <a href="/" className="text-brand-red font-semibold hover:underline">Ana Sayfa</a>
            )}
          </div>
        </main>
      </>
    );
  }

  if (!hasPermission(permissions, "sayfalar")) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">Bu modüle erişim yetkiniz bulunmamaktadır.</p>
            <a href="/admin" className="text-brand-red font-semibold hover:underline">Admin Paneli</a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sayfa İçerikleri</h1>
              <p className="text-sm text-gray-500 mt-1">Alt sayfa başlık, açıklama ve içerikleri</p>
            </div>
            <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
            <button
              onClick={() => setTab("otobus")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tab === "otobus" ? "bg-brand-red text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Otobüs Sayfası
            </button>
            <button
              onClick={() => setTab("arac")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tab === "arac" ? "bg-brand-red text-white" : "text-gray-500 hover:text-gray-700"}`}
            >
              Araç Kiralama
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {tab === "otobus" ? (
                <>
                  {/* Otobus Hero */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                      Sayfa Başlığı
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Başlık</label>
                        <input
                          value={settings.otobus_title || ""}
                          onChange={(e) => setSettings((prev) => ({ ...prev, otobus_title: e.target.value }))}
                          placeholder="Otobüs Bileti"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Açıklama</label>
                        <textarea
                          value={settings.otobus_desc || ""}
                          onChange={(e) => setSettings((prev) => ({ ...prev, otobus_desc: e.target.value }))}
                          placeholder="Türkiye'nin önde gelen otobüs firmalarından en uygun fiyatlı biletler"
                          rows={2}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Otobus Routes */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        Popüler Seferler
                      </h2>
                      <button
                        onClick={() => setOtobusRoutes([...otobusRoutes, { from: "", to: "", duration: "", price: "" }])}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        + Sefer Ekle
                      </button>
                    </div>
                    <div className="space-y-3">
                      {otobusRoutes.map((route, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={route.from}
                            onChange={(e) => { const c = [...otobusRoutes]; c[idx] = { ...c[idx], from: e.target.value }; setOtobusRoutes(c); }}
                            placeholder="Nereden"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={route.to}
                            onChange={(e) => { const c = [...otobusRoutes]; c[idx] = { ...c[idx], to: e.target.value }; setOtobusRoutes(c); }}
                            placeholder="Nereye"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={route.duration}
                            onChange={(e) => { const c = [...otobusRoutes]; c[idx] = { ...c[idx], duration: e.target.value }; setOtobusRoutes(c); }}
                            placeholder="Süre"
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={route.price}
                            onChange={(e) => { const c = [...otobusRoutes]; c[idx] = { ...c[idx], price: e.target.value }; setOtobusRoutes(c); }}
                            placeholder="Fiyat"
                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <button
                            onClick={() => setOtobusRoutes(otobusRoutes.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Otobus Features */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        Özellikler
                      </h2>
                      <button
                        onClick={() => setOtobusFeatures([...otobusFeatures, { title: "", desc: "", color: "#10b981" }])}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        + Özellik Ekle
                      </button>
                    </div>
                    <div className="space-y-3">
                      {otobusFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={feat.color}
                            onChange={(e) => { const c = [...otobusFeatures]; c[idx] = { ...c[idx], color: e.target.value }; setOtobusFeatures(c); }}
                            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                          />
                          <input
                            value={feat.title}
                            onChange={(e) => { const c = [...otobusFeatures]; c[idx] = { ...c[idx], title: e.target.value }; setOtobusFeatures(c); }}
                            placeholder="Başlık"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={feat.desc}
                            onChange={(e) => { const c = [...otobusFeatures]; c[idx] = { ...c[idx], desc: e.target.value }; setOtobusFeatures(c); }}
                            placeholder="Açıklama"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <button
                            onClick={() => setOtobusFeatures(otobusFeatures.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Arac Hero */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                      Sayfa Başlığı
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Başlık</label>
                        <input
                          value={settings.arac_title || ""}
                          onChange={(e) => setSettings((prev) => ({ ...prev, arac_title: e.target.value }))}
                          placeholder="Araç Kiralama"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Açıklama</label>
                        <textarea
                          value={settings.arac_desc || ""}
                          onChange={(e) => setSettings((prev) => ({ ...prev, arac_desc: e.target.value }))}
                          placeholder="Türkiye'nin her yerinde uygun fiyatlı, güvenilir araç kiralama"
                          rows={2}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arac Types */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        Araç Tipleri
                      </h2>
                      <button
                        onClick={() => setAracCars([...aracCars, { name: "", desc: "", price: "" }])}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        + Araç Tipi Ekle
                      </button>
                    </div>
                    <div className="space-y-3">
                      {aracCars.map((car, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={car.name}
                            onChange={(e) => { const c = [...aracCars]; c[idx] = { ...c[idx], name: e.target.value }; setAracCars(c); }}
                            placeholder="Tip adı"
                            className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={car.desc}
                            onChange={(e) => { const c = [...aracCars]; c[idx] = { ...c[idx], desc: e.target.value }; setAracCars(c); }}
                            placeholder="Örnek araçlar"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={car.price}
                            onChange={(e) => { const c = [...aracCars]; c[idx] = { ...c[idx], price: e.target.value }; setAracCars(c); }}
                            placeholder="Fiyat"
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <button
                            onClick={() => setAracCars(aracCars.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arac Cities */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        Popüler Lokasyonlar
                      </h2>
                      <button
                        onClick={() => setAracCities([...aracCities, { name: "", desc: "" }])}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        + Lokasyon Ekle
                      </button>
                    </div>
                    <div className="space-y-3">
                      {aracCities.map((city, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={city.name}
                            onChange={(e) => { const c = [...aracCities]; c[idx] = { ...c[idx], name: e.target.value }; setAracCities(c); }}
                            placeholder="Şehir"
                            className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={city.desc}
                            onChange={(e) => { const c = [...aracCities]; c[idx] = { ...c[idx], desc: e.target.value }; setAracCities(c); }}
                            placeholder="Havalimanı / Açıklama"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <button
                            onClick={() => setAracCities(aracCities.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arac Features */}
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        Özellikler
                      </h2>
                      <button
                        onClick={() => setAracFeatures([...aracFeatures, { title: "", desc: "", color: "#10b981" }])}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        + Özellik Ekle
                      </button>
                    </div>
                    <div className="space-y-3">
                      {aracFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={feat.color}
                            onChange={(e) => { const c = [...aracFeatures]; c[idx] = { ...c[idx], color: e.target.value }; setAracFeatures(c); }}
                            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0"
                          />
                          <input
                            value={feat.title}
                            onChange={(e) => { const c = [...aracFeatures]; c[idx] = { ...c[idx], title: e.target.value }; setAracFeatures(c); }}
                            placeholder="Başlık"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <input
                            value={feat.desc}
                            onChange={(e) => { const c = [...aracFeatures]; c[idx] = { ...c[idx], desc: e.target.value }; setAracFeatures(c); }}
                            placeholder="Açıklama"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <button
                            onClick={() => setAracFeatures(aracFeatures.filter((_, i) => i !== idx))}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-brand-red text-white text-sm font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : saved ? (
                  "Kaydedildi!"
                ) : (
                  "Tümünü Kaydet"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
