"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LOCATIONS = [
  { label: "İstanbul Havalimanı (IST)", lat: 41.2608, lng: 28.742 },
  { label: "Sabiha Gökçen (SAW)", lat: 40.8986, lng: 29.3092 },
  { label: "Antalya Havalimanı (AYT)", lat: 36.8987, lng: 30.8005 },
  { label: "İzmir Adnan Menderes (ADB)", lat: 38.2924, lng: 27.157 },
  { label: "Ankara Esenboğa (ESB)", lat: 40.1281, lng: 32.9951 },
  { label: "Dalaman Havalimanı (DLM)", lat: 36.7131, lng: 28.7925 },
  { label: "Taksim, İstanbul", lat: 41.037, lng: 28.985 },
  { label: "Sultanahmet, İstanbul", lat: 41.0054, lng: 28.9768 },
  { label: "Antalya Merkez", lat: 36.8969, lng: 30.7133 },
  { label: "Kemer, Antalya", lat: 36.5985, lng: 30.5566 },
  { label: "Bodrum Merkez", lat: 37.0344, lng: 27.4305 },
  { label: "Fethiye Merkez", lat: 36.6215, lng: 29.1164 },
];

export function TransferSearch() {
  const router = useRouter();
  const [pickUpIdx, setPickUpIdx] = useState("");
  const [dropOffIdx, setDropOffIdx] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [passengers, setPassengers] = useState("2");
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    if (!pickUpIdx || !dropOffIdx || !date || !time) return;
    setLoading(true);

    const pickUp = LOCATIONS[Number(pickUpIdx)];
    const dropOff = LOCATIONS[Number(dropOffIdx)];
    const [y, m, d] = date.split("-");

    const params = new URLSearchParams({
      pickUpLat: String(pickUp.lat),
      pickUpLng: String(pickUp.lng),
      pickUpName: pickUp.label,
      dropOffLat: String(dropOff.lat),
      dropOffLng: String(dropOff.lng),
      dropOffName: dropOff.label,
      date: `${d}.${m}.${y}`,
      time,
      passengers,
    });

    router.push(`/transfer?${params.toString()}`);
  }

  const canSearch = pickUpIdx !== "" && dropOffIdx !== "" && date && time;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3">
        <LocationSelect
          label="Nereden"
          value={pickUpIdx}
          onChange={setPickUpIdx}
          className="flex-[2]"
        />
        <LocationSelect
          label="Nereye"
          value={dropOffIdx}
          onChange={setDropOffIdx}
          className="flex-[2]"
        />
        <Field label="Tarih" type="date" value={date} onChange={setDate} className="flex-1" />
        <Field label="Saat" type="time" value={time} onChange={setTime} className="flex-[0.8]" />
        <SelectField
          label="Yolcu"
          options={["1", "2", "3", "4", "5", "6"]}
          value={passengers}
          onChange={setPassengers}
          className="flex-[0.8]"
        />
      </div>
      <div>
        <button
          onClick={handleSearch}
          disabled={loading || !canSearch}
          className="w-full sm:w-auto sm:float-right px-10 py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Aranıyor..." : "Transfer Ara"}
        </button>
      </div>
    </div>
  );
}

function LocationSelect({
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
      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition cursor-pointer"
        >
          <option value="">Konum seçin</option>
          {LOCATIONS.map((loc, i) => (
            <option key={i} value={i}>
              {loc.label}
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

function SelectField({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o} Yolcu
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
  );
}
