"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ExpediaBanner } from "@/components/expedia-banner";

const AIRPORTS = [
  { code: "IST", label: "İstanbul (IST)" },
  { code: "SAW", label: "İstanbul Sabiha Gökçen (SAW)" },
  { code: "ESB", label: "Ankara Esenboğa (ESB)" },
  { code: "AYT", label: "Antalya (AYT)" },
  { code: "ADB", label: "İzmir Adnan Menderes (ADB)" },
  { code: "DLM", label: "Dalaman (DLM)" },
  { code: "TZX", label: "Trabzon (TZX)" },
  { code: "BJV", label: "Bodrum Milas (BJV)" },
  { code: "GZT", label: "Gaziantep (GZT)" },
  { code: "VAN", label: "Van (VAN)" },
  { code: "LHR", label: "Londra Heathrow (LHR)" },
  { code: "CDG", label: "Paris Charles de Gaulle (CDG)" },
  { code: "FRA", label: "Frankfurt (FRA)" },
  { code: "AMS", label: "Amsterdam (AMS)" },
  { code: "JFK", label: "New York JFK (JFK)" },
  { code: "DXB", label: "Dubai (DXB)" },
];

const POPULAR_ROUTES = [
  { from: "IST", to: "AYT", fromLabel: "İstanbul", toLabel: "Antalya", gradient: "from-orange-400 to-rose-500" },
  { from: "IST", to: "ADB", fromLabel: "İstanbul", toLabel: "İzmir", gradient: "from-emerald-400 to-teal-500" },
  { from: "ESB", to: "IST", fromLabel: "Ankara", toLabel: "İstanbul", gradient: "from-indigo-500 to-purple-600" },
  { from: "IST", to: "TZX", fromLabel: "İstanbul", toLabel: "Trabzon", gradient: "from-sky-400 to-indigo-500" },
  { from: "IST", to: "BJV", fromLabel: "İstanbul", toLabel: "Bodrum", gradient: "from-cyan-400 to-blue-500" },
  { from: "AYT", to: "IST", fromLabel: "Antalya", toLabel: "İstanbul", gradient: "from-amber-400 to-orange-500" },
];

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

  const hasSearchParams = from && to && departDate;

  useEffect(() => {
    if (!hasSearchParams) {
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
  }, [from, to, departDate, returnDate, tripType, passengers, hasSearchParams]);

  // Landing page when no search params
  if (!hasSearchParams) {
    return <UcusLandingPage />;
  }

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
                    <>{fromName} <span className="text-white/40 mx-2">&rarr;</span> {toName}</>
                  ) : (
                    "Uçuş Sonuçları"
                  )}
                </h1>
                {loading ? (
                  <p className="text-sm text-white/50 mt-2">Uçuşlar aranıyor...</p>
                ) : !error && (
                  <p className="text-sm text-white/50 mt-2">
                    <span className="text-white/80 font-semibold">{count}</span> uçuş bulundu
                    {departDate && <> &middot; {departDate}</>}
                    {returnDate && <> — {returnDate}</>}
                    <> &middot; {passengers} yolcu</>
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push("/ucus")}
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

          {error && <ErrorCard message={error} onBack={() => router.push("/ucus")} />}

          {!loading && !error && flights.length === 0 && (
            <EmptyState message="Bu güzergah için uçuş bulunamadı." onBack={() => router.push("/ucus")} />
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

/* ───────────────────────── Landing Page ───────────────────────── */

function UcusLandingPage() {
  const router = useRouter();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [searchLoading, setSearchLoading] = useState(false);

  function handleSearch() {
    if (!from || !to || !departDate) return;
    if (tripType === "roundtrip" && !returnDate) return;
    setSearchLoading(true);

    const [yD, mD, dD] = departDate.split("-");
    const params = new URLSearchParams({
      from,
      to,
      departDate: `${dD}.${mD}.${yD}`,
      tripType,
      passengers,
    });

    if (tripType === "roundtrip" && returnDate) {
      const [yR, mR, dR] = returnDate.split("-");
      params.set("returnDate", `${dR}.${mR}.${yR}`);
    }

    const fromAirport = AIRPORTS.find((a) => a.code === from);
    const toAirport = AIRPORTS.find((a) => a.code === to);
    if (fromAirport) params.set("fromName", fromAirport.label);
    if (toAirport) params.set("toName", toAirport.label);

    router.push(`/ucus?${params.toString()}`);
  }

  function swapAirports() {
    setFrom(to);
    setTo(from);
  }

  function handleRouteClick(route: typeof POPULAR_ROUTES[number]) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [yD, mD, dD] = [tomorrow.getFullYear(), String(tomorrow.getMonth() + 1).padStart(2, "0"), String(tomorrow.getDate()).padStart(2, "0")];

    const fromAirport = AIRPORTS.find((a) => a.code === route.from);
    const toAirport = AIRPORTS.find((a) => a.code === route.to);

    const params = new URLSearchParams({
      from: route.from,
      to: route.to,
      departDate: `${dD}.${mD}.${yD}`,
      tripType: "oneway",
      passengers: "1",
    });
    if (fromAirport) params.set("fromName", fromAirport.label);
    if (toAirport) params.set("toName", toAirport.label);

    router.push(`/ucus?${params.toString()}`);
  }

  const canSearch = from && to && departDate && (tripType === "oneway" || returnDate);

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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">Uçak Bileti</h1>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
              Yüzlerce havayolunu karşılaştır, en uygun bileti bul
            </p>
          </div>
        </div>

        {/* Search form card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-black/5 p-5 sm:p-7">
            {/* Trip type */}
            <div className="flex gap-4 sm:gap-6 text-sm mb-5">
              {[
                { value: "roundtrip" as const, label: "Gidiş - Dönüş" },
                { value: "oneway" as const, label: "Tek Yön" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                      tripType === opt.value ? "border-brand-red" : "border-gray-300 group-hover:border-gray-400"
                    }`}
                  >
                    {tripType === opt.value && <span className="w-2 h-2 rounded-full bg-brand-red" />}
                  </span>
                  <input type="radio" name="trip" className="sr-only" checked={tripType === opt.value} onChange={() => setTripType(opt.value)} />
                  <span className={tripType === opt.value ? "text-gray-800 font-medium" : "text-gray-500"}>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Fields */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* From */}
              <div className="flex-[2]">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Nereden</label>
                <div className="relative">
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full appearance-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition cursor-pointer"
                  >
                    <option value="">Havalimanı seçin</option>
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>{a.label}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Swap button */}
              <button
                type="button"
                onClick={swapAirports}
                className="hidden md:flex self-end mb-2 w-10 h-10 rounded-full border-2 border-gray-200 items-center justify-center hover:border-brand-red hover:text-brand-red text-gray-400 transition shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              {/* To */}
              <div className="flex-[2]">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Nereye</label>
                <div className="relative">
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full appearance-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition cursor-pointer"
                  >
                    <option value="">Havalimanı seçin</option>
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>{a.label}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Depart date */}
              <div className="flex-[1.2]">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Gidiş</label>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                />
              </div>

              {/* Return date */}
              {tripType === "roundtrip" && (
                <div className="flex-[1.2]">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Dönüş</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                  />
                </div>
              )}

              {/* Passengers */}
              <div className={`flex-[0.8] ${tripType === "oneway" ? "flex-[1.2]" : ""}`}>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">Yolcu</label>
                <div className="relative">
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full appearance-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition cursor-pointer"
                  >
                    {["1", "2", "3", "4", "5", "6"].map((n) => (
                      <option key={n} value={n}>{n} Yolcu</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSearch}
                disabled={searchLoading || !canSearch}
                className="w-full sm:w-auto px-10 py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {searchLoading ? "Aranıyor..." : "Uçuş Ara"}
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Check-in Yapın",
                desc: "Online check-in'le zamandan tasarruf edebilirsiniz",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "#10b981",
              },
              {
                title: "Uçuş Sorgulayın",
                desc: "PNR no ile uçuş detaylarını görüntüleyebilirsiniz",
                icon: "M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
                color: "#6366f1",
                fill: true,
              },
              {
                title: "Bilet İşlemlerine Ulaşın",
                desc: "İptal/değişim işlemlerini kolaylıkla yapabilirsiniz",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                color: "#f59e0b",
              },
            ].map((item) => (
              <button
                key={item.title}
                className="flex items-start gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition text-left"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                  <svg className="w-5 h-5" style={{ color: item.color }} fill={item.fill ? "currentColor" : "none"} stroke={item.fill ? "none" : "currentColor"} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular airlines */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">En Çok Tercih Edilen Havayolları</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Turkish Airlines", logo: "/airlines/thy.png" },
              { name: "Pegasus", logo: "/airlines/pegasus.png" },
              { name: "SunExpress", logo: "/airlines/sunexpress.png" },
              { name: "AnadoluJet", logo: "/airlines/anadolujet.png" },
              { name: "Corendon", logo: "/airlines/corendon.png" },
              { name: "AtlasGlobal", logo: "/airlines/atlasglobal.png" },
            ].map((airline) => (
              <button
                key={airline.name}
                className="flex items-center justify-center h-20 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition px-4"
              >
                <img src={airline.logo} alt={airline.name} className="h-8 sm:h-10 object-contain max-w-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Ucuz Uçak Bileti Alın</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "IATA üyeliği",
                desc: "Uluslararası güvence sağlayan IATA üyeliği",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                color: "#C41E3A",
              },
              {
                title: "Güvenli ödeme",
                desc: "Tüm işlemlerinizde güvenli ödeme ayrıcalığı",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                color: "#C41E3A",
              },
              {
                title: "7/24 müşteri desteği",
                desc: "7/24 ulaşabileceğiniz ödüllü müşteri hizmetleri desteği",
                icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
                color: "#C41E3A",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-5 bg-red-50/50 rounded-2xl border border-red-100/50"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Expedia Banner */}
        <ExpediaBanner />

        {/* spacer */}
        <div className="pb-12 sm:pb-16" />
      </main>
      <Footer />
    </>
  );
}

/* ───────────────────────── Result Components ───────────────────────── */

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
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">Uçuşlar aranıyor...</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-red/60 via-brand-red to-brand-red/60 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ animation: `pulse 1.5s ease-in-out infinite`, animationDelay: `${i * 200}ms` }}>
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
