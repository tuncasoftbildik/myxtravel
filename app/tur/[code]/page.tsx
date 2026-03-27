"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface TourDate {
  date: string;
  quota: number;
  sold: number;
  dpp: string;
  currency: string;
  single: string;
  list?: any[];
  [key: string]: any;
}

export default function TurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.code as string;

  const [tour, setTour] = useState<any>(null);
  const [dates, setDates] = useState<TourDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [datesLoading, setDatesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Booking state
  const [selectedDate, setSelectedDate] = useState<TourDate | null>(null);
  const [adults, setAdults] = useState(2);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceResult, setPriceResult] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<"select" | "passengers" | "done">("select");

  // Passenger form
  const [passengers, setPassengers] = useState<{ name: string; surname: string; birthDate: string; gender: string; tckn: string }[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch tour detail
  useEffect(() => {
    if (!tourId) return;
    async function fetchDetail() {
      try {
        const res = await fetch("/api/a2tours/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tourId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Detaylar alınamadı");
        setTour(data.tour);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [tourId]);

  // Fetch tour dates
  useEffect(() => {
    if (!tourId) return;
    async function fetchDates() {
      try {
        const res = await fetch("/api/a2tours/dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tourId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tarihler alınamadı");
        // dates can be array or { list: [...] }
        const raw = data.dates;
        const allDates: TourDate[] = Array.isArray(raw) ? raw : raw?.list || [];

        // Filter: skip past dates, skip full quota, max 50
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const validDates = allDates
          .filter((d) => {
            const dt = new Date(d.date);
            if (dt < tomorrow) return false;
            const remaining = (d.quota || 0) - (d.sold || 0);
            if (remaining <= 0) return false;
            return true;
          })
          .slice(0, 50);

        setDates(validDates);
      } catch {
        // silently fail
      } finally {
        setDatesLoading(false);
      }
    }
    fetchDates();
  }, [tourId]);

  // Init passengers
  useEffect(() => {
    setPassengers(
      Array.from({ length: adults }, () => ({ name: "", surname: "", birthDate: "", gender: "E", tckn: "" })),
    );
  }, [adults]);

  async function handleCalculatePrice() {
    if (!selectedDate) return;
    setPriceLoading(true);
    setPriceResult(null);
    try {
      const res = await fetch("/api/a2tours/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: Number(tourId),
          date: selectedDate.date,
          adults,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fiyat hesaplanamadı");
      setPriceResult(data.price);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fiyat hatası");
    } finally {
      setPriceLoading(false);
    }
  }

  async function handleBook() {
    if (!priceResult) return;
    // Get token from price result
    const token = priceResult?.price?.[0]?.token || priceResult?.token;
    if (!token) {
      setBookingError("Fiyat token bulunamadı, lütfen tekrar fiyat hesaplayın");
      return;
    }
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch("/api/a2tours/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchToken: token,
          passengers: passengers.map((p) => ({
            name: p.name,
            surname: p.surname,
            birthDate: p.birthDate,
            gender: p.gender,
            tckn: p.tckn,
          })),
          contactPhone,
          contactEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Rezervasyon başarısız");
      setBookingResult(data.sale);
      setBookingStep("done");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Rezervasyon hatası");
    } finally {
      setBookingLoading(false);
    }
  }

  function updatePassenger(index: number, field: string, value: string) {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  const canBook = passengers.every((p) => p.name && p.surname) && contactEmail && contactPhone;

  // Extract data from tour response
  const details = tour?.details || {};
  const images: { url: string }[] = tour?.images || [];
  const programs: any[] = tour?.tourProgram || [];
  const departureStops: any[] = tour?.departureStops || [];
  const categories: any[] = tour?.categoryList || [];
  const tourName = tour?.name || "";
  const nights = tour?.nights || 0;
  const nextDepartureDate = dates.length > 0 ? dates[0].date : null;

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
              Turlara Dön
            </button>
            {tour && (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{tourName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {nights > 0 && (
                    <span className="text-xs bg-white/10 text-white/80 px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm">
                      {nights + 1} Gün / {nights} Gece
                    </span>
                  )}
                  {details.transportationType && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg font-medium">
                      {details.transportationType}
                    </span>
                  )}
                  {details.visaFree === 1 && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg font-medium">
                      Vizesiz
                    </span>
                  )}
                  {tour.departureCity && (
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {tour.departureCity}
                    </span>
                  )}
                  {nextDepartureDate && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      İlk kalkış: {formatDate(nextDepartureDate)}
                    </span>
                  )}
                  {categories.map((c: any, i: number) => (
                    <span key={i} className="text-xs bg-white/5 text-white/50 px-2.5 py-1 rounded-lg">
                      {c.categoryName}
                    </span>
                  ))}
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
              <button onClick={() => router.back()} className="text-sm text-brand-gray/60 hover:text-brand-dark transition">
                Geri dön
              </button>
            </div>
          )}

          {!loading && !error && tour && (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
              {/* Main content */}
              <div className="space-y-6">
                {/* Gallery */}
                {images.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="aspect-[16/9] bg-gray-100">
                      <img
                        src={images[activeImage]?.url}
                        alt={tourName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {images.length > 1 && (
                      <div className="p-3 flex gap-2 overflow-x-auto">
                        {images.map((m, i) => (
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

                {/* General Info */}
                {details.generalInfo && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Tur Hakkında</h2>
                    <div
                      className="text-sm text-brand-gray/70 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: details.generalInfo }}
                    />
                  </div>
                )}

                {/* Day programs */}
                {programs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Gün Gün Program</h2>
                    <div className="space-y-4">
                      {programs.map((p: any, i: number) => (
                        <div key={p.id || i} className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {p.day || i + 1}
                          </div>
                          <div className="flex-1 pt-1.5">
                            {p.name && <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>}
                            {p.program && (
                              <div
                                className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: p.program }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inclusions/Exclusions */}
                {(details.servicesIncluded || details.servicesNotIncluded) && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {details.servicesIncluded && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Dahil Olanlar
                        </h2>
                        <div className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: details.servicesIncluded }} />
                      </div>
                    )}
                    {details.servicesNotIncluded && (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          Hariç Olanlar
                        </h2>
                        <div className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: details.servicesNotIncluded }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Departure stops */}
                {departureStops.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Kalkış Noktaları</h2>
                    <div className="space-y-2">
                      {departureStops.map((s: any, i: number) => (
                        <div key={s.id || i} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700 font-medium">{s.name}</span>
                          {s.time && <span className="text-brand-gray/50">{s.time}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancellation & Notes */}
                {(details.cancellationConditions || details.notes) && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    {details.cancellationConditions && (
                      <>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">İptal Koşulları</h2>
                        <div className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none mb-4" dangerouslySetInnerHTML={{ __html: details.cancellationConditions }} />
                      </>
                    )}
                    {details.notes && (
                      <>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">Notlar</h2>
                        <div className="text-sm text-brand-gray/60 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: details.notes }} />
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar - Booking */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                  {/* Steps */}
                  <div className="flex border-b border-gray-100">
                    {[
                      { id: "select", label: "Tarih & Fiyat" },
                      { id: "passengers", label: "Yolcular" },
                      { id: "done", label: "Onay" },
                    ].map((s, i) => {
                      const stepOrder = ["select", "passengers", "done"];
                      const currentIdx = stepOrder.indexOf(bookingStep);
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
                    {/* Step: Select date */}
                    {bookingStep === "select" && (
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-3">Tarih Seçin</h3>
                        {datesLoading ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                          </div>
                        ) : dates.length === 0 ? (
                          <p className="text-sm text-brand-gray/50 text-center py-4">
                            Uygun tarih bulunamadı.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 mb-4">
                            {dates.map((d, idx) => {
                              const remaining = d.quota - (d.sold || 0);
                              const isSelected = selectedDate === d;
                              const dateStr = formatDate(d.date);
                              // Get min valid price (> 0, not NaN) from list items or direct dpp
                              const options = Array.isArray(d.list) && d.list.length > 0 ? d.list : [d];
                              const validPrices = options
                                .map((o: any) => Number(o.dpp))
                                .filter((p: number) => !isNaN(p) && p > 0);
                              const minDpp = validPrices.length > 0 ? Math.min(...validPrices) : null;
                              const minCurrency = minDpp !== null
                                ? options.find((o: any) => Number(o.dpp) === minDpp)?.currency || "TRY"
                                : null;

                              // Skip dates with no valid price
                              if (minDpp === null) return null;

                              return (
                                <button
                                  key={idx}
                                  onClick={() => { setSelectedDate(d); setPriceResult(null); }}
                                  className={`w-full p-3 rounded-xl border-2 text-left transition ${isSelected ? "border-brand-red bg-brand-red/5" : "border-gray-100 hover:border-gray-200"}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900">{dateStr}</p>
                                      <p className="text-xs text-brand-gray/40 mt-0.5">
                                        Kalan: {remaining > 0 ? remaining : "—"} kişi
                                      </p>
                                      {options.length > 1 && (
                                        <p className="text-[10px] text-brand-gray/30 mt-0.5">{options.length} konaklama seçeneği</p>
                                      )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-lg font-bold text-brand-red">
                                        {minDpp.toLocaleString("tr-TR")}
                                      </p>
                                      <p className="text-[10px] text-brand-gray/40">{minCurrency} / kişi</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {selectedDate && (
                          <>
                            <div className="mb-4">
                              <label className="text-xs text-brand-gray/50 font-medium mb-1.5 block">Yetişkin Sayısı</label>
                              <div className="flex items-center gap-3">
                                <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-red hover:text-brand-red transition">-</button>
                                <span className="text-lg font-bold text-gray-900 w-8 text-center">{adults}</span>
                                <button onClick={() => setAdults(Math.min(6, adults + 1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-red hover:text-brand-red transition">+</button>
                              </div>
                            </div>

                            <button
                              onClick={handleCalculatePrice}
                              disabled={priceLoading}
                              className="w-full py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 text-sm disabled:opacity-50"
                            >
                              {priceLoading ? "Fiyat hesaplanıyor..." : "Fiyat Hesapla"}
                            </button>

                            {priceResult && (
                              <div className="mt-4 space-y-3">
                                {/* Display price options */}
                                {priceResult.price?.map((p: any, i: number) => (
                                  <div key={i} className="bg-brand-red/5 rounded-xl p-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-brand-gray/60">{p.title || "Fiyat"}</span>
                                      <span className="text-xl font-bold text-brand-red">
                                        {Number(p.price).toLocaleString("tr-TR")} {p.currency || "TRY"}
                                      </span>
                                    </div>
                                    {p.errorDescription && (
                                      <p className="text-xs text-red-500 mt-1">{p.errorDescription}</p>
                                    )}
                                  </div>
                                ))}

                                <button
                                  onClick={() => setBookingStep("passengers")}
                                  className="w-full py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 text-sm"
                                >
                                  Devam Et
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Step: Passengers */}
                    {bookingStep === "passengers" && (
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-3">Yolcu Bilgileri</h3>
                        <div className="space-y-4 mb-4 max-h-[280px] overflow-y-auto pr-1">
                          {passengers.map((p, i) => (
                            <div key={i} className="space-y-2 pb-3 border-b border-gray-50 last:border-0">
                              <p className="text-xs text-brand-gray/40 font-medium">Yolcu {i + 1}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input placeholder="Ad" value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition" />
                                <input placeholder="Soyad" value={p.surname} onChange={(e) => updatePassenger(i, "surname", e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input type="date" value={p.birthDate} onChange={(e) => updatePassenger(i, "birthDate", e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition" />
                                <select value={p.gender} onChange={(e) => updatePassenger(i, "gender", e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition">
                                  <option value="E">Erkek</option>
                                  <option value="K">Kadın</option>
                                </select>
                              </div>
                              <input placeholder="T.C. Kimlik No" value={p.tckn} onChange={(e) => updatePassenger(i, "tckn", e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition" />
                            </div>
                          ))}
                        </div>

                        <h3 className="font-bold text-gray-900 text-sm mb-3">İletişim Bilgileri</h3>
                        <div className="space-y-2 mb-5">
                          <input type="email" placeholder="E-posta" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition" />
                          <input type="tel" placeholder="Telefon" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition" />
                        </div>

                        {bookingError && (
                          <div className="bg-red-50 rounded-xl p-3 mb-3">
                            <p className="text-sm text-brand-red">{bookingError}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button onClick={() => setBookingStep("select")} className="flex-1 py-3 border border-gray-200 text-brand-gray/60 font-medium rounded-xl hover:bg-gray-50 transition text-sm">Geri</button>
                          <button onClick={handleBook} disabled={!canBook || bookingLoading} className="flex-[2] py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 text-sm disabled:opacity-50">
                            {bookingLoading ? "Rezervasyon yapılıyor..." : "Rezervasyon Yap"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step: Done */}
                    {bookingStep === "done" && bookingResult && (
                      <div className="text-center py-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Rezervasyon Tamamlandı</h3>
                        <p className="text-sm text-brand-gray/60 mb-1">PNR Kodu:</p>
                        <p className="text-2xl font-bold text-brand-red mb-4 font-mono">{bookingResult.pnr || "—"}</p>
                        {bookingResult.saleID && (
                          <p className="text-xs text-brand-gray/40 mb-5">Satış No: {bookingResult.saleID}</p>
                        )}
                        <button onClick={() => router.push("/")} className="w-full py-3 bg-brand-dark text-white font-semibold rounded-xl hover:bg-brand-dark/90 transition text-sm">
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

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
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
          <div className="h-12 bg-gray-100 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
