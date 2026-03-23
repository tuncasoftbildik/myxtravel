"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface Hotel {
  productCode: string;
  name: string;
  stars: number;
  thumbnail: string | null;
  address: string;
  location: { lat: number; lng: number } | null;
  city: string;
  country: string;
  boardType: string;
  boardName: string;
  searchKey: string;
  price: {
    total: number;
    currency: string;
    base: number;
    discount: number;
  };
}

export default function OtelPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <OtelContent />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] pt-8 pb-14">
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

function OtelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults") || "2";
  const destinationId = searchParams.get("destinationId");
  const destinationName = searchParams.get("destinationName");

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setError("Tarih bilgisi eksik");
      setLoading(false);
      return;
    }

    async function fetchHotels() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hotels/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkIn, checkOut, adults: Number(adults), ...(destinationId ? { destinationId } : {}) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Arama başarısız");
        setHotels(data.hotels);
        setCount(data.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [checkIn, checkOut, adults, destinationId]);

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
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Otel Arama</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {destinationName ? `${destinationName} Otelleri` : "Otel Sonuçları"}
                </h1>
                {!loading && !error && (
                  <p className="text-sm text-white/50 mt-2">
                    <span className="text-white/80 font-semibold">{count}</span> otel bulundu
                    {checkIn && checkOut && <> &middot; {checkIn} — {checkOut}</>}
                    <> &middot; {adults} yetişkin</>
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

          {!loading && !error && hotels.length === 0 && (
            <EmptyState message="Bu tarihler için otel bulunamadı." onBack={() => router.push("/")} />
          )}

          {!loading && !error && hotels.length > 0 && (
            <div className="grid gap-4 sm:gap-5">
              {hotels.map((h, i) => (
                <HotelCard key={h.productCode || i} hotel={h} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stars({ count }: { count: number }) {
  const n = Math.max(0, Math.min(5, count));
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-56 h-44 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
          {hotel.thumbnail ? (
            <img src={hotel.thumbnail} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-dark/5 to-brand-dark/10">
              <svg className="w-12 h-12 text-brand-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            {hotel.stars > 0 && <Stars count={hotel.stars} />}
            {hotel.boardName && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-medium">
                {hotel.boardName}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-brand-dark transition-colors">
            {hotel.name}
          </h3>

          {(hotel.city || hotel.country) && (
            <p className="text-sm text-brand-gray/60 mb-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {[hotel.city, hotel.country].filter(Boolean).join(", ")}
            </p>
          )}

          {hotel.address && (
            <p className="text-xs text-brand-gray/40 line-clamp-1">{hotel.address}</p>
          )}
        </div>

        <div className="sm:w-48 p-4 sm:p-5 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 bg-gradient-to-b from-gray-50/50 to-gray-50">
          <div className="text-right">
            {hotel.price.discount > 0 && (
              <p className="text-xs text-brand-gray/40 line-through">
                {hotel.price.base?.toLocaleString("tr-TR")} {hotel.price.currency}
              </p>
            )}
            <p className="text-2xl sm:text-3xl font-bold text-brand-red">
              {hotel.price.total?.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-brand-gray/50 font-medium">{hotel.price.currency} / gece</p>
          </div>
          <button className="mt-0 sm:mt-4 px-6 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 hover:shadow-brand-red/30">
            İncele
          </button>
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
      <button onClick={onBack} className="text-sm text-brand-gray/60 hover:text-brand-dark transition">Ana sayfaya dön</button>
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
      <button onClick={onBack} className="text-sm text-brand-red hover:text-red-700 font-medium transition">Farklı tarihlerle dene</button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-56 h-44 sm:h-48 bg-gray-100" />
            <div className="flex-1 p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-6 bg-gray-100 rounded-lg w-24" />
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
