"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const DEFAULT_AIRLINES = [
  { name: "X Travel", image_url: "/logo.png" },
  { name: "Turkish Airlines", image_url: "/airlines/thy.png" },
  { name: "Pegasus", image_url: "/airlines/pegasus.png" },
  { name: "Emirates", image_url: "/airlines/emirates.png" },
  { name: "American Airlines", image_url: "/airlines/american.png" },
  { name: "Delta Air Lines", image_url: "/airlines/delta.png" },
  { name: "SunExpress", image_url: "/airlines/sunexpress.png" },
  { name: "Aegean Airlines", image_url: "/airlines/aegean.png" },
  { name: "United Airlines", image_url: "/airlines/united.png" },
  { name: "Ryanair", image_url: "/airlines/ryanair.png" },
  { name: "AJet", image_url: "/airlines/ajet.png" },
  { name: "Corendon", image_url: "/airlines/corendon.png" },
  { name: "China Southern", image_url: "/airlines/chinasouthern.png" },
  { name: "Lufthansa", image_url: "/airlines/lufthansa.png" },
  { name: "Onur Air", image_url: "/airlines/onurair.png" },
  { name: "AtlasGlobal", image_url: "/airlines/atlasglobal.png" },
];

const DEFAULT_BUSES = [
  { name: "Metro Turizm", image_url: "/buses/metro.png" },
  { name: "Kamil Koç", image_url: "/buses/kamilkoc.png" },
  { name: "Pamukkale Turizm", image_url: "/buses/pamukkale.png" },
  { name: "Varan Turizm", image_url: "/buses/varan.png" },
  { name: "Ulusoy Turizm", image_url: "/buses/ulusoy.png" },
  { name: "Sivas Tur", image_url: "/buses/sivastur.png" },
  { name: "Sivaste Tur", image_url: "/buses/sivaste.png" },
  { name: "Seç Turizm", image_url: "/buses/sec.png" },
  { name: "Has Turizm", image_url: "/buses/has.png" },
  { name: "Anadolu Ulaşım", image_url: "/buses/anadolu.png" },
  { name: "Sivas Huzur", image_url: "/buses/sivashuzur.png" },
  { name: "Balıkesir Seyahat", image_url: "/buses/balikesir.png" },
];

interface LogoItem {
  name: string;
  image_url: string;
}

export function AirlineMarquee() {
  const [airlines, setAirlines] = useState<LogoItem[]>(DEFAULT_AIRLINES);

  useEffect(() => {
    fetch("/api/airlines")
      .then((r) => r.json())
      .then((data) => {
        if (data.airlines && data.airlines.length > 0) {
          setAirlines(data.airlines);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="border-b border-gray-100 py-5 overflow-hidden space-y-4">
      {/* Havayolu logoları — sağdan sola */}
      <div className="relative">
        <div className="flex items-center gap-12 sm:gap-20 animate-marquee">
          {[...airlines, ...airlines, ...airlines].map((airline, i) => (
            <div key={i} className="shrink-0 w-[140px] sm:w-[180px] h-[36px] sm:h-[48px] flex items-center justify-center">
              <Image
                src={airline.image_url}
                alt={airline.name}
                width={150}
                height={40}
                className="max-h-full max-w-full opacity-40 hover:opacity-70 transition-opacity duration-300 object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Otobüs firmaları — soldan sağa */}
      <div className="relative">
        <div className="flex items-center gap-12 sm:gap-20 animate-marquee-reverse">
          {[...DEFAULT_BUSES, ...DEFAULT_BUSES, ...DEFAULT_BUSES].map((bus, i) => (
            <div key={i} className="shrink-0 w-[140px] sm:w-[180px] h-[36px] sm:h-[48px] flex items-center justify-center">
              <Image
                src={bus.image_url}
                alt={bus.name}
                width={150}
                height={40}
                className="max-h-full max-w-full opacity-40 hover:opacity-70 transition-opacity duration-300 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
