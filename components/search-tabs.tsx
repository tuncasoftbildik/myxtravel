"use client";

import { useState } from "react";
import { FlightSearch } from "./search-forms/flight-search";
import { HotelSearch } from "./search-forms/hotel-search";
import { TransferSearch } from "./search-forms/transfer-search";
import { TourSearch } from "./search-forms/tour-search";

const tabs = [
  { id: "tour", label: "Tur", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z", fill: true },
  { id: "hotel", label: "Otel", icon: "M7 21H3v-8l9-6 9 6v8h-4v-6h-2v6H9v-6H7v6zm5-18l12 8h-3v10h-5v-6H8v6H3V11H0l12-8z", fill: true },
  { id: "flight", label: "Uçak", icon: "M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z", fill: true },
  { id: "transfer", label: "Transfer", icon: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z", fill: true },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SearchTabs() {
  const [active, setActive] = useState<TabId>("tour");

  return (
    <div className="glass-white rounded-3xl shadow-2xl shadow-black/10 overflow-hidden w-full">
      {/* Tab bar — pill buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-5 pb-3">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/25"
                  : "bg-white text-brand-red border border-gray-200 hover:border-brand-red/40 hover:bg-red-50/50"
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={tab.fill ? "currentColor" : "none"} stroke={tab.fill ? "none" : "currentColor"} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={tab.fill ? 0 : 1.5} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form area */}
      <div className="p-4 sm:p-6 md:p-8">
        {active === "tour" && <TourSearch />}
        {active === "hotel" && <HotelSearch />}
        {active === "flight" && <FlightSearch />}
        {active === "transfer" && <TransferSearch />}
      </div>
    </div>
  );
}
