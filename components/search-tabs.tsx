"use client";

import { useState } from "react";
import { FlightSearch } from "./search-forms/flight-search";
import { HotelSearch } from "./search-forms/hotel-search";
import { TransferSearch } from "./search-forms/transfer-search";
import { TourSearch } from "./search-forms/tour-search";

const tabs = [
  { id: "flight", label: "Uçak", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
  { id: "hotel", label: "Otel", icon: "M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
  { id: "transfer", label: "Transfer", icon: "M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.4L21 11M3 11v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M3 11h18" },
  { id: "tour", label: "Tur", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SearchTabs() {
  const [active, setActive] = useState<TabId>("flight");

  return (
    <div className="glass-white rounded-3xl shadow-2xl shadow-black/10 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-4 text-xs sm:text-sm font-medium transition-all relative ${
                isActive ? "text-brand-red" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-red rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Form area */}
      <div className="p-4 sm:p-6 md:p-8">
        {active === "flight" && <FlightSearch />}
        {active === "hotel" && <HotelSearch />}
        {active === "transfer" && <TransferSearch />}
        {active === "tour" && <TourSearch />}
      </div>
    </div>
  );
}
