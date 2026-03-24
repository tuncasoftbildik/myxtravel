"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ReservasyonPage() {
  return (
    <Suspense fallback={
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    }>
      <ReservasyonContent />
    </Suspense>
  );
}

function ReservasyonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hotelCode = searchParams.get("hotelCode") || "";
  const hotelName = searchParams.get("hotelName") || "";
  const roomCode = searchParams.get("roomCode") || "";
  const roomName = searchParams.get("roomName") || "";
  const boardName = searchParams.get("boardName") || "";
  const totalAmount = searchParams.get("totalAmount") || "0";
  const currency = searchParams.get("currency") || "TRY";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = searchParams.get("adults") || "2";
  const nights = searchParams.get("nights") || "2";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tcNo: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone) return;
    setSubmitting(true);
    // Simulate booking — in production this would call the TravelRobot booking API
    await new Promise((r) => setTimeout(r, 2000));
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Rezervasyon Talebiniz Alindi</h1>
            <p className="text-sm text-gray-500 mb-1">{hotelName}</p>
            <p className="text-sm text-gray-500 mb-4">{roomName} &middot; {checkIn} - {checkOut}</p>
            <p className="text-xs text-gray-400 mb-6">
              Rezervasyon detaylariniz e-posta adresinize gonderilecektir. En kisa surede sizinle iletisime gecilegiz.
            </p>
            <button
              onClick={() => router.push("/otel")}
              className="px-6 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Otellere Don
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
            <button onClick={() => router.push("/otel")} className="hover:text-blue-600 transition">Oteller</button>
            <span>/</span>
            <button onClick={() => router.back()} className="hover:text-blue-600 transition">{hotelName}</button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Rezervasyon</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left — Guest form */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-5">Misafir Bilgileri</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ad *</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        placeholder="Adiniz"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Soyad *</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        placeholder="Soyadiniz"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">T.C. Kimlik No</label>
                    <input
                      type="text"
                      value={form.tcNo}
                      onChange={(e) => update("tcNo", e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                      placeholder="11 haneli T.C. kimlik numaraniz"
                      maxLength={11}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">E-posta *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Telefon *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ozel Istekler</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition resize-none"
                      placeholder="Ozel isteklerinizi buraya yazabilirsiniz..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-brand-red text-white text-sm font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Rezervasyon yapiliyor...
                      </>
                    ) : (
                      "Rezervasyonu Tamamla"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right — Booking summary */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Rezervasyon Ozeti</h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-bold text-gray-900">{hotelName}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{roomName}</p>
                  </div>

                  {boardName && (
                    <span className="inline-block text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      {boardName}
                    </span>
                  )}

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Giris</span>
                      <span className="font-medium text-gray-900">{checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cikis</span>
                      <span className="font-medium text-gray-900">{checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sure</span>
                      <span className="font-medium text-gray-900">{nights} gece</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Misafir</span>
                      <span className="font-medium text-gray-900">{adults} yetiskin</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-500">Toplam</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {currency} {Number(totalAmount).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right mt-0.5">Vergiler dahil</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
