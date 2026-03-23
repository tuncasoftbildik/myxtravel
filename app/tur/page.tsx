"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface Tour {
  code: string;
  groupCode: string;
  name: string;
  shortDescription: string;
  logo: string | null;
  dayCount: number;
  nightCount: number;
  rating: number;
  tourType: number;
  withTransfer: boolean;
  departurePoint: { code: string; name: string; country: string } | null;
  categories: { code: string; names: Record<string, string> }[];
  price: {
    total: number;
    currency: string;
    base: number;
    discount: number;
  };
  dates: {
    tourCode: string;
    startDate: string;
    endDate: string;
    allotment: number;
    price: { total: number; currency: string };
  }[];
}

export default function TurPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <TurContent />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] pt-8 pb-10 sm:pt-10 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-8 bg-white/10 rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12">
          <LoadingSkeleton />
        </div>
      </main>
      <Footer />
    </>
  );
}

function TurContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const destination = searchParams.get("destination");

  useEffect(() => {
    if (!startDate || !endDate) {
      setError("Tarih bilgisi eksik");
      setLoading(false);
      return;
    }

    async function fetchTours() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tours/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate,
            endDate,
            searchType: 0,
            ...(destination ? { searchValues: [destination] } : {}),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Arama başarısız");
        setTours(data.tours);
        setCount(data.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, [startDate, endDate, destination]);

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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-14 sm:pt-10 sm:pb-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Tur Arama</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Tur Sonuçları</h1>
                {!loading && !error && (
                  <p className="text-sm text-white/50 mt-2">
                    <span className="text-white/80 font-semibold">{count}</span> tur bulundu
                    {destination && <> &middot; <span className="text-white/70">{destination}</span></>}
                    {startDate && endDate && (
                      <> &middot; {startDate} — {endDate}</>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl transition font-medium backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Yeni Arama
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12 sm:pb-16">
          {loading && <LoadingSkeleton />}

          {error && <ErrorCard message={error} onBack={() => router.push("/")} />}

          {!loading && !error && tours.length === 0 && (
            <EmptyState message="Bu tarihler için tur bulunamadı." onBack={() => router.push("/")} />
          )}

          {!loading && !error && tours.length > 0 && (
            <div className="grid gap-4 sm:gap-5">
              {tours.map((tour) => (
                <TourCard key={tour.code} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function TourCard({ tour }: { tour: Tour }) {
  const nextDate = tour.dates[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {tour.logo ? (
          <div className="sm:w-56 h-44 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
            <img
              src={tour.logo}
              alt={tour.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="sm:w-56 h-44 sm:h-auto bg-gradient-to-br from-brand-dark/5 to-brand-dark/10 flex-shrink-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-brand-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs bg-gradient-to-r from-brand-red/10 to-brand-red/5 text-brand-red px-2.5 py-1 rounded-lg font-semibold">
                {tour.dayCount} Gün / {tour.nightCount} Gece
              </span>
              {tour.withTransfer && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-medium">
                  Transfer Dahil
                </span>
              )}
              {tour.rating > 0 && (
                <span className="text-xs text-amber-600 font-semibold flex items-center gap-0.5">
                  <svg className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {(tour.rating / 10000).toFixed(1)}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-brand-dark transition-colors">
              {tour.name}
            </h3>

            {tour.shortDescription && (
              <p className="text-sm text-brand-gray/70 line-clamp-2 mb-3">
                {tour.shortDescription}
              </p>
            )}

            {tour.departurePoint?.name && (
              <p className="text-xs text-brand-gray/50 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Kalkış: {tour.departurePoint.name}
              </p>
            )}

            {tour.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tour.categories.slice(0, 3).map((c) => (
                  <span
                    key={c.code}
                    className="text-[11px] bg-brand-dark/5 text-brand-dark/60 px-2 py-0.5 rounded-md"
                  >
                    {c.names?.tr || c.names?.en || c.code}
                  </span>
                ))}
              </div>
            )}
          </div>

          {nextDate && (
            <p className="text-xs text-brand-gray/40 mt-3 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              İlk tarih: {nextDate.startDate?.split("T")[0]}
              {tour.dates.length > 1 && ` (+${tour.dates.length - 1} tarih daha)`}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="sm:w-48 p-4 sm:p-5 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 bg-gradient-to-b from-gray-50/50 to-gray-50">
          <div className="text-right">
            {tour.price.discount > 0 && (
              <p className="text-xs text-brand-gray/40 line-through">
                {tour.price.base.toLocaleString("tr-TR")} {tour.price.currency}
              </p>
            )}
            <p className="text-2xl sm:text-3xl font-bold text-brand-red">
              {tour.price.total.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-brand-gray/50 font-medium">{tour.price.currency} / kişi</p>
          </div>
          <Link
            href={`/tur/${tour.code}`}
            className="mt-0 sm:mt-4 px-6 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 hover:shadow-brand-red/30 text-center"
          >
            İncele
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-brand-red font-semibold mb-2">{message}</p>
      <button onClick={onBack} className="text-sm text-brand-gray/60 hover:text-brand-dark transition">
        Ana sayfaya dön
      </button>
    </div>
  );
}

function EmptyState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-gray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-brand-gray/60 text-lg mb-2">{message}</p>
      <button onClick={onBack} className="text-sm text-brand-red hover:text-red-700 font-medium transition">
        Farklı tarihlerle dene
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-56 h-44 sm:h-48 bg-gray-100" />
            <div className="flex-1 p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-lg w-28" />
                <div className="h-6 bg-gray-100 rounded-lg w-20" />
              </div>
              <div className="h-5 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="sm:w-48 p-5 bg-gray-50/50 flex flex-col items-end justify-center gap-3">
              <div className="h-8 bg-gray-100 rounded w-28" />
              <div className="h-10 bg-gray-100 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
