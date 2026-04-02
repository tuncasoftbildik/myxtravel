import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { PromotionsCarousel } from "@/components/promotions-carousel";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { AirlineMarquee } from "@/components/airline-marquee";
import { NewsletterCTA } from "@/components/newsletter-cta";
export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <AirlineMarquee />
      <PromotionsCarousel />
      <Features />
      <NewsletterCTA />
      <Footer />
    </>
  );
}
