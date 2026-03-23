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

  useEffect(() => {
    const pickUpLat = searchParams.get("pickUpLat");
    const pickUpLng = searchParams.get("pickUpLng");
    const dropOffLat = searchParams.get("dropOffLat");
    const dropOffLng = searchParams.get("dropOffLng");

    if (!pickUpLat || !pickUpLng || !dropOffLat || !dropOffLng || !date || !time) {
      setError("Arama bilgileri eksik");
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
  }, [searchParams, date, time, passengers]);

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
                {!loading && !error && (
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
    <div className="grid gap-4 sm:gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-48 h-36 sm:h-40 bg-gray-100" />
            <div className="flex-1 p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-lg w-20" />
                <div className="h-6 bg-gray-100 rounded-lg w-28" />
              </div>
              <div className="h-5 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
            <div className="sm:w-48 p-5 bg-gray-50/50 flex flex-col items-end justify-center gap-3">
              <div className="h-8 bg-gray-100 rounded w-24" />
              <div className="h-10 bg-gray-100 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
