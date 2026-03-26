"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface Promotion {
  id: string;
  title: string;
  description: string;
  badge: string;
  discount_label: string;
  valid_until: string;
  link: string;
  bg_color: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function KampanyalarPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((data) => {
        if (data.promotions?.length > 0) setPromotions(data.promotions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kampanyalar</h1>
          <p className="text-gray-500 mb-8">Seyahat fırsatlarını kaçırmayın</p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-6" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <p className="text-gray-500">Şu anda aktif kampanya bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <Link
                  key={promo.id}
                  href={promo.link || "#"}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {promo.badge.split("+").map((b, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold px-3 py-1 rounded-full border"
                          style={{ color: promo.bg_color, borderColor: promo.bg_color + "40" }}
                        >
                          {b.trim()}
                        </span>
                      ))}
                    </div>
                    {promo.discount_label && (
                      <span
                        className="text-xs font-bold text-white px-2.5 py-1 rounded-lg -rotate-12"
                        style={{ backgroundColor: promo.bg_color }}
                      >
                        {promo.discount_label}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black leading-tight mb-2" style={{ color: promo.bg_color }}>
                    {promo.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">{promo.description}</p>

                  {promo.valid_until && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-400">{formatDate(promo.valid_until)} tarihine kadar geçerli</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
