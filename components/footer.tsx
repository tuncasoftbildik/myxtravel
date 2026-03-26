import Image from "next/image";
import Link from "next/link";

const links = {
  Hizmetler: [
    { label: "Uçak Bileti", href: "/ucus" },
    { label: "Otel Rezervasyonu", href: "/otel" },
    { label: "Transfer", href: "/transfer" },
    { label: "Tur Paketleri", href: "/tur" },
  ],
  Kurumsal: [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Kariyer", href: "/kariyer" },
    { label: "Blog", href: "/blog" },
    { label: "İletişim", href: "/iletisim" },
  ],
  Yasal: [
    { label: "Gizlilik Politikası", href: "/gizlilik" },
    { label: "Kullanim Kosullari", href: "/kullanim-kosullari" },
    { label: "KVKK", href: "/kvkk" },
    { label: "Çerez Politikası", href: "/cerez" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Image src="/logo.png" alt="X Travel" width={40} height={40} className="object-contain" />
              <div>
                <span className="text-lg font-bold tracking-wide">X TRAVEL</span>
                <span className="block text-[10px] text-white/40 tracking-[0.15em]">LIVE YOUR DREAM</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Uçak bileti, otel, transfer ve tur hizmetleri ile hayalinizdeki seyahati en uygun fiyatlarla planlayın.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-white/80">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-white/50 hover:text-white transition">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment & SSL */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col items-center gap-6">
          {/* SSL Badge */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs font-semibold text-emerald-400">256-bit SSL</span>
            <span className="text-[10px] text-white/40">Güvenli Ödeme / Secure Payment</span>
          </div>

          {/* Card Logos */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { name: "Axess", src: "/cards/axess.png" },
              { name: "Maximum", src: "/cards/maximum.png" },
              { name: "World", src: "/cards/world.png" },
              { name: "Bonus", src: "/cards/bonus.png" },
              { name: "Paraf", src: "/cards/paraf.png" },
              { name: "Amex", src: "/cards/amex.png" },
            ].map((card) => (
              <div key={card.name} className="h-[28px] sm:h-[32px] w-[80px] sm:w-[90px] flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                <Image src={card.src} alt={card.name} width={90} height={32} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t border-white/5">
            <span className="text-xs text-white/30">&copy; {new Date().getFullYear()} Şimşek Via Travel Turizm. Tüm hakları saklıdır.</span>
            <span className="text-xs text-white/30">TURSAB Belge No: 11452</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
