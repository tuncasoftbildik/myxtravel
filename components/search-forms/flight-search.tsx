"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export function FlightSearch() {
  const router = useRouter();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    if (!from || !to || !departDate) return;
    if (tripType === "roundtrip" && !returnDate) return;
    setLoading(true);

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

    // Add labels for display
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

  const canSearch = from && to && departDate && (tripType === "oneway" || returnDate);

  return (
    <div className="space-y-5">
      {/* Trip type */}
      <div className="flex gap-4 sm:gap-6 text-sm">
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
        <AirportSelect label="Nereden" value={from} onChange={setFrom} className="flex-[2]" />

        <button
          type="button"
          onClick={swapAirports}
          className="hidden md:flex self-end mb-2 w-10 h-10 rounded-full border-2 border-gray-200 items-center justify-center hover:border-brand-red hover:text-brand-red text-gray-400 transition shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <AirportSelect label="Nereye" value={to} onChange={setTo} className="flex-[2]" />

        <DateField label="Gidiş" value={departDate} onChange={setDepartDate} className="flex-[1.2]" />

        {tripType === "roundtrip" && (
          <DateField label="Dönüş" value={returnDate} onChange={setReturnDate} className="flex-[1.2]" />
        )}

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

      {/* Button */}
      <div>
        <button
          onClick={handleSearch}
          disabled={loading || !canSearch}
          className="w-full sm:w-auto sm:float-right px-10 py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Aranıyor..." : "Uçuş Ara"}
        </button>
      </div>
    </div>
  );
}

function AirportSelect({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  );
}

function DateField({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
      />
    </div>
  );
}
