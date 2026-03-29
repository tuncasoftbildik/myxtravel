import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BreadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Iletisim | X Travel",
  description: "X Travel iletisim bilgileri. Sorulariniz ve destekleriniz icin bize ulasin.",
  alternates: { canonical: "https://xturizm.com/iletisim" },
  openGraph: {
    title: "Iletisim | X Travel",
    description: "X Travel iletisim bilgileri. Bize ulasin.",
    url: "https://xturizm.com/iletisim",
    siteName: "X Travel",
    locale: "tr_TR",
    type: "website",
  },
};

export default function IletisimPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Ana Sayfa", url: "https://xturizm.com" }, { name: "Iletisim", url: "https://xturizm.com/iletisim" }]} />
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Iletisim</h1>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Bize Ulasin</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">E-posta</p>
                    <p className="text-sm text-gray-500">info@myxtravel.com.tr</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Telefon</p>
                    <p className="text-sm text-gray-500">+90 (212) 000 00 00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Adres</p>
                    <p className="text-sm text-gray-500">Istanbul, Turkiye</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Calisma Saatleri</h2>
              <div className="space-y-3">
                {[
                  { day: "Pazartesi - Cuma", hours: "09:00 - 18:00" },
                  { day: "Cumartesi", hours: "10:00 - 16:00" },
                  { day: "Pazar", hours: "Kapali" },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{item.day}</span>
                    <span className="text-sm font-medium text-gray-900">{item.hours}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-brand-red/5 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong className="text-brand-red">7/24 Destek:</strong> Rezervasyon sonrasi acil durumlar icin
                  musteri hizmetlerimiz her zaman yaninizdadir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
