"use client";

import Image from "next/image";

const RENTAL_COMPANIES = [
  { name: "Enterprise", image_url: "/rentals/enterprise.png" },
  { name: "Hertz", image_url: "/rentals/hertz.png" },
  { name: "Avis", image_url: "/rentals/avis.png" },
  { name: "Budget", image_url: "/rentals/budget.png" },
  { name: "Europcar", image_url: "/rentals/europcar.png" },
  { name: "Sixt", image_url: "/rentals/sixt.png" },
  { name: "National", image_url: "/rentals/national.png" },
  { name: "Garenta", image_url: "/rentals/garenta.png" },
  { name: "İnterCity", image_url: "/rentals/intercity.png" },
  { name: "Circular", image_url: "/rentals/circular.png" },
  { name: "GreenMotion", image_url: "/rentals/greenmotion.png" },
  { name: "Alamo", image_url: "/rentals/alamo.png" },
];

export function RentalMarquee() {
  return (
    <section className="border-b border-gray-100 py-5 overflow-hidden">
      <div className="text-center mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Araç Kiralama Partnerleri</span>
      </div>
      <div className="relative">
        <div className="flex items-center gap-6 sm:gap-10 animate-marquee w-max">
          {[...RENTAL_COMPANIES, ...RENTAL_COMPANIES, ...RENTAL_COMPANIES].map((rental, i) => (
            <div key={i} className="shrink-0 w-[140px] sm:w-[180px] h-[36px] sm:h-[48px] flex items-center justify-center">
              <Image
                src={rental.image_url}
                alt={rental.name}
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
