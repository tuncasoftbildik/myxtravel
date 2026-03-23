"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DESTINATIONS = [
  { label: "Antalya", id: 71 },
  { label: "İstanbul", id: 72 },
  { label: "Muğla (Bodrum / Fethiye)", id: 48 },
  { label: "İzmir (Çeşme)", id: 35 },
  { label: "Aydın (Kuşadası)", id: 9 },
  { label: "Ankara", id: 6 },
  { label: "Nevşehir (Kapadokya)", id: 50 },
  { label: "Trabzon", id: 61 },
];

export function HotelSearch() {
  const router = useRouter();
  const [destinationIdx, setDestinationIdx] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("2");
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    if (!checkIn || !checkOut) return;
    setLoading(true);

    const [yIn, mIn, dIn] = checkIn.split("-");
    const [yOut, mOut, dOut] = checkOut.split("-");

    const params = new URLSearchParams({
      checkIn: `${dIn}.${mIn}.${yIn}`,
      checkOut: `${dOut}.${mOut}.${yOut}`,
      adults,
    });
    if (destinationIdx) {
      const dest = DESTINATIONS[Number(destinationIdx)];
      params.set("destinationId", String(dest.id));
      params.set("destinationName", dest.label);
    }

    router.push(`/otel?${params.toString()}`);
  }

  const canSearch = checkIn && checkOut;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-[2.5]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">
            Nereye
          </label>
          <div className="relative">
            <select
              value={destinationIdx}
              onChange={(e) => setDestinationIdx(e.target.value)}
              className="w-full appearance-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition cursor-pointer"
            >
              <option value="">Tüm bölgeler</option>
              {DESTINATIONS.map((d, i) => (
                <option key={d.id} value={i}>
                  {d.label}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <Field label="Giriş" type="date" value={checkIn} onChange={setCheckIn} className="flex-1" />
        <Field label="Çıkış" type="date" value={checkOut} onChange={setCheckOut} className="flex-1" />
        <div className="flex-[0.8]">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">
            Misafir
          </label>
          <div className="relative">
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              className="w-full appearance-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition cursor-pointer"
            >
              {["1", "2", "3", "4"].map((n) => (
                <option key={n} value={n}>
                  {n} Yetişkin
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={handleSearch}
          disabled={loading || !canSearch}
          className="w-full sm:w-auto sm:float-right px-10 py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Aranıyor..." : "Otel Ara"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  className = "",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  className?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
      />
    </div>
  );
}
