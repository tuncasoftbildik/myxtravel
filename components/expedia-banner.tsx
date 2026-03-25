"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export function ExpediaBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Script yüklendikten sonra banner'ı yeniden render etmeye zorla
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).EgAffiliateBanners) {
      (window as unknown as Record<string, unknown>).EgAffiliateBanners = undefined;
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div ref={containerRef}>
        <div
          className="eg-affiliate-banners"
          data-program="us-expedia"
          data-network="pz"
          data-layout="leaderboard"
          data-image="city"
          data-message="ready-takeoff-find-perfect-flight"
          data-camref="1011l5EZI4"
          data-pubref=""
          data-link="flights"
        />
      </div>
      <Script
        src="https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js"
        strategy="lazyOnload"
        className="eg-affiliate-banners-script"
      />
    </div>
  );
}
