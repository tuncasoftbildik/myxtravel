"use client";

import Link from "next/link";

const NAV_ITEMS = [
  {
    label: "Otel",
    href: "/otel",
    icon: "M7 21H3v-8l9-6 9 6v8h-4v-6h-2v6H9v-6H7v6zm5-18l12 8h-3v10h-5v-6H8v6H3V11H0l12-8z",
    fill: true,
  },
  {
    label: "Tur",
    href: "/tur",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    fill: true,
  },
  {
    label: "Uçak",
    href: "/ucus",
    icon: "M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
    fill: true,
  },
  {
    label: "Otobüs",
    href: "/otobus",
    icon: "M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z",
    fill: true,
  },
  {
    label: "Araç Kiralama",
    href: "/arac-kiralama",
    icon: "M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z",
    fill: true,
  },
  {
    label: "Transfer",
    href: "/transfer",
    icon: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
    fill: true,
  },
  {
    label: "Kampanyalar",
    href: "/kampanyalar",
    icon: "M21 5H3a1 1 0 00-1 1v4a2 2 0 002 2 2 2 0 010 4 2 2 0 00-2 2v4a1 1 0 001 1h18a1 1 0 001-1v-4a2 2 0 00-2-2 2 2 0 010-4 2 2 0 002-2V6a1 1 0 00-1-1zm-1 5.17a4 4 0 000 5.66V20H4v-4.17a4 4 0 000-5.66V6h16v4.17z",
    fill: true,
  },
];

export function HeroSection() {
  return (
    <section className="relative bg-white border-b border-gray-100 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-8 sm:pb-10">
        {/* Nav items */}
        <nav className="flex items-stretch justify-center gap-3 sm:gap-5 md:gap-8 flex-wrap">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center gap-2.5 sm:gap-3 w-[72px] sm:w-[88px] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-brand-red group-hover:border-brand-red group-hover:shadow-lg group-hover:shadow-brand-red/25 transition-all duration-300">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-white transition-colors duration-300"
                  fill={item.fill ? "currentColor" : "none"}
                  stroke={item.fill ? "none" : "currentColor"}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-gray-500 group-hover:text-brand-red transition-colors duration-300 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
