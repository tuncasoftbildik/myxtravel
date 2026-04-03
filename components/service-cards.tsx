"use client";

import Link from "next/link";
import { useState } from "react";

const SERVICES = [
  {
    title: "Uçak Bileti",
    description: "En uygun fiyatlı uçak biletleri",
    image: "https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800&q=80",
    link: "/ucus",
    icon: "",
  },
  {
    title: "Otel",
    description: "Binlerce otelde en iyi fiyat garantisi",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    link: "/otel",
    icon: "",
  },
  {
    title: "Transfer",
    description: "Havalimanı ve şehirler arası VIP transfer",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    link: "/transfer",
    icon: "",
  },
  {
    title: "Tur",
    description: "Yurt içi ve yurt dışı tur paketleri",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    link: "/tur",
    icon: "",
  },
];

function ServiceCard({ service }: { service: typeof SERVICES[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "calc(25% - 1.125rem)",
        minWidth: "250px",
        height: "320px",
        position: "relative",
        borderRadius: "1.25rem",
        overflow: "hidden",
        flex: "1 1 calc(25% - 1.125rem)",
        cursor: "pointer",
        transition: "transform 0.4s ease, box-shadow 0.4s ease",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)"
          : "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <Link href={service.link} style={{ display: "block", width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 10 }} />

      {/* Image with zoom */}
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
          transition: "transform 0.6s ease",
          transform: hovered ? "scale(1.12)" : "scale(1)",
        }}
      />

      {/* Gradient overlay - gets darker on hover */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)",
          transition: "background 0.4s ease",
        }}
      />


      {/* Arrow indicator */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-10px)",
          transition: "all 0.3s ease 0.1s",
          zIndex: 5,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1.75rem",
          zIndex: 5,
          transition: "transform 0.4s ease",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
        }}
      >
        <div style={{
          color: "white",
          fontWeight: 800,
          fontSize: "1.5rem",
          marginBottom: "0.5rem",
          letterSpacing: "-0.01em",
        }}>
          {service.title}
        </div>
        <div style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          maxHeight: hovered ? "3rem" : "1.5rem",
          overflow: "hidden",
          transition: "all 0.4s ease",
          opacity: hovered ? 1 : 0.7,
        }}>
          {service.description}
        </div>

        {/* Keşfet button */}
        <div
          style={{
            marginTop: "0.75rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "white",
            fontSize: "0.8rem",
            fontWeight: 600,
            background: "rgba(196,30,58,0.85)",
            padding: "0.4rem 1rem",
            borderRadius: "2rem",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.3s ease 0.15s",
          }}
        >
          Keşfet
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: "60%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          transform: "skewX(-20deg)",
          transition: "left 0.6s ease",
          left: hovered ? "150%" : "-100%",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

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
          <ServiceCard key={service.title} service={service} />
        ))}
      </div>
    </div>
  );
}
