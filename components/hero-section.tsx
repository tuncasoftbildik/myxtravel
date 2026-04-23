"use client";

import { SearchTabs } from "./search-tabs";
import { RevealText } from "./ui/reveal-text";

const KESFET_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=70", // K - beach
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=70", // e - airplane wing
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=70", // ş - mountains
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=70", // f - paris/city
  "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=1200&q=70", // e - hot air balloon
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=70", // t - tropical resort
];

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] sm:min-h-[680px] flex items-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/menu/tur.jpg)" }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12">
        {/* Headline */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold italic text-white leading-tight tracking-tight">
            Hayalindeki Seyahati
          </h1>
          <div className="mt-1">
            <RevealText
              text="Keşfet"
              textColor="text-brand-red"
              overlayColor="text-white"
              fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              italic
              letterImages={KESFET_IMAGES}
            />
          </div>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-xl mx-auto">
            Uçak bileti, otel, transfer ve tur — hepsi tek platformda, en uygun fiyatlarla.
          </p>
        </div>

        {/* Search widget */}
        <div className="max-w-4xl mx-auto">
          <SearchTabs />
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
