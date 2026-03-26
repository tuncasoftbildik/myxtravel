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

interface Airline {
  name: string;
  image_url: string;
}

export function AirlineMarquee() {
  const [airlines, setAirlines] = useState<Airline[]>(DEFAULT_AIRLINES);

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
    <section className="border-b border-gray-100 py-5 overflow-hidden">
      <div className="relative">
        <div className="flex items-center gap-12 sm:gap-20 animate-marquee">
          {[...airlines, ...airlines, ...airlines].map((airline, i) => (
            <div key={i} className="shrink-0 w-[120px] sm:w-[150px] h-[32px] sm:h-[40px] flex items-center justify-center">
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
    </section>
  );
}
