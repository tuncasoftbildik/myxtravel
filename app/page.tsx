import { Header } from "@/components/header";
import { SearchTabs } from "@/components/search-tabs";
import { PopularDestinations } from "@/components/popular-destinations";
import { PromotionsCarousel } from "@/components/promotions-carousel";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { AirlineMarquee } from "@/components/airline-marquee";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#0f172a] overflow-hidden flex items-center">
        {/* Animated background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[15%] w-72 h-72 bg-orange-500/15 rounded-full blur-[100px] animate-float" />
          <div className="absolute top-1/2 left-[5%] w-64 h-64 bg-fuchsia-500/12 rounded-full blur-[100px] animate-float-delay" />
          <div className="absolute bottom-10 right-[30%] w-56 h-56 bg-amber-400/10 rounded-full blur-[90px] animate-float" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-16 w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Image src="/logo.png" alt="X Travel" width={160} height={160} className="object-contain drop-shadow-2xl" priority />
          </div>

          <div className="grid lg:grid-cols-[220px_0.8fr_1.8fr] gap-6 sm:gap-8 items-center">
            {/* Far Left - Logo (desktop only) */}
            <div className="hidden lg:flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="X Travel"
                width={240}
                height={240}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>

            {/* Center - Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/70 text-xs font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Yeni sezon kampanyaları başladı
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-4 sm:mb-6">
                Seyahatini
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent whitespace-nowrap">
                  Yeniden Keşfet
                </span>
              </h1>

              <p className="text-white/50 text-base sm:text-lg max-w-md mb-6 sm:mb-10 leading-relaxed">
                Uçak, otel, transfer ve tur — tek platformda karşılaştır, en uygun fiyatla rezerve et.
              </p>

              {/* Stats */}
              <div className="flex gap-6 sm:gap-8">
                {[
                  { value: "500+", label: "Havayolu" },
                  { value: "50K+", label: "Otel" },
                  { value: "1M+", label: "Mutlu Yolcu" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Search */}
            <div>
              <SearchTabs />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by - marquee */}
      <AirlineMarquee />

      <PromotionsCarousel />
      {/* <PopularDestinations /> */}
      <Features />

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#0f172a]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Fırsatları İlk Sen Yakala
          </h2>
          <p className="text-white/50 mb-10 max-w-lg mx-auto">
            E-bültenimize abone olun, özel indirimlerden ve erken rezervasyon fırsatlarından anında haberdar olun.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-5 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red/50 text-sm"
            />
            <button className="px-8 py-4 bg-brand-red text-white font-semibold rounded-2xl hover:bg-red-700 transition text-sm whitespace-nowrap">
              Abone Ol
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
