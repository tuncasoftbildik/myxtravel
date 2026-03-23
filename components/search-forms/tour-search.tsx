"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TourSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSearch() {
    if (!startDate || !endDate) return;
    setLoading(true);

    const params = new URLSearchParams({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
    if (destination.trim()) {
      params.set("destination", destination.trim());
    }

    router.push(`/tur?${params.toString()}`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3">
        <Field
          label="Nereye"
          placeholder="Şehir veya bölge"
          className="flex-[2]"
          value={destination}
          onChange={setDestination}
        />
        <Field
          label="Başlangıç"
          type="date"
          className="flex-1"
          value={startDate}
          onChange={setStartDate}
        />
        <Field
          label="Bitiş"
          type="date"
          className="flex-1"
          value={endDate}
          onChange={setEndDate}
        />
      </div>
      <div>
        <button
          onClick={handleSearch}
          disabled={loading || !startDate || !endDate}
          className="w-full sm:w-auto sm:float-right px-10 py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "Aranıyor..." : "Tur Ara"}
        </button>
      </div>
    </div>
  );
}

/** yyyy-MM-dd → dd.MM.yyyy (API format) */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function Field({
  label,
  placeholder,
  type = "text",
  className = "",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
      />
    </div>
  );
}
