"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface TourDetail {
  code: string;
  groupCode: string;
  name: string;
  shortDescription: string;
  logo: string;
  dayCount: string;
  nightCount: string;
  startDate: string;
  endDate: string;
  withTransfer: boolean;
  allotment: number;
  medias: { url: string; title: string; type: number }[];
  programs: { day: number; title: string; description: string }[];
  extras: { code: string; name: string; inclusions: string; exclusions: string; program: string }[];
  regions: { city: string; country: string }[];
  cancellationPolicies: unknown[];
}

export default function TurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!code) return;

    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tours/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tourCode: code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Detaylar alınamadı");
        if (!data.tour) throw new Error("Tur bulunamadı");
        setTour(data.tour);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [code]);

  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-[20%] w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[10%] w-48 h-48 bg-fuchsia-500/8 rounded-full blur-[80px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-14 sm:pt-10 sm:pb-16">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Sonuçlara Dön
            </button>
            {tour && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{tour.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="text-xs bg-white/10 text-white/80 px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm">
                    {tour.dayCount} Gün / {tour.nightCount} Gece
                  </span>
                  {tour.regions.map((r, i) => (
                    <span key={i} className="text-xs text-white/50 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {r.city}, {r.country}
                    </span>
                  ))}
                  {tour.withTransfer && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg font-medium">
                      Transfer Dahil
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12 sm:pb-16">
          {loading && <DetailSkeleton />}

          {error && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
              <p className="text-brand-red font-semibold mb-2">{error}</p>
              <button onClick={() => router.back()} className="text-sm text-brand-gray/60 hover:text-brand-dark transition">
                Geri dön
              </button>
            </div>
          )}

          {!loading && !error && tour && (
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              {/* Main content */}
              <div className="space-y-6">
                {/* Gallery */}
                {tour.medias.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="aspect-[16/9] bg-gray-100">
                      <img
                        src={tour.medias[activeImage]?.url || tour.logo}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {tour.medias.length > 1 && (
                      <div className="p-3 flex gap-2 overflow-x-auto">
                        {tour.medias.map((m, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                              i === activeImage ? "border-brand-red" : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Logo fallback if no medias */}
                {tour.medias.length === 0 && tour.logo && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="aspect-[16/9] bg-gray-50 flex items-center justify-center">
                      <img src={tour.logo} alt={tour.name} className="max-h-full object-contain" />
                    </div>
                  </div>
                )}

                {/* Description */}
                {tour.shortDescription && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Tur Hakkında</h2>
                    <p className="text-sm text-brand-gray/70 leading-relaxed">{tour.shortDescription}</p>
                  </div>
                )}

                {/* Day programs */}
                {tour.programs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Gün Gün Program</h2>
                    <div className="space-y-4">
                      {tour.programs.map((p, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {p.day || i + 1}
                          </div>
                          <div className="flex-1 pt-1.5">
                            {p.title && <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>}
                            {p.description && (
                              <div
                                className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: p.description }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extras - Inclusions/Exclusions from extra tours */}
                {tour.extras.length > 0 && tour.extras[0]?.inclusions && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {tour.extras[0].inclusions && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Dahil Olanlar
                        </h2>
                        <div
                          className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: tour.extras[0].inclusions }}
                        />
                      </div>
                    )}
                    {tour.extras[0].exclusions && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Hariç Olanlar
                        </h2>
                        <div
                          className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: tour.extras[0].exclusions }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Booking card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                  <div className="text-center mb-5">
                    <p className="text-xs text-brand-gray/40 uppercase tracking-wider mb-1">Kişi Başı Fiyat</p>
                    <p className="text-3xl font-bold text-brand-red">—</p>
                    <p className="text-xs text-brand-gray/50 mt-1">Tarih seçimine göre değişir</p>
                  </div>

                  <div className="space-y-3 mb-5">
                    <InfoRow label="Süre" value={`${tour.dayCount} Gün / ${tour.nightCount} Gece`} />
                    {tour.regions[0] && (
                      <InfoRow label="Bölge" value={`${tour.regions[0].city}, ${tour.regions[0].country}`} />
                    )}
                    <InfoRow label="Kontenjan" value={`${tour.allotment} kişi`} />
                    {tour.withTransfer && <InfoRow label="Transfer" value="Dahil" />}
                  </div>

                  <button className="w-full py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 text-sm">
                    Rezervasyon Yap
                  </button>
                </div>

                {/* Extra tours */}
                {tour.extras.length > 1 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Paket Seçenekleri</h3>
                    <div className="space-y-2">
                      {tour.extras.map((e, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl border border-gray-100 hover:border-brand-red/30 transition cursor-pointer"
                        >
                          <p className="text-sm font-medium text-gray-800">{e.name}</p>
                          <p className="text-xs text-brand-gray/40 mt-0.5">{e.code}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-brand-gray/50">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-gray-100" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-3">
          <div className="h-5 bg-gray-100 rounded w-40" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
      <div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-4">
          <div className="h-10 bg-gray-100 rounded w-32 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-12 bg-gray-100 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
