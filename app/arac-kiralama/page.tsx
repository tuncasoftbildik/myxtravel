"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { RentalMarquee } from "@/components/rental-marquee";
import { Footer } from "@/components/footer";

const DEFAULT_CITIES = [
  { name: "İstanbul", desc: "Sabiha Gökçen & İstanbul Havalimanı", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { name: "Antalya", desc: "Antalya Havalimanı", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
  { name: "İzmir", desc: "Adnan Menderes Havalimanı", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { name: "Ankara", desc: "Esenboğa Havalimanı", icon: "M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
  { name: "Dalaman", desc: "Dalaman Havalimanı", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { name: "Bodrum", desc: "Milas-Bodrum Havalimanı", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" },
];

const DEFAULT_CARS = [
  { name: "Ekonomik", desc: "Fiat Egea, Renault Clio", icon: "M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.4L21 11M3 11v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M3 11h18", price: "450" },
  { name: "Konfor", desc: "VW Passat, Toyota Corolla", icon: "M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.4L21 11M3 11v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M3 11h18", price: "750" },
  { name: "SUV", desc: "Nissan Qashqai, VW Tiguan", icon: "M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.4L21 11M3 11v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M3 11h18", price: "950" },
  { name: "Lüks", desc: "BMW 5, Mercedes E", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", price: "1.500" },
];

const DEFAULT_FEATURES = [
  { title: "Km Sınırı Yok", desc: "Sınırsız kilometre ile özgürce seyahat edin", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "#10b981" },
  { title: "Full Kasko Dahil", desc: "Tüm araçlarda kapsamlı kasko sigortası", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "#6366f1" },
  { title: "Ücretsiz İptal", desc: "48 saat öncesine kadar ücretsiz iptal hakkı", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#f59e0b" },
];

export default function AracKiralamaPage() {
  const [city, setCity] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [heroTitle, setHeroTitle] = useState("Araç Kiralama");
  const [heroDesc, setHeroDesc] = useState("Türkiye'nin her yerinde uygun fiyatlı, güvenilir araç kiralama");
  const [cars, setCars] = useState(DEFAULT_CARS);
  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.settings) return;
        const s = data.settings;
        if (s.arac_title) setHeroTitle(s.arac_title);
        if (s.arac_desc) setHeroDesc(s.arac_desc);
        if (s.arac_car_types_json) {
          try {
            const parsed = JSON.parse(s.arac_car_types_json);
            setCars(parsed.map((c: { name: string; desc: string; price: string }, i: number) => ({
              ...DEFAULT_CARS[i],
              ...c,
            })));
          } catch {}
        }
        if (s.arac_cities_json) {
          try {
            const parsed = JSON.parse(s.arac_cities_json);
            setCities(parsed.map((c: { name: string; desc: string }, i: number) => ({
              ...DEFAULT_CITIES[i],
              ...c,
            })));
          } catch {}
        }
        if (s.arac_features_json) {
          try {
            const parsed = JSON.parse(s.arac_features_json);
            setFeatures(parsed.map((f: { title: string; desc: string; color: string }, i: number) => ({
              ...DEFAULT_FEATURES[i],
              ...f,
            })));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        {/* Hero banner */}
        <div className="relative bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-[20%] w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[10%] w-48 h-48 bg-fuchsia-500/8 rounded-full blur-[80px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 sm:pt-14 sm:pb-24 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">{heroTitle}</h1>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">{heroDesc}</p>
          </div>
        </div>

        {/* Search form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-5 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Alış Lokasyonu</label>
                <input
                  type="text"
                  placeholder="Şehir, havalimanı veya adres..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Alış Tarihi</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Alış Saati</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">İade Tarihi</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">İade Saati</label>
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
            </div>
            <button className="w-full mt-5 px-6 py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 hover:shadow-brand-red/30 text-sm sm:text-base">
              Araç Ara
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                  <svg className="w-5 h-5" style={{ color: item.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Car Types */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Araç Tipleri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cars.map((car) => (
              <div key={car.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-brand-dark/5 flex items-center justify-center mb-4 group-hover:bg-brand-red/10 transition-colors">
                  <svg className="w-6 h-6 text-brand-dark/60 group-hover:text-brand-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={car.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">{car.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{car.desc}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-brand-red">{car.price} ₺</span>
                  <span className="text-xs text-gray-400"> / gün&apos;den başlayan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Cities */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Popüler Lokasyonlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((c) => (
              <div key={c.name} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-red/20 transition-all cursor-pointer group">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-red/5 flex items-center justify-center group-hover:bg-brand-red/10 transition-colors">
                  <svg className="w-6 h-6 text-brand-red/60 group-hover:text-brand-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-red transition-colors">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <RentalMarquee />
      </main>
      <Footer />
    </>
  );
}
