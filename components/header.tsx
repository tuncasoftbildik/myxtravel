"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

const navItems = [
  { label: "Uçak", href: "/ucus" },
  { label: "Otel", href: "/otel" },
  { label: "Transfer", href: "/transfer" },
  { label: "Tur", href: "/tur" },
  { label: "Kampanyalar", href: "/kampanyalar" },
];

export function Header({ variant = "transparent" }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isSolid = variant === "solid";

  return (
    <header className={isSolid ? "sticky top-0 z-50 bg-brand-dark shadow-lg shadow-brand-dark/20" : "absolute top-0 left-0 right-0 z-50"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="X Travel" width={36} height={36} className="object-contain" />
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-white tracking-wide">X TRAVEL</span>
            <span className="block text-[9px] text-white/40 tracking-[0.12em] -mt-0.5">LIVE YOUR DREAM</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden lg:flex items-center gap-2">
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
        <button className="lg:hidden p-3 text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
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
        <nav className={`lg:hidden mx-4 rounded-2xl p-4 space-y-1 mb-2 ${isSolid ? "bg-white/10 border border-white/10" : "glass"}`}>
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
