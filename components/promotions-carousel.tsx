"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

const FALLBACK_PROMOTIONS: Promotion[] = [
  {
    id: "1",
    title: "%20 indirim!",
    description: "Otellerde erken rezervasyon fırsatlarını kaçırma",
    badge: "Otel",
    discount_label: "-%20",
    valid_until: "2026-03-31",
    link: "/otel",
    bg_color: "#C41E3A",
  },
  {
    id: "2",
    title: "250 TL'ye varan indirim",
    description: "Ziraat Bankası Bankkart'a özel indirim fırsatı",
    badge: "Uçak",
    discount_label: "-250₺",
    valid_until: "2026-03-31",
    link: "/ucus",
    bg_color: "#C41E3A",
  },
  {
    id: "3",
    title: "175 TL net indirim!",
    description: "Otel rezervasyonu yapana uçak biletinde indirim",
    badge: "Otel + Uçak",
    discount_label: "-175₺",
    valid_until: "2026-12-31",
    link: "/otel",
    bg_color: "#C41E3A",
  },
  {
    id: "4",
    title: "%15 indirim!",
    description: "Yurt dışı turlarında erken rezervasyon avantajı",
    badge: "Tur",
    discount_label: "-%15",
    valid_until: "2026-06-30",
    link: "/tur",
    bg_color: "#C41E3A",
  },
  {
    id: "5",
    title: "Transfer hediye!",
    description: "Otel rezervasyonlarında havalimanı transferi bizden",
    badge: "Transfer",
    discount_label: "Hediye",
    valid_until: "2026-04-30",
    link: "/transfer",
    bg_color: "#C41E3A",
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export function PromotionsCarousel() {
  const [promotions, setPromotions] = useState<Promotion[]>(FALLBACK_PROMOTIONS);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((data) => {
        if (data.promotions && data.promotions.length > 0) {
          setPromotions(data.promotions);
        }
      })
      .catch(() => {});
  }, []);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(promotions.length / itemsPerPage);

  function scroll(dir: "left" | "right") {
    const next = dir === "left" ? Math.max(0, page - 1) : Math.min(totalPages - 1, page + 1);
    setPage(next);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.scrollWidth / promotions.length;
      scrollRef.current.scrollTo({ left: next * itemsPerPage * cardWidth, behavior: "smooth" });
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Kampanyalar</h2>

      <div className="relative">
        {/* Left arrow */}
        {page > 0 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {page < totalPages - 1 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promotions.map((promo) => (
            <Link
              key={promo.id}
              href={promo.link || "#"}
              className="snap-start shrink-0 w-[200px] sm:w-[240px] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:border-gray-300 transition-all group bg-white relative overflow-hidden"
            >
              {/* Badge row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {promo.badge.split("+").map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                      style={{ color: promo.bg_color, borderColor: promo.bg_color + "40" }}
                    >
                      {b.trim()}
                    </span>
                  ))}
                </div>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Title + discount label */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-black leading-tight"
                  style={{ color: promo.bg_color }}
                >
                  {promo.title}
                </h3>
                {promo.discount_label && (
                  <span
                    className="shrink-0 text-[10px] font-bold text-white px-2 py-1 rounded-lg -rotate-12 mt-1"
                    style={{ backgroundColor: promo.bg_color }}
                  >
                    {promo.discount_label}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                {promo.description}
              </p>

              {/* Valid until */}
              {promo.valid_until && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[11px] text-gray-400">
                    {formatDate(promo.valid_until)} tarihine kadar geçerli
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPage(i);
                  if (scrollRef.current) {
                    const cardWidth = scrollRef.current.scrollWidth / promotions.length;
                    scrollRef.current.scrollTo({ left: i * itemsPerPage * cardWidth, behavior: "smooth" });
                  }
                }}
                className={`h-2 rounded-full transition-all ${
                  i === page ? "w-6 bg-gray-800" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
