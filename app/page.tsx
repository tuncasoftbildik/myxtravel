import Image from "next/image";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { PromotionsCarousel } from "@/components/promotions-carousel";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { AirlineMarquee } from "@/components/airline-marquee";

import { NewsletterCTA } from "@/components/newsletter-cta";

const PAYMENT_CARDS = [
  { name: "Axess", src: "/cards/axess.png" },
  { name: "Maximum", src: "/cards/maximum.png" },
  { name: "World", src: "/cards/world.png" },
  { name: "Bonus", src: "/cards/bonus.png" },
  { name: "Paraf", src: "/cards/paraf.png" },
  { name: "Amex", src: "/cards/amex.png" },
];

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />

      {/* Trusted by - marquee */}
      <AirlineMarquee />

      <PromotionsCarousel />
      {/* <PopularDestinations /> */}
      <Features />

      {/* Payment Cards */}
      <section className="bg-gray-50 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {PAYMENT_CARDS.map((card) => (
              <div key={card.name} className="h-[32px] sm:h-[38px] w-[90px] sm:w-[110px] flex items-center justify-center">
                <Image src={card.src} alt={card.name} width={110} height={38} className="max-h-full max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterCTA />

      <Footer />
    </>
  );
}
