import Link from "next/link";

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {SERVICES.map((service) => (
          <Link
            key={service.title}
            href={service.link}
            className="group"
            style={{ display: 'block', position: 'relative', borderRadius: '1rem', overflow: 'hidden', height: '280px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.image}
              alt={service.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
              className="group-hover:scale-110"
            />

            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(0,0,0,0.05))' }} />

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="text-white/80">{service.icon}</span>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>{service.title}</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.4 }}>
                {service.description}
              </p>
            </div>

            <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }} className="group-hover:!opacity-100">
              <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
