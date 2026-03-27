"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface EnrichedTour {
  id: number;
  name: string;
  nights: number;
  transport: string;
  transportationType: string;
  departureCity: string;
  departureStops: string;
  placesToVisitStr: string;
  visaFree: number;
  dayTour: number;
  outgoingTour: number;
  cruise: number;
  tourCode: string;
  overnightInfo: string;
  accommodationInfo: string;
  image: string | null;
  minPrice: number | null;
  currency: string | null;
  nextDepartureDate: string | null;
  [key: string]: any;
}

type TransportFilter = "all" | "bus" | "flight" | "ship";
type DurationFilter = "all" | "1-3" | "4-5" | "6-7" | "8+";

function getTransportCategory(t: EnrichedTour): "bus" | "flight" | "ship" {
  const raw = (t.transport || t.transportationType || "").toLowerCase();
  if (raw.includes("gemi") || raw.includes("cruise")) return "ship";
  if (raw.includes("otobüs") || raw.includes("otobüslü")) return "bus";
  return "flight";
}

export default function TurPage() {
  const [tours, setTours] = useState<EnrichedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [departureFilter, setDepartureFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState<TransportFilter>("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [visaFreeOnly, setVisaFreeOnly] = useState(false);
  const [cruiseOnly, setCruiseOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await fetch("/api/a2tours/enriched-list");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Turlar alınamadı");
        setTours(data.tours || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchTours();
  }, []);

  const departureCities = useMemo(() => {
    const counts = new Map<string, number>();
    tours.forEach((t) => {
      if (t.departureCity) counts.set(t.departureCity, (counts.get(t.departureCity) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [tours]);

  const filtered = useMemo(() => {
    let result = tours;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.placesToVisitStr?.toLowerCase().includes(q) ||
          t.departureCity?.toLowerCase().includes(q),
      );
    }

    if (departureFilter) {
      result = result.filter((t) => t.departureCity === departureFilter);
    }

    if (transportFilter !== "all") {
      result = result.filter((t) => getTransportCategory(t) === transportFilter);
    }

    if (durationFilter !== "all") {
      result = result.filter((t) => {
        const n = t.nights || 0;
        if (durationFilter === "1-3") return n >= 1 && n <= 3;
        if (durationFilter === "4-5") return n >= 4 && n <= 5;
        if (durationFilter === "6-7") return n >= 6 && n <= 7;
        if (durationFilter === "8+") return n >= 8;
        return true;
      });
    }

    if (visaFreeOnly) result = result.filter((t) => t.visaFree === 1);
    if (cruiseOnly) result = result.filter((t) => t.cruise === 1);

    // Already sorted by price from API, no need to re-sort
    return result;
  }, [tours, search, departureFilter, transportFilter, durationFilter, visaFreeOnly, cruiseOnly]);

  const hasActiveFilters = search || departureFilter || transportFilter !== "all" || durationFilter !== "all" || visaFreeOnly || cruiseOnly;

  function clearFilters() {
    setSearch("");
    setDepartureFilter("");
    setTransportFilter("all");
    setDurationFilter("all");
    setVisaFreeOnly(false);
    setCruiseOnly(false);
  }

  const transportCounts = useMemo(() => {
    const c = { bus: 0, flight: 0, ship: 0 };
    tours.forEach((t) => { c[getTransportCategory(t)]++; });
    return c;
  }, [tours]);

  const filterPanel = (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-brand-gray/60 mb-2 uppercase tracking-wide">
          Tur Ara
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tur adı, şehir, ülke..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
          />
        </div>
      </div>

      {/* Departure city */}
      <div>
        <label className="block text-xs font-semibold text-brand-gray/60 mb-2 uppercase tracking-wide">
          Kalkış Şehri
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setDepartureFilter("")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${!departureFilter ? "bg-brand-red/10 text-brand-red font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <span>Tümü</span>
            <span className="text-xs text-brand-gray/40">{tours.length}</span>
          </button>
          {departureCities.map(([city, count]) => (
            <button
              key={city}
              onClick={() => setDepartureFilter(departureFilter === city ? "" : city)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${departureFilter === city ? "bg-brand-red/10 text-brand-red font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{city}</span>
              <span className="text-xs text-brand-gray/40">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transport type */}
      <div>
        <label className="block text-xs font-semibold text-brand-gray/60 mb-2 uppercase tracking-wide">
          Ulaşım Tipi
        </label>
        <div className="space-y-1">
          {([
            { key: "all" as TransportFilter, label: "Tümü", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", count: tours.length },
            { key: "flight" as TransportFilter, label: "Uçak", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8", count: transportCounts.flight },
            { key: "bus" as TransportFilter, label: "Otobüs", icon: "M8 7h8m-8 4h8m-4-8v16m-4 0h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z", count: transportCounts.bus },
            { key: "ship" as TransportFilter, label: "Gemi", icon: "M3 17h1l2-3h12l2 3h1M5 17l-2 4h18l-2-4M12 3v10m-4-6l4-4 4 4", count: transportCounts.ship },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setTransportFilter(transportFilter === item.key ? "all" : item.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${transportFilter === item.key ? "bg-brand-red/10 text-brand-red font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.label}
              </span>
              <span className="text-xs text-brand-gray/40">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-semibold text-brand-gray/60 mb-2 uppercase tracking-wide">
          Süre
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { key: "all" as DurationFilter, label: "Tümü" },
            { key: "1-3" as DurationFilter, label: "1-3 Gece" },
            { key: "4-5" as DurationFilter, label: "4-5 Gece" },
            { key: "6-7" as DurationFilter, label: "6-7 Gece" },
            { key: "8+" as DurationFilter, label: "8+ Gece" },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setDurationFilter(durationFilter === item.key ? "all" : item.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition text-center ${durationFilter === item.key ? "bg-brand-red text-white shadow-sm shadow-brand-red/20" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <label className="block text-xs font-semibold text-brand-gray/60 mb-2 uppercase tracking-wide">
          Özellikler
        </label>
        <div className="space-y-2">
          <button
            onClick={() => setVisaFreeOnly(!visaFreeOnly)}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Vizesiz
            </span>
            <div className={`w-9 h-5 rounded-full transition relative ${visaFreeOnly ? "bg-brand-red" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${visaFreeOnly ? "translate-x-4" : ""}`} />
            </div>
          </button>
          <button
            onClick={() => setCruiseOnly(!cruiseOnly)}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17h1l2-3h12l2 3h1M5 17l-2 4h18l-2-4M12 3v10m-4-6l4-4 4 4" />
              </svg>
              Cruise
            </span>
            <div className={`w-9 h-5 rounded-full transition relative ${cruiseOnly ? "bg-brand-red" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${cruiseOnly ? "translate-x-4" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 text-sm text-brand-red hover:text-red-700 font-medium transition border border-brand-red/20 rounded-xl hover:bg-brand-red/5"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-20 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">Turlar</h1>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
              En popüler turları keşfedin, hayalinizdeki rotayı bulun
            </p>
          </div>
        </div>

        {/* Content with sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-12 sm:pb-16">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile filter toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <svg className="w-5 h-5 text-brand-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtreler
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-brand-red rounded-full" />
                  )}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileFiltersOpen && (
                <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-xl p-5">
                  {filterPanel}
                </div>
              )}
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4.5 h-4.5 text-brand-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtreler
                </h2>
                {filterPanel}
              </div>
            </div>

            {/* Tour list */}
            <div className="flex-1 min-w-0">
              {/* Result count */}
              {!loading && !error && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-brand-gray/50">
                    <span className="font-semibold text-gray-900">{filtered.length}</span> tur listeleniyor
                    {filtered.length !== tours.length && (
                      <span className="text-brand-gray/40"> / {tours.length}</span>
                    )}
                  </p>
                </div>
              )}

              {loading && <LoadingSkeleton />}

              {error && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-brand-red font-semibold mb-2">{error}</p>
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-gray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-brand-gray/60 text-lg">
                    {hasActiveFilters
                      ? "Filtrelere uygun tur bulunamadı."
                      : "Henüz tur bulunmuyor."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-brand-red hover:text-red-700 font-medium transition mt-2"
                    >
                      Filtreleri temizle
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && filtered.length > 0 && (
                <div className="grid gap-4 sm:gap-5">
                  {filtered.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── Tour Card (no lazy loading needed) ─────────────────────────────

function TourCard({ tour }: { tour: EnrichedTour }) {
  const nights = tour.nights || 0;
  const days = nights + 1;
  const transport = tour.transport || tour.transportationType || "";
  const places = tour.placesToVisitStr || "";
  const departure = tour.departureCity || "";

  return (
    <Link
      href={`/tur/${tour.id}`}
      className="block bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Tour image */}
        {tour.image ? (
          <div className="sm:w-52 h-40 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
            <img
              src={tour.image}
              alt={tour.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="sm:w-52 h-40 sm:h-auto bg-gradient-to-br from-brand-dark/5 to-brand-dark/10 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/5 via-transparent to-brand-red/5" />
            <svg className="w-12 h-12 text-brand-dark/15 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs bg-gradient-to-r from-brand-red/10 to-brand-red/5 text-brand-red px-2.5 py-1 rounded-lg font-semibold">
                {days} Gün / {nights} Gece
              </span>
              {transport && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                  {transport}
                </span>
              )}
              {tour.visaFree === 1 && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-medium">
                  Vizesiz
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-brand-dark transition-colors">
              {tour.name}
            </h3>

            {places && (
              <p className="text-sm text-brand-gray/70 line-clamp-2 mb-2">
                {places}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-1">
              {departure && (
                <p className="text-xs text-brand-gray/50 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Kalkış: {departure}
                </p>
              )}
              {tour.nextDepartureDate && (
                <p className="text-xs text-brand-gray/50 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(tour.nextDepartureDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="sm:w-44 p-4 sm:p-5 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 bg-gradient-to-b from-gray-50/50 to-gray-50">
          {tour.minPrice && (
            <div className="text-right mb-0 sm:mb-3">
              <p className="text-[10px] text-brand-gray/40 uppercase tracking-wide">kişi başı</p>
              <p className="text-2xl sm:text-3xl font-bold text-brand-red">
                {tour.minPrice.toLocaleString("tr-TR")}
              </p>
              <p className="text-xs text-brand-gray/50 font-medium">{tour.currency}</p>
            </div>
          )}
          <span className="px-6 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl group-hover:bg-red-700 transition shadow-sm shadow-brand-red/20 group-hover:shadow-brand-red/30 text-center">
            İncele
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
  } catch {
    return dateStr;
  }
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-52 h-40 sm:h-48 bg-gray-100" />
            <div className="flex-1 p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-lg w-28" />
                <div className="h-6 bg-gray-100 rounded-lg w-20" />
              </div>
              <div className="h-5 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="sm:w-44 p-5 bg-gray-50/50 flex flex-col items-end justify-center">
              <div className="h-10 bg-gray-100 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
