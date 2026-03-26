"use client";

import { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const POPULAR_ROUTES = [
  { from: "İstanbul", to: "Ankara", duration: "~5.5 saat", price: "350" },
  { from: "İstanbul", to: "İzmir", duration: "~6 saat", price: "400" },
  { from: "İstanbul", to: "Antalya", duration: "~8 saat", price: "500" },
  { from: "Ankara", to: "İstanbul", duration: "~5.5 saat", price: "350" },
  { from: "İstanbul", to: "Bursa", duration: "~3 saat", price: "200" },
  { from: "İzmir", to: "Antalya", duration: "~5 saat", price: "350" },
  { from: "Ankara", to: "Antalya", duration: "~6 saat", price: "400" },
  { from: "İstanbul", to: "Trabzon", duration: "~12 saat", price: "600" },
  { from: "İstanbul", to: "Sivas", duration: "~10 saat", price: "550" },
];

const BUS_COMPANIES = [
  { name: "Metro Turizm", image: "/buses/metro.png" },
  { name: "Kamil Koç", image: "/buses/kamilkoc.png" },
  { name: "Pamukkale Turizm", image: "/buses/pamukkale.png" },
  { name: "Varan Turizm", image: "/buses/varan.png" },
  { name: "Ulusoy Turizm", image: "/buses/ulusoy.png" },
  { name: "Sivas Tur", image: "/buses/sivastur.png" },
  { name: "Sivaste Tur", image: "/buses/sivaste.png" },
  { name: "Seç Turizm", image: "/buses/sec.png" },
  { name: "Has Turizm", image: "/buses/has.png" },
  { name: "Anadolu Ulaşım", image: "/buses/anadolu.png" },
  { name: "Sivas Huzur", image: "/buses/sivashuzur.png" },
  { name: "Balıkesir Seyahat", image: "/buses/balikesir.png" },
];

export default function OtobusPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">Otobüs Bileti</h1>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
              Türkiye&apos;nin önde gelen otobüs firmalarından en uygun fiyatlı biletler
            </p>
          </div>
        </div>

        {/* Search form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-5 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Nereden</label>
                <input
                  type="text"
                  placeholder="Kalkış şehri..."
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Nereye</label>
                <input
                  type="text"
                  placeholder="Varış şehri..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Yolcu Sayısı</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} Yolcu</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="w-full mt-5 px-6 py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 hover:shadow-brand-red/30 text-sm sm:text-base">
              Otobüs Ara
            </button>
          </div>
        </div>

        {/* Bus Companies Marquee */}
        <div className="pt-8 sm:pt-10">
          <div className="overflow-hidden">
            <div className="flex items-center gap-6 sm:gap-10 animate-marquee-reverse w-max">
              {[...BUS_COMPANIES, ...BUS_COMPANIES, ...BUS_COMPANIES].map((company, i) => (
                <div key={i} className="shrink-0 w-[140px] sm:w-[180px] h-[36px] sm:h-[48px] flex items-center justify-center">
                  <Image
                    src={company.image}
                    alt={company.name}
                    width={150}
                    height={40}
                    className="max-h-full max-w-full opacity-50 hover:opacity-100 transition-opacity duration-300 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Online Koltuk Seçimi",
                desc: "Otobüs planı üzerinden istediğiniz koltuğu seçin",
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                color: "#10b981",
              },
              {
                title: "Fiyat Karşılaştırma",
                desc: "Tüm firmaların fiyatlarını tek ekranda karşılaştırın",
                icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                color: "#6366f1",
              },
              {
                title: "Anında Onay",
                desc: "Biletiniz anında onaylanır, e-posta ile gönderilir",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "#f59e0b",
              },
            ].map((item) => (
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

        {/* Popular Routes */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Popüler Otobüs Seferleri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-red/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-red/5 flex items-center justify-center group-hover:bg-brand-red/10 transition-colors">
                    <svg className="w-5 h-5 text-brand-red/60 group-hover:text-brand-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-red transition-colors">
                      {route.from} → {route.to}
                    </h3>
                    <p className="text-xs text-gray-400">{route.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-brand-red">{route.price} ₺</span>
                  <span className="block text-[10px] text-gray-400">&apos;den başlayan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-12 sm:pb-16" />
      </main>
      <Footer />
    </>
  );
}
