import Link from "next/link";
import Image from "next/image";

const SERVICES = [
  {
    title: "Uçak Bileti",
    description: "En uygun fiyatlı uçak biletleri",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&q=80",
    link: "/ucus",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    title: "Otel",
    description: "Binlerce otelde en iyi fiyat garantisi",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    link: "/otel",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h-8.25V3.545m16.5 0L12 9.75 3.545 3.545m16.5 0H3.545" />
      </svg>
    ),
  },
  {
    title: "Transfer",
    description: "Havalimanı ve şehirler arası VIP transfer",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
    link: "/transfer",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.735a2.25 2.25 0 00-1.89 1.03l-3.22 4.93a1.125 1.125 0 00.164 1.414l1.472 1.286a3.198 3.198 0 002.108.797h6.101" />
      </svg>
    ),
  },
  {
    title: "Tur",
    description: "Yurt içi ve yurt dışı tur paketleri",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    link: "/tur",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
];

export function ServiceCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center mb-8 sm:mb-10">
        <span className="text-xs font-semibold text-brand-red uppercase tracking-widest">Hizmetlerimiz</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Ne Arıyorsunuz?</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {SERVICES.map((service) => (
          <Link
            key={service.title}
            href={service.link}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[3/2]"
          >
            {/* Background image */}
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 transition-all duration-300" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/80 group-hover:text-white transition-colors">
                  {service.icon}
                </span>
                <h3 className="text-white font-bold text-base sm:text-lg">{service.title}</h3>
              </div>
              <p className="text-white/70 text-xs sm:text-sm leading-snug group-hover:text-white/90 transition-colors">
                {service.description}
              </p>

              {/* Arrow indicator */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
