import Image from "next/image";
import Link from "next/link";

const links = {
  Hizmetler: [
    { label: "Uçak Bileti", href: "/ucak" },
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
    { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
    { label: "KVKK", href: "/kvkk" },
    { label: "Çerez Politikası", href: "/cerez" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
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
              {["instagram", "twitter", "facebook", "youtube"].map((s) => (
                <span key={s} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition cursor-pointer text-xs font-bold uppercase">
                  {s[0]}
                </span>
              ))}
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

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-xs text-white/30">&copy; {new Date().getFullYear()} X Travel. Tüm hakları saklıdır.</span>
          <span className="text-xs text-white/30">TURSAB Belge No: XXXXX</span>
        </div>
      </div>
    </footer>
  );
}
