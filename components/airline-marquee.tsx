"use client";

import Image from "next/image";

const airlines = [
  { name: "Turkish Airlines", src: "/airlines/thy.png" },
  { name: "Pegasus", src: "/airlines/pegasus.png" },
  { name: "SunExpress", src: "/airlines/sunexpress.png" },
  { name: "AnadoluJet", src: "/airlines/anadolujet.png" },
  { name: "Corendon", src: "/airlines/corendon.png" },
  { name: "Onur Air", src: "/airlines/onurair.png" },
  { name: "AtlasGlobal", src: "/airlines/atlasglobal.png" },
];

export function AirlineMarquee() {
  return (
    <section className="border-b border-gray-100 py-5 overflow-hidden">
      <div className="relative">
        <div className="flex items-center gap-12 sm:gap-20 animate-marquee">
          {[...airlines, ...airlines, ...airlines].map((airline, i) => (
            <Image
              key={i}
              src={airline.src}
              alt={airline.name}
              width={150}
              height={40}
              className="h-6 sm:h-8 w-auto shrink-0 opacity-40 hover:opacity-70 transition-opacity duration-300 object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
