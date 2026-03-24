"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const HotelMap = dynamic(() => import("@/components/hotel-map"), { ssr: false });

// Sandbox API destination IDs — production'da gerçek Türkiye destinasyonları ile değiştirilecek
const DESTINATIONS = [
  { label: "Alabama (US)", id: 16 },
  { label: "Rainsville (US)", id: 20 },
  { label: "Truro (CA)", id: 1000 },
  { label: "Antigonish (CA)", id: 1002 },
  { label: "Gulf Shores (US)", id: 1003 },
  { label: "Daphne (US)", id: 1007 },
];

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function defaultDates() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkout = new Date();
  checkout.setDate(checkout.getDate() + 3);
  return { checkIn: formatDate(tomorrow), checkOut: formatDate(checkout) };
}

function toInputDate(ddmmyyyy: string) {
  const [d, m, y] = ddmmyyyy.split(".");
  return `${y}-${m}-${d}`;
}

function fromInputDate(yyyy_mm_dd: string) {
  const [y, m, d] = yyyy_mm_dd.split("-");
  return `${d}.${m}.${y}`;
}


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

  const defaults = useMemo(() => defaultDates(), []);
  const checkIn = searchParams.get("checkIn") || defaults.checkIn;
  const checkOut = searchParams.get("checkOut") || defaults.checkOut;
  const adults = searchParams.get("adults") || "2";
  const destinationId = searchParams.get("destinationId");
  const destinationName = searchParams.get("destinationName");

  // Search form state (inline in sidebar)
  const [formDest, setFormDest] = useState(
    destinationId ? String(DESTINATIONS.findIndex((d) => String(d.id) === destinationId)) : ""
  );
  const [formCheckIn, setFormCheckIn] = useState(toInputDate(checkIn));
  const [formCheckOut, setFormCheckOut] = useState(toInputDate(checkOut));
  const [formAdults, setFormAdults] = useState(adults);
  const [searchLoading, setSearchLoading] = useState(false);

  // Filtreler
  const [starFilter, setStarFilter] = useState<number[]>([]);
  const [boardFilter, setBoardFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);

  const handleMapHotelClick = useCallback((code: string) => {
    const el = document.getElementById(`hotel-${code}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
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
        setSearchLoading(false);
      }
    }

    fetchHotels();
  }, [checkIn, checkOut, adults, destinationId]);

  function handleSearch() {
    if (!formCheckIn || !formCheckOut) return;
    setSearchLoading(true);
    const params = new URLSearchParams({
      checkIn: fromInputDate(formCheckIn),
      checkOut: fromInputDate(formCheckOut),
      adults: formAdults,
    });
    if (formDest) {
      const dest = DESTINATIONS[Number(formDest)];
      params.set("destinationId", String(dest.id));
      params.set("destinationName", dest.label);
    }
    router.push(`/otel?${params.toString()}`);
  }

  // Filtrelenmiş ve sıralanmış oteller
  const filtered = hotels.filter((h) => {
    if (starFilter.length > 0 && !starFilter.includes(h.stars)) return false;
    if (boardFilter.length > 0 && !boardFilter.includes(h.boardType)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price.total - b.price.total;
    if (sortBy === "price-desc") return b.price.total - a.price.total;
    if (sortBy === "stars") return b.stars - a.stars;
    return 0;
  });

  const boardTypes = [...new Set(hotels.map((h) => h.boardType).filter(Boolean))];
  const boardNames: Record<string, string> = {};
  hotels.forEach((h) => { if (h.boardType && h.boardName) boardNames[h.boardType] = h.boardName; });

  function toggleStar(s: number) {
    setStarFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }
  function toggleBoard(b: string) {
    setBoardFilter((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);
  }

  const nightCount = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut.split(".").reverse().join("-")).getTime() - new Date(checkIn.split(".").reverse().join("-")).getTime()) / 86400000)) : 1;

  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-[#f5f0e8] min-h-screen">
        {/* Mobile filter/sort bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtrele
            {(starFilter.length > 0 || boardFilter.length > 0) && (
              <span className="w-5 h-5 bg-brand-red text-white rounded-full text-xs flex items-center justify-center">{starFilter.length + boardFilter.length}</span>
            )}
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-red/30">
            <option value="popular">Popülerlik</option>
            <option value="price-asc">Fiyat (Düşükten)</option>
            <option value="price-desc">Fiyat (Yüksekten)</option>
            <option value="stars">Yıldız Sayısı</option>
          </select>
        </div>

        {/* 3-column layout */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* LEFT SIDEBAR — always visible on desktop, overlay on mobile */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          )}
          <aside className={`
            ${showMobileFilters
              ? "fixed right-0 top-0 h-full w-80 z-50 bg-white shadow-2xl overflow-y-auto lg:relative lg:shadow-none"
              : "hidden lg:block"
            }
            lg:w-[260px] shrink-0 bg-white lg:border-r border-gray-200 overflow-y-auto
          `}>
            {/* Mobile close button */}
            {showMobileFilters && (
              <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h3 className="font-bold text-gray-900">Filtrele ve Sirala</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            <div className="p-4 space-y-4">
              {/* Search info summary */}
              <div className="bg-brand-dark rounded-xl p-3.5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <span className="text-sm font-semibold truncate">{destinationName || "Tum Bolge"}</span>
                </div>
                <div className="text-xs text-white/60 space-y-0.5">
                  <p>{checkIn} - {checkOut} ({nightCount} gece)</p>
                  <p>{adults} yetiskin</p>
                </div>
                {!loading && !error && (
                  <p className="text-xs text-white/50 mt-2 pt-2 border-t border-white/10">{sorted.length} otel bulundu</p>
                )}
              </div>

              {/* Map/List toggle */}
              <div className="hidden lg:flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setShowMap(false)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition ${!showMap ? "bg-brand-dark text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  Liste Gor.
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition ${showMap ? "bg-brand-dark text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  Harita Gor.
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="border-b border-gray-100 pb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Siralama olcutu</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-gray-50">
                  <option value="popular">Populerlik</option>
                  <option value="price-asc">Fiyat (Dusukten Yuksege)</option>
                  <option value="price-desc">Fiyat (Yuksekten Dusuge)</option>
                  <option value="stars">Yildiz Sayisi</option>
                </select>
              </div>

              {/* Hotel name search — search form */}
              <div className="border-b border-gray-100 pb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Otel Ara</label>
                <div className="space-y-2.5">
                  <select value={formDest} onChange={(e) => setFormDest(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-gray-50">
                    <option value="">Tum bolgeler</option>
                    {DESTINATIONS.map((d, i) => <option key={d.id} value={i}>{d.label}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input type="date" value={formCheckIn} onChange={(e) => setFormCheckIn(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-gray-50" />
                    <input type="date" value={formCheckOut} onChange={(e) => setFormCheckOut(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-gray-50" />
                  </div>
                  <select value={formAdults} onChange={(e) => setFormAdults(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-gray-50">
                    {["1", "2", "3", "4"].map((n) => <option key={n} value={n}>{n} Yetiskin</option>)}
                  </select>
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading || !formCheckIn || !formCheckOut}
                    className="w-full py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? "Araniyor..." : "Ara"}
                  </button>
                </div>
              </div>

              {/* Meal plan / board filter */}
              {boardTypes.length > 0 && (
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pansiyon Tipi</h3>
                  <div className="space-y-2">
                    {boardTypes.map((bt) => {
                      const c = hotels.filter((h) => h.boardType === bt).length;
                      return (
                        <label key={bt} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={boardFilter.includes(bt)} onChange={() => toggleBoard(bt)} className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red/30" />
                          <span className="text-sm text-gray-700 flex-1">{boardNames[bt] || bt}</span>
                          <span className="text-xs text-gray-400">{c}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Star rating filter */}
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Yildiz Sayisi</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const c = hotels.filter((h) => h.stars === s).length;
                    if (c === 0) return null;
                    return (
                      <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" checked={starFilter.includes(s)} onChange={() => toggleStar(s)} className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red/30" />
                        <Stars count={s} />
                        <span className="text-xs text-gray-400 ml-auto">{c}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Clear filters */}
              {(starFilter.length > 0 || boardFilter.length > 0) && (
                <button onClick={() => { setStarFilter([]); setBoardFilter([]); }} className="w-full text-xs text-brand-red font-medium hover:text-red-700 transition py-2">
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </aside>

          {/* CENTER — Hotel cards */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="p-4 lg:p-5">
              {/* Active filter tags */}
              {(starFilter.length > 0 || boardFilter.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {starFilter.map((s) => (
                    <button key={s} onClick={() => toggleStar(s)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-dark/10 text-brand-dark text-xs font-medium rounded-full hover:bg-brand-dark/20 transition">
                      {s} Yildiz <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  ))}
                  {boardFilter.map((b) => (
                    <button key={b} onClick={() => toggleBoard(b)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-dark/10 text-brand-dark text-xs font-medium rounded-full hover:bg-brand-dark/20 transition">
                      {boardNames[b] || b} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  ))}
                </div>
              )}

              {/* Results header */}
              <div className="mb-4">
                <h1 className="text-lg font-bold text-gray-900">
                  {destinationName ? `${destinationName}: ` : ""}{!loading && !error ? `${sorted.length} otel bulundu` : "Oteller aranıyor..."}
                </h1>
              </div>

              {loading && <LoadingSkeleton />}
              {error && <ErrorCard message={error} onBack={() => router.push("/otel")} />}
              {!loading && !error && sorted.length === 0 && (
                <EmptyState message={hotels.length > 0 ? "Filtrelere uygun otel bulunamadı." : "Bu tarihler icin otel bulunamadı."} onBack={() => { setStarFilter([]); setBoardFilter([]); }} />
              )}
              {!loading && !error && sorted.length > 0 && (
                <div className="space-y-4">
                  {sorted.map((h, i) => (
                    <div
                      key={h.productCode || i}
                      id={`hotel-${h.productCode}`}
                      onMouseEnter={() => setHoveredHotel(h.productCode)}
                      onMouseLeave={() => setHoveredHotel(null)}
                    >
                      <HotelCard hotel={h} nights={nightCount} adults={Number(adults)} checkIn={checkIn} checkOut={checkOut} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Sticky Map */}
          {showMap && !loading && sorted.length > 0 && (
            <div className="hidden lg:block lg:w-[35%] shrink-0 sticky top-0 h-[calc(100vh-64px)]">
              <HotelMap hotels={sorted} hoveredHotel={hoveredHotel} onHotelClick={handleMapHotelClick} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

/* ───────────────────────── Result Components ───────────────────────── */

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

function HotelCard({ hotel, nights, adults, checkIn, checkOut }: { hotel: Hotel; nights: number; adults: number; checkIn: string; checkOut: string }) {
  const ratingScore = Math.min(10, (hotel.stars * 2) + (hotel.price.discount > 0 ? 0.5 : 0));
  const ratingLabel = ratingScore >= 9 ? "Muhtesem" : ratingScore >= 8 ? "Cok Iyi" : ratingScore >= 7 ? "Iyi" : "Hos";

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* LEFT — Photo */}
        <div className="sm:w-[200px] h-48 sm:h-auto shrink-0 bg-gray-100 overflow-hidden relative">
          {hotel.thumbnail ? (
            <img src={hotel.thumbnail} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-dark/5 to-brand-dark/10">
              <svg className="w-10 h-10 text-brand-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          {/* Heart / save icon */}
          <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-sm">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          {/* Photo count badge */}
          {hotel.thumbnail && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              1/8
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top section: name, location, rating */}
          <div className="p-3 sm:p-4 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* Stars */}
                {hotel.stars > 0 && (
                  <div className="mb-1">
                    <Stars count={hotel.stars} />
                  </div>
                )}
                {/* Hotel name as blue link */}
                <a
                  href={`/otel/${hotel.productCode}?searchKey=${encodeURIComponent(hotel.searchKey)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}&nights=${nights}`}
                  className="text-[15px] font-bold text-blue-700 hover:text-blue-800 line-clamp-2 leading-snug mb-1 transition-colors block"
                >
                  {hotel.name}
                </a>
                {/* Location */}
                {(hotel.city || hotel.country) && (
                  <p className="text-xs text-blue-600 flex items-center gap-1 mb-0.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    <span className="underline cursor-pointer">{[hotel.city, hotel.country].filter(Boolean).join(", ")}</span>
                  </p>
                )}
                {hotel.address && (
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{hotel.address}</p>
                )}
              </div>

              {/* Rating badge */}
              <div className="shrink-0 flex items-start gap-1.5 mt-0.5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{ratingLabel}</p>
                  <p className="text-[10px] text-gray-400">Degerlendirme</p>
                </div>
                <div className="w-9 h-9 rounded-tl-lg rounded-tr-lg rounded-br-lg bg-brand-dark text-white flex items-center justify-center text-sm font-bold">
                  {ratingScore.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Middle: room type / amenity icons row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Amenity icons — generic since API doesn't provide amenity data */}
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" /></svg>
                WiFi
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>
                Oda Servisi
              </span>
            </div>
          </div>

          {/* Bottom section: meal info, price, CTA */}
          <div className="border-t border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            {/* Meal & cancellation tags */}
            <div className="flex flex-wrap gap-1.5">
              {hotel.boardName && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {hotel.boardName}
                </span>
              )}
              {hotel.price.discount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  %{Math.round((hotel.price.discount / hotel.price.base) * 100)} indirim
                </span>
              )}
            </div>

            {/* Price + Button */}
            <div className="flex items-end gap-3 sm:flex-col sm:items-end sm:gap-1">
              <div className="text-right">
                <p className="text-[11px] text-gray-500">{nights} gece, {adults} misafir</p>
                {hotel.price.discount > 0 && (
                  <p className="text-xs text-gray-400 line-through">{hotel.price.currency} {hotel.price.base?.toLocaleString("tr-TR")}</p>
                )}
                <p className="text-xl font-bold text-gray-900">
                  {hotel.price.currency} {hotel.price.total?.toLocaleString("tr-TR")}
                </p>
                <p className="text-[10px] text-gray-400">Vergiler ve ucretler dahil</p>
              </div>
              <a
                href={`/otel/${hotel.productCode}?searchKey=${encodeURIComponent(hotel.searchKey)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${adults}&nights=${nights}`}
                className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition whitespace-nowrap shadow-sm inline-block text-center"
              >
                Tüm odaları gör
              </a>
            </div>
          </div>
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
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-[200px] h-48 sm:h-52 bg-gray-100" />
            <div className="flex-1 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="w-9 h-9 bg-gray-100 rounded-lg" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className="h-6 bg-gray-100 rounded w-24" />
                <div className="h-6 bg-gray-100 rounded w-20" />
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                <div className="h-6 bg-gray-100 rounded w-28" />
                <div className="h-10 bg-gray-100 rounded-lg w-32" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
