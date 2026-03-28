"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface Transfer {
  resultKey: string;
  name: string;
  vehicleName: string;
  vehicleType: string;
  vehicleClass: string;
  vehicleCapacity: number;
  vehicleImage: string | null;
  provider: string;
  duration: string;
  price: {
    total: number;
    currency: string;
    base: number;
    discount: number;
  };
}

export default function TransferPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <TransferContent />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] pt-8 pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-8 bg-white/10 rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12">
          <LoadingSkeleton />
        </div>
      </main>
      <Footer />
    </>
  );
}

function TransferLanding() {
  const router = useRouter();
  const [pickUp, setPickUp] = useState("");
  const [dropOff, setDropOff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [passengers, setPassengers] = useState("2");

  const popularRoutes = [
    { title: "Havalimanı → Otel", subtitle: "Kapıda karşılama ile", icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
    )},
    { title: "Otel → Havalimanı", subtitle: "Zamanında ulaşım garantisi", icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    )},
    { title: "Şehirler Arası", subtitle: "Konforlu uzun mesafe", icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
    )},
    { title: "Kruvaziyer Limanı", subtitle: "Liman transferleri", icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17h1l1-5h14l1 5h1M5 17l-2 4h18l-2-4M12 3v4m-4 0h8M8 7L6 12m10-5l2 5" /></svg>
    )},
    { title: "VIP Transfer", subtitle: "Lüks araçlarla", icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
    )},
    { title: "Grup Transferi", subtitle: "Büyük araçlar & otobüsler", icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    )},
  ];

  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        {/* Hero banner */}
        <div className="relative bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-[20%] w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[10%] w-48 h-48 bg-fuchsia-500/8 rounded-full blur-[80px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20 sm:pt-14 sm:pb-24 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">Transfer</h1>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
              Havalimanı ve şehir içi özel transfer hizmeti
            </p>
          </div>
        </div>

        {/* Search form card */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-5 sm:p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Alınış Noktası</label>
                <input
                  type="text"
                  placeholder="Havalimanı, otel, adres..."
                  value={pickUp}
                  onChange={(e) => setPickUp(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Bırakılış Noktası</label>
                <input
                  type="text"
                  placeholder="Otel, havalimanı, adres..."
                  value={dropOff}
                  onChange={(e) => setDropOff(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Saat</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-gray/60 mb-1.5 uppercase tracking-wide">Yolcu</label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                  >
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n}>{n} Yolcu</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (!pickUp || !dropOff || !date) return;
                const params = new URLSearchParams({
                  pickUpName: pickUp,
                  dropOffName: dropOff,
                  date,
                  time,
                  passengers,
                });
                router.push(`/transfer?${params.toString()}`);
              }}
              className="w-full mt-5 px-6 py-3.5 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 hover:shadow-brand-red/30 text-sm sm:text-base"
            >
              Transfer Ara
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Kapıda Karşılama",
                desc: "Şoförünüz sizi isim tabelası ile karşılar",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                color: "#10b981",
              },
              {
                title: "Sabit Fiyat Garantisi",
                desc: "Trafik veya mesafe farkı olmadan sabit fiyat",
                icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
                color: "#6366f1",
              },
              {
                title: "Ücretsiz İptal",
                desc: "24 saat öncesine kadar ücretsiz iptal hakkı",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                color: "#f59e0b",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                  <svg className="w-5 h-5" style={{ color: item.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* spacer between sections */}
        <div className="py-4" />

        {/* Trust badges */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Neden X Travel Transfer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Profesyonel sürücüler",
                desc: "Lisanslı ve deneyimli sürücülerle güvenli yolculuk",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                title: "Geniş araç filosu",
                desc: "Sedan'dan VIP minibüse kadar her ihtiyaca uygun araç",
                icon: "M8 17h.01M16 17h.01M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.4L21 11M3 11v6a1 1 0 001 1h1m16-7v6a1 1 0 01-1 1h-1M3 11h18",
              },
              {
                title: "7/24 destek",
                desc: "Transfer öncesi ve sonrası kesintisiz müşteri desteği",
                icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-5 bg-red-50/50 rounded-2xl border border-red-100/50"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function TransferContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const pickUpName = searchParams.get("pickUpName");
  const dropOffName = searchParams.get("dropOffName");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const passengers = searchParams.get("passengers") || "2";

  // If no search params, show landing page
  const pickUpLat = searchParams.get("pickUpLat");
  const pickUpLng = searchParams.get("pickUpLng");
  const dropOffLat = searchParams.get("dropOffLat");
  const dropOffLng = searchParams.get("dropOffLng");

  const hasSearchParams = pickUpLat && pickUpLng && dropOffLat && dropOffLng && date && time;

  useEffect(() => {
    if (!hasSearchParams) {
      setLoading(false);
      return;
    }

    async function fetchTransfers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/transfer/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickUp: { lat: Number(pickUpLat), lng: Number(pickUpLng) },
            dropOff: { lat: Number(dropOffLat), lng: Number(dropOffLng) },
            date,
            time,
            passengers: Number(passengers),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Arama başarısız");
        setTransfers(data.transfers);
        setCount(data.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    fetchTransfers();
  }, [searchParams, date, time, passengers, hasSearchParams, pickUpLat, pickUpLng, dropOffLat, dropOffLng]);

  if (!hasSearchParams) {
    return <TransferLanding />;
  }

  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        {/* Hero banner */}
        <div className="relative bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-[20%] w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[10%] w-48 h-48 bg-fuchsia-500/8 rounded-full blur-[80px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-14 sm:pt-10 sm:pb-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Transfer Arama</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {pickUpName && dropOffName ? (
                    <>{pickUpName} <span className="text-white/40 mx-2">→</span> {dropOffName}</>
                  ) : (
                    "Transfer Sonuçları"
                  )}
                </h1>
                {loading ? (
                  <p className="text-sm text-white/50 mt-2">Transferler aranıyor...</p>
                ) : !error && (
                  <p className="text-sm text-white/50 mt-2">
                    <span className="text-white/80 font-semibold">{count}</span> transfer bulundu
                    {date && <> &middot; {date} {time}</>}
                    <> &middot; {passengers} yolcu</>
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl transition font-medium backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Yeni Arama
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-12 sm:pb-16">
          {loading && <LoadingSkeleton />}

          {error && <ErrorCard message={error} onBack={() => router.push("/")} />}

          {!loading && !error && transfers.length === 0 && (
            <EmptyState message="Bu güzergah için transfer bulunamadı." onBack={() => router.push("/")} />
          )}

          {!loading && !error && transfers.length > 0 && (
            <div className="grid gap-4 sm:gap-5">
              {transfers.map((t, i) => (
                <TransferCard key={t.resultKey || i} transfer={t} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function TransferCard({ transfer }: { transfer: Transfer }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {transfer.vehicleImage && (
          <div className="sm:w-48 h-36 sm:h-auto bg-gray-50 flex-shrink-0 flex items-center justify-center p-4 overflow-hidden">
            <img src={transfer.vehicleImage} alt={transfer.vehicleName} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}

        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {transfer.vehicleClass && (
              <span className="text-xs bg-gradient-to-r from-brand-red/10 to-brand-red/5 text-brand-red px-2.5 py-1 rounded-lg font-semibold">
                {transfer.vehicleClass}
              </span>
            )}
            {transfer.vehicleCapacity && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                Max {transfer.vehicleCapacity} yolcu
              </span>
            )}
            {transfer.duration && (
              <span className="text-xs text-brand-gray/50 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{transfer.duration}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-brand-dark transition-colors">
            {transfer.vehicleName || transfer.name}
          </h3>

          {transfer.provider && (
            <p className="text-sm text-brand-gray/60">{transfer.provider}</p>
          )}
          {transfer.vehicleType && (
            <p className="text-xs text-brand-gray/40 mt-1">{transfer.vehicleType}</p>
          )}
        </div>

        <div className="sm:w-48 p-4 sm:p-5 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 bg-gradient-to-b from-gray-50/50 to-gray-50">
          <div className="text-right">
            {transfer.price.discount > 0 && (
              <p className="text-xs text-brand-gray/40 line-through">
                {transfer.price.base?.toLocaleString("tr-TR")} {transfer.price.currency}
              </p>
            )}
            <p className="text-2xl sm:text-3xl font-bold text-brand-red">
              {transfer.price.total?.toLocaleString("tr-TR")}
            </p>
            <p className="text-xs text-brand-gray/50 font-medium">{transfer.price.currency}</p>
          </div>
          <button className="mt-0 sm:mt-4 px-6 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-sm shadow-brand-red/20 hover:shadow-brand-red/30">
            Seç
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-brand-red font-semibold mb-2">{message}</p>
      <button onClick={onBack} className="text-sm text-brand-gray/60 hover:text-brand-dark transition">Ana sayfaya dön</button>
    </div>
  );
}

function EmptyState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-gray/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-brand-gray/60 text-lg mb-2">{message}</p>
      <button onClick={onBack} className="text-sm text-brand-red hover:text-red-700 font-medium transition">Farklı güzergah dene</button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-5 h-5 border-2 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
        <p className="text-sm text-brand-gray/50">Transferler aranıyor...</p>
      </div>
      <div className="grid gap-4 sm:gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10" />
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-48 h-36 sm:h-40 bg-gray-100/80" />
              <div className="flex-1 p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100/80 rounded-lg w-20" />
                  <div className="h-6 bg-gray-100/80 rounded-lg w-28" />
                </div>
                <div className="h-5 bg-gray-100/80 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="sm:w-48 p-5 bg-gray-50/50 flex flex-col items-end justify-center gap-3">
                <div className="h-8 bg-gray-100/80 rounded w-24" />
                <div className="h-10 bg-gray-100 rounded-xl w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
