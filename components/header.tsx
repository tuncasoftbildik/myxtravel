"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

const navItems = [
  { label: "Uçak", href: "/ucus", icon: "M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z", fill: true },
  { label: "Otel", href: "/otel", icon: "M7 21H3v-8l9-6 9 6v8h-4v-6h-2v6H9v-6H7v6zm5-18l12 8h-3v10h-5v-6H8v6H3V11H0l12-8z", fill: true },
  { label: "Transfer", href: "/transfer", icon: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z", fill: true },
  { label: "Tur", href: "/tur", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z", fill: true },
  { label: "Kampanyalar", href: "/kampanyalar", icon: "M21 5H3a1 1 0 00-1 1v4a2 2 0 002 2 2 2 0 010 4 2 2 0 00-2 2v4a1 1 0 001 1h18a1 1 0 001-1v-4a2 2 0 00-2-2 2 2 0 010-4 2 2 0 002-2V6a1 1 0 00-1-1zm-1 5.17a4 4 0 000 5.66V20H4v-4.17a4 4 0 000-5.66V6h16v4.17z", fill: true },
];

export function Header({ variant = "transparent" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isSolid = variant === "solid";

  return (
    <header className={isSolid ? "sticky top-0 z-50 bg-brand-dark shadow-lg shadow-brand-dark/20" : "absolute top-0 left-0 right-0 z-50"}>
      <div className="w-full px-4 sm:px-8 h-16 sm:h-20 flex items-center">
        {/* Logo — far left */}
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="X Travel" width={320} height={320} className="object-contain -my-8 translate-y-[20%] -translate-x-[30%]" />
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth — far right */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link href="/giris" className="px-5 py-2.5 text-sm text-white/80 hover:text-white transition">
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            className="px-5 py-2.5 text-sm bg-brand-red text-white rounded-full hover:bg-red-700 transition font-medium"
          >
            Ücretsiz Üye Ol
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="sm:hidden p-3 text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className={`sm:hidden mx-4 rounded-2xl p-4 space-y-1 mb-2 ${isSolid ? "bg-white/10 border border-white/10" : "glass"}`}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl text-sm transition">
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 border-t border-white/10 mt-2">
            <Link href="/giris" className="flex-1 text-center py-2.5 text-white/80 border border-white/20 rounded-full text-sm">Giriş Yap</Link>
            <Link href="/kayit" className="flex-1 text-center py-2.5 bg-brand-red text-white rounded-full text-sm">Üye Ol</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
