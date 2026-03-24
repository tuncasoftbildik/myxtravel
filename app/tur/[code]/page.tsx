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

interface PackagePrice {
  packageId: string;
  price: { total: number; currency: string; base: number; tax: number; discount: number };
}

type BookingStep = "details" | "pricing" | "passengers" | "confirm" | "done";

export default function TurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Booking state
  const [step, setStep] = useState<BookingStep>("details");
  const [adults, setAdults] = useState(2);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [packages, setPackages] = useState<PackagePrice[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackagePrice | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ systemPnr: string; status: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Passenger form
  const [passengers, setPassengers] = useState<{ firstName: string; lastName: string; birthDate: string; gender: string }[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

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

  // Initialize passenger forms when adults change
  useEffect(() => {
    setPassengers(
      Array.from({ length: adults }, () => ({ firstName: "", lastName: "", birthDate: "", gender: "M" }))
    );
  }, [adults]);

  async function handleGetPrices() {
    setPricingLoading(true);
    try {
      const res = await fetch("/api/tours/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourAlternativeCode: code, adults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fiyat alınamadı");
      setPackages(data.packages || []);
      if (data.packages?.length > 0) {
        setSelectedPackage(data.packages[0]);
      }
      setStep("pricing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fiyat hatası");
    } finally {
      setPricingLoading(false);
    }
  }

  async function handleBook() {
    if (!selectedPackage) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch("/api/tours/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.packageId,
          passengers: passengers.map((p, i) => ({
            Index: i + 1,
            FirstName: p.firstName,
            LastName: p.lastName,
            BirthDate: p.birthDate,
            Gender: p.gender === "M" ? 0 : 1,
            PaxType: 0,
          })),
          contactInfo: {
            Email: contactEmail,
            Phone: contactPhone,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Rezervasyon başarısız");
      setBookingResult(data.booking);
      setStep("done");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Rezervasyon hatası");
    } finally {
      setBookingLoading(false);
    }
  }

  function updatePassenger(index: number, field: string, value: string) {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  const canBook = passengers.every((p) => p.firstName && p.lastName) && contactEmail && contactPhone;

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
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg font-medium">Transfer Dahil</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12 sm:pb-16">
          {loading && <DetailSkeleton />}

          {error && !loading && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
              <p className="text-brand-red font-semibold mb-2">{error}</p>
              <button onClick={() => { setError(null); router.back(); }} className="text-sm text-brand-gray/60 hover:text-brand-dark transition">
                Geri dön
              </button>
            </div>
          )}

          {!loading && !error && tour && (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
              {/* Main content */}
              <div className="space-y-6">
                {/* Gallery */}
                {(tour.medias.length > 0 || tour.logo) && (
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
                            className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${i === activeImage ? "border-brand-red" : "border-transparent opacity-60 hover:opacity-100"}`}
                          >
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
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
                              <div className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p.description }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inclusions/Exclusions */}
                {tour.extras.length > 0 && tour.extras[0]?.inclusions && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {tour.extras[0].inclusions && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Dahil Olanlar
                        </h2>
                        <div className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tour.extras[0].inclusions }} />
                      </div>
                    )}
                    {tour.extras[0].exclusions && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          Hariç Olanlar
                        </h2>
                        <div className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tour.extras[0].exclusions }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar - Booking Flow */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                  {/* Steps indicator */}
                  <div className="flex border-b border-gray-100">
                    {[
                      { id: "details", label: "Fiyat" },
                      { id: "passengers", label: "Yolcular" },
                      { id: "done", label: "Onay" },
                    ].map((s, i) => {
                      const stepOrder = ["details", "pricing", "passengers", "confirm", "done"];
                      const currentIdx = stepOrder.indexOf(step);
                      const thisIdx = stepOrder.indexOf(s.id);
                      const isActive = currentIdx >= thisIdx;
                      return (
                        <div key={s.id} className={`flex-1 py-3 text-center text-xs font-medium transition ${isActive ? "text-brand-red bg-brand-red/5" : "text-brand-gray/30"}`}>
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] mr-1 ${isActive ? "bg-brand-red text-white" : "bg-gray-100 text-brand-gray/40"}`}>
                            {i + 1}
                          </span>
                          {s.label}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5">
                    {/* Step: Details - Get Price */}
                    {(step === "details" || step === "pricing") && (
                      <div>
                        <div className="space-y-3 mb-5">
                          <InfoRow label="Süre" value={`${tour.dayCount} Gün / ${tour.nightCount} Gece`} />
                          {tour.regions[0] && <InfoRow label="Bölge" value={`${tour.regions[0].city}, ${tour.regions[0].country}`} />}
                          <InfoRow label="Kontenjan" value={`${tour.allotment} kişi`} />
                        </div>

                        {/* Adults selector */}
                        <div className="mb-4">
                          <label className="text-xs text-brand-gray/50 font-medium mb-1.5 block">Yetişkin Sayısı</label>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-red hover:text-brand-red transition"
                            >
                              -
                            </button>
                            <span className="text-lg font-bold text-gray-900 w-8 text-center">{adults}</span>
                            <button
                              onClick={() => setAdults(Math.min(6, adults + 1))}
                              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-red hover:text-brand-red transition"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price display or get price button */}
                        {step === "details" && (
                          <button
                            onClick={handleGetPrices}
                            disabled={pricingLoading}
                            className="w-full py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 text-sm disabled:opacity-50"
                          >
                            {pricingLoading ? "Fiyat alınıyor..." : "Fiyat Sorgula"}
                          </button>
                        )}

                        {step === "pricing" && packages.length > 0 && (
                          <div className="space-y-3">
                            {packages.map((pkg, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`w-full p-3 rounded-xl border-2 text-left transition ${selectedPackage?.packageId === pkg.packageId ? "border-brand-red bg-brand-red/5" : "border-gray-100 hover:border-gray-200"}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-brand-gray/50">Paket {i + 1}</span>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-brand-red">
                                      {pkg.price.total?.toLocaleString("tr-TR")}
                                    </p>
                                    <p className="text-[11px] text-brand-gray/40">{pkg.price.currency} toplam</p>
                                  </div>
                                </div>
                              </button>
                            ))}

                            <button
                              onClick={() => setStep("passengers")}
                              disabled={!selectedPackage}
                              className="w-full py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 text-sm disabled:opacity-50 mt-2"
                            >
                              Devam Et
                            </button>
                          </div>
                        )}

                        {step === "pricing" && packages.length === 0 && (
                          <p className="text-sm text-brand-gray/50 text-center py-4">Bu tarih için fiyat bulunamadı.</p>
                        )}
                      </div>
                    )}

                    {/* Step: Passengers */}
                    {(step === "passengers" || step === "confirm") && (
                      <div>
                        {selectedPackage && (
                          <div className="bg-brand-red/5 rounded-xl p-3 mb-5">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-brand-gray/60">Toplam Fiyat</span>
                              <span className="text-xl font-bold text-brand-red">
                                {selectedPackage.price.total?.toLocaleString("tr-TR")} {selectedPackage.price.currency}
                              </span>
                            </div>
                          </div>
                        )}

                        <h3 className="font-bold text-gray-900 text-sm mb-3">Yolcu Bilgileri</h3>
                        <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-1">
                          {passengers.map((p, i) => (
                            <div key={i} className="space-y-2 pb-3 border-b border-gray-50 last:border-0">
                              <p className="text-xs text-brand-gray/40 font-medium">Yolcu {i + 1}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  placeholder="Ad"
                                  value={p.firstName}
                                  onChange={(e) => updatePassenger(i, "firstName", e.target.value)}
                                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                                />
                                <input
                                  placeholder="Soyad"
                                  value={p.lastName}
                                  onChange={(e) => updatePassenger(i, "lastName", e.target.value)}
                                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="date"
                                  placeholder="Doğum Tarihi"
                                  value={p.birthDate}
                                  onChange={(e) => updatePassenger(i, "birthDate", e.target.value)}
                                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                                />
                                <select
                                  value={p.gender}
                                  onChange={(e) => updatePassenger(i, "gender", e.target.value)}
                                  className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                                >
                                  <option value="M">Erkek</option>
                                  <option value="F">Kadın</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm mb-3">İletişim Bilgileri</h3>
                        <div className="space-y-2 mb-5">
                          <input
                            type="email"
                            placeholder="E-posta"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                          />
                          <input
                            type="tel"
                            placeholder="Telefon"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition"
                          />
                        </div>

                        {bookingError && (
                          <div className="bg-red-50 rounded-xl p-3 mb-3">
                            <p className="text-sm text-brand-red">{bookingError}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setStep("pricing")}
                            className="flex-1 py-3 border border-gray-200 text-brand-gray/60 font-medium rounded-xl hover:bg-gray-50 transition text-sm"
                          >
                            Geri
                          </button>
                          <button
                            onClick={handleBook}
                            disabled={!canBook || bookingLoading}
                            className="flex-[2] py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 text-sm disabled:opacity-50"
                          >
                            {bookingLoading ? "Rezervasyon yapılıyor..." : "Rezervasyon Yap"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step: Done */}
                    {step === "done" && bookingResult && (
                      <div className="text-center py-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Rezervasyon Tamamlandı</h3>
                        <p className="text-sm text-brand-gray/60 mb-1">PNR Kodu:</p>
                        <p className="text-2xl font-bold text-brand-red mb-4 font-mono">{bookingResult.systemPnr || "—"}</p>
                        <p className="text-xs text-brand-gray/40 mb-5">Durum: {bookingResult.status || "Onay Bekliyor"}</p>
                        <button
                          onClick={() => router.push("/")}
                          className="w-full py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand-dark/90 transition text-sm"
                        >
                          Ana Sayfaya Dön
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
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
