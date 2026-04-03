"use client";

import Link from "next/link";

const SERVICES = [
  {
    title: "Uçak Bileti",
    description: "En uygun fiyatlı uçak biletleri",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&q=80",
    link: "/ucus",
  },
  {
    title: "Otel",
    description: "Binlerce otelde en iyi fiyat garantisi",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    link: "/otel",
  },
  {
    title: "Transfer",
    description: "Havalimanı ve şehirler arası VIP transfer",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    link: "/transfer",
  },
  {
    title: "Tur",
    description: "Yurt içi ve yurt dışı tur paketleri",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    link: "/tur",
  },
];

export function ServiceCards() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .sc-section { max-width: 1280px; margin: 0 auto; padding: 3rem 1.5rem; }
        .sc-title-wrap { text-align: center; margin-bottom: 2.5rem; }
        .sc-subtitle { font-size: 0.75rem; font-weight: 600; color: #C41E3A; text-transform: uppercase; letter-spacing: 0.1em; }
        .sc-title { font-size: 1.875rem; font-weight: 700; color: #111827; margin-top: 0.5rem; }
        .sc-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 1.5rem !important; width: 100% !important; }
        .sc-card { position: relative !important; display: block !important; border-radius: 1rem; overflow: hidden; height: 280px; text-decoration: none; }
        .sc-card img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .sc-card:hover img { transform: scale(1.1); }
        .sc-card .sc-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%); }
        .sc-card .sc-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem; }
        .sc-card .sc-content h3 { color: white; font-weight: 700; font-size: 1.25rem; margin: 0 0 0.25rem 0; }
        .sc-card .sc-content p { color: rgba(255,255,255,0.75); font-size: 0.875rem; line-height: 1.5; margin: 0; }
        @media (max-width: 768px) {
          .sc-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sc-card { height: 200px; }
        }
      `}} />
      <section className="sc-section">
        <div className="sc-title-wrap">
          <span className="sc-subtitle">Hizmetlerimiz</span>
          <h2 className="sc-title">Ne Arıyorsunuz?</h2>
        </div>
        <div className="sc-grid">
          {SERVICES.map((service) => (
            <Link key={service.title} href={service.link} className="sc-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={service.image} alt={service.title} loading="lazy" />
              <div className="sc-overlay" />
              <div className="sc-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
