"use client";

import Link from "next/link";

const SERVICES = [
  {
    title: "Uçak Bileti",
    description: "En uygun fiyatlı uçak biletleri",
    image: "https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800&q=80",
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
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#C41E3A", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
          Hizmetlerimiz
        </div>
        <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#111827", marginTop: "0.5rem" }}>
          Ne Arıyorsunuz?
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap" as const,
          gap: "1.5rem",
        }}
      >
        {SERVICES.map((service) => (
          <div
            key={service.title}
            style={{
              width: "calc(25% - 1.125rem)",
              minWidth: "250px",
              height: "280px",
              position: "relative",
              borderRadius: "1rem",
              overflow: "hidden",
              flex: "1 1 calc(25% - 1.125rem)",
            }}
          >
            <Link href={service.link} style={{ display: "block", width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 10 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.image}
              alt={service.title}
              loading="lazy"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover" as const,
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1.5rem",
                zIndex: 5,
              }}
            >
              <div style={{ color: "white", fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                {service.title}
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                {service.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
