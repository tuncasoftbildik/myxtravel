"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface FlightSegment {
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  flightNumber: string;
  departureCode: string;
  departureName: string;
  arrivalCode: string;
  arrivalName: string;
  departureDate: string;
  arrivalDate: string;
  duration: number;
  equipment: string;
}

interface FlightLeg {
  departureCode: string;
  departureName: string;
  arrivalCode: string;
  arrivalName: string;
  departureDate: string;
  arrivalDate: string;
  segments: FlightSegment[];
}

interface Flight {
  key: string;
  fareTitle: string;
  legs: FlightLeg[];
  price: {
    total: number;
    currency: string;
    base: number;
    tax: number;
    discount: number;
  };
  isCharter: boolean;
}

export default function UcusPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <UcusContent />
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

function UcusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const departDate = searchParams.get("departDate");
  const returnDate = searchParams.get("returnDate");
  const tripType = searchParams.get("tripType") || "oneway";
  const passengers = searchParams.get("passengers") || "1";
  const fromName = searchParams.get("fromName");
  const toName = searchParams.get("toName");

  useEffect(() => {
    if (!from || !to || !departDate) {
      setError("Uçuş bilgileri eksik");
      setLoading(false);
      return;
    }

    async function fetchFlights() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from, to, departDate, returnDate, tripType, passengers: Number(passengers) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Arama başarısız");
        setFlights(data.flights);
        setCount(data.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [from, to, departDate, returnDate, tripType, passengers]);

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
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Uçuş Arama</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {fromName && toName ? (
                    <>{fromName} <span className="text-white/40 mx-2">→</span> {toName}</>
                  ) : (
                    "Uçuş Sonuçları"
                  )}
                </h1>
                {!loading && !error && (
                  <p className="text-sm text-white/50 mt-2">
                    <span className="text-white/80 font-semibold">{count}</span> uçuş bulundu
                    {departDate && <> &middot; {departDate}</>}
                    {returnDate && <> — {returnDate}</>}
                    <> &middot; {passengers} yolcu</>
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

          {!loading && !error && flights.length === 0 && (
            <EmptyState message="Bu güzergah için uçuş bulunamadı." onBack={() => router.push("/")} />
          )}

          {!loading && !error && flights.length > 0 && (
            <div className="grid gap-4 sm:gap-5">
              {flights.map((flight, i) => (
                <FlightCard key={flight.key || i} flight={flight} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return "--:--";
  try {
    return new Date(dateStr).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

function formatDuration(mins: number | undefined): string {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}s ${m}dk` : `${m}dk`;
}

function FlightCard({ flight }: { flight: Flight }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* Legs */}
        <div className="flex-1 p-4 sm:p-5">
          {flight.legs.map((leg, li) => {
            const firstSeg = leg.segments[0];
            const totalDuration = leg.segments.reduce((sum, s) => sum + (s.duration || 0), 0);

            return (
              <div key={li} className={li > 0 ? "mt-4 pt-4 border-t border-gray-100" : ""}>
                {/* Airline info */}
                <div className="flex items-center gap-2.5 mb-3">
                  {firstSeg?.airlineLogo && (
                    <img src={firstSeg.airlineLogo} alt={firstSeg.airline} className="h-5 object-contain" />
                  )}
                  <span className="text-sm font-semibold text-gray-800">{firstSeg?.airline}</span>
                  <span className="text-xs text-brand-gray/40 font-mono">{firstSeg?.flightNumber}</span>
                  {firstSeg?.equipment && (
                    <span className="text-[11px] text-brand-gray/30 hidden sm:inline">{firstSeg.equipment}</span>
                  )}
                  {flight.fareTitle && (
                    <span className="text-xs bg-brand-dark/5 text-brand-dark/70 px-2.5 py-0.5 rounded-lg font-semibold ml-auto">
                      {flight.fareTitle}
                    </span>
                  )}
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="text-center min-w-[55px] sm:min-w-[70px]">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {formatTime(leg.departureDate)}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-brand-dark/70">{leg.departureCode}</p>
                    <p className="text-[11px] text-brand-gray/40 hidden sm:block">{leg.departureName}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[11px] text-brand-gray/50 mb-1 font-medium">{formatDuration(totalDuration)}</p>
                    <div className="w-full flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full border-2 border-brand-red" />
                      <div className="flex-1 h-px bg-gradient-to-r from-brand-red/40 via-brand-gray/20 to-brand-red/40 relative">
                        {leg.segments.length > 1 && (
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] text-orange-600 font-semibold">
                            {leg.segments.length - 1} aktarma
                          </span>
                        )}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-brand-red" />
                    </div>
                    <p className="text-[11px] text-brand-gray/40 mt-1">
                      {leg.segments.length === 1 ? "Direkt Uçuş" : `${leg.segments.length} segment`}
                    </p>
                  </div>

                  <div className="text-center min-w-[55px] sm:min-w-[70px]">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {formatTime(leg.arrivalDate)}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-brand-dark/70">{leg.arrivalCode}</p>
                    <p className="text-[11px] text-brand-gray/40 hidden sm:block">{leg.arrivalName}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price */}
        <div className="sm:w-52 p-4 sm:p-5 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 bg-gradient-to-b from-gray-50/50 to-gray-50">
          <div className="text-right">
            {flight.price.discount > 0 && (
              <p className="text-xs text-brand-gray/40 line-through">
                {flight.price.base?.toLocaleString("tr-TR")} {flight.price.currency}
              </p>
            )}
            <p className="text-2xl sm:text-3xl font-bold text-brand-red">
              {flight.price.total?.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-brand-gray/50 font-medium">{flight.price.currency} / kişi</p>
            {flight.price.tax > 0 && (
              <p className="text-[11px] text-brand-gray/30 mt-0.5">Vergiler dahil</p>
            )}
          </div>
          <button className="mt-0 sm:mt-4 px-6 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 hover:shadow-brand-red/30">
            Seç
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
            <div className="flex-1 p-5 space-y-4">
              <div className="flex gap-2">
                <div className="h-5 bg-gray-100 rounded w-20" />
                <div className="h-5 bg-gray-100 rounded w-32" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 bg-gray-100 rounded w-16" />
                <div className="flex-1 h-px bg-gray-100" />
                <div className="h-10 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="sm:w-52 p-5 bg-gray-50/50 flex flex-col items-end justify-center gap-3">
              <div className="h-8 bg-gray-100 rounded w-28" />
              <div className="h-10 bg-gray-100 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
