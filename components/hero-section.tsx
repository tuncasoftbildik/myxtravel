"use client";

import { SearchTabs } from "./search-tabs";

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Hayalindeki Seyahati
            <span className="block text-brand-red mt-1">Keşfet</span>
          </h1>
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
