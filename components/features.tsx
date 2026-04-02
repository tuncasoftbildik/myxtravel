"use client";

import { useEffect, useState } from "react";

const ICON_MAP: Record<string, string> = {
  "Anlık Fiyat Karşılaştırma": "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  "256-bit SSL Güvenlik": "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  "7/24 Canlı Destek": "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  "Ücretsiz İptal": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
};

const DEFAULT_ICON = "M13 10V3L4 14h7v7l9-11h-7z";

const COLOR_MAP: Record<string, string> = {
  red: "bg-red-50 text-brand-red",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
  pink: "bg-pink-50 text-pink-600",
};

interface FeatureItem {
  title: string;
  desc: string;
  color: string;
  icon?: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  { title: "Anlık Fiyat Karşılaştırma", desc: "Yüzlerce havayolu ve otelden gerçek zamanlı fiyat karşılaştırması yapın.", color: "red" },
  { title: "256-bit SSL Güvenlik", desc: "Tüm ödeme işlemleriniz bankacılık seviyesinde şifreleme ile korunur.", color: "blue" },
  { title: "7/24 Canlı Destek", desc: "Seyahat öncesi ve sonrası uzman ekibimiz her zaman yanınızda.", color: "emerald" },
  { title: "Ücretsiz İptal", desc: "Çoğu rezervasyonda son 24 saate kadar ücretsiz iptal imkanı.", color: "amber" },
];

export function Features() {
  const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);
  const [badge, setBadge] = useState("Avantajlar");
  const [title, setTitle] = useState("Neden X?");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          if (data.settings.features_json) {
            try { setFeatures(JSON.parse(data.settings.features_json)); } catch {}
          }
          if (data.settings.features_section_badge) setBadge(data.settings.features_section_badge);
          if (data.settings.features_section_title) setTitle(data.settings.features_section_title);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-brand-red uppercase tracking-widest">{badge}</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl p-5 sm:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl ${COLOR_MAP[f.color] || COLOR_MAP.red} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon || ICON_MAP[f.title] || DEFAULT_ICON} />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
