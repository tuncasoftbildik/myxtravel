import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Kullanim Kosullari | X Travel",
  description: "X Travel web sitesi kullanim kosullari ve sartlari.",
  alternates: { canonical: "https://xturizm.com/kullanim-kosullari" },
};

export default function KullanimKosullariPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Kullanim Kosullari</h1>

          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
            <p className="text-sm text-gray-400 mb-6">Son guncelleme: 26 Mart 2026</p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. Genel Hukumler</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Bu web sitesini kullanarak asagidaki kullanim kosullarini kabul etmis sayilirsiniz.
              X Travel, bu kosullari onceden haber vermeksizin degistirme hakkini sakli tutar.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. Hizmet Tanimi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              X Travel, ucak bileti, otel rezervasyonu, transfer ve tur hizmetleri sunan
              bir online seyahat platformudur. Platformumuz araciligi ile yapilan
              rezervasyonlar, ilgili hizmet saglayicilarin sartlarina tabidir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. Uyelik</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Uyelik olusturarak verdigniz bilgilerin dogru ve guncel oldugunu taahhut edersiniz.
              Hesap guvenliginizden siz sorumlusunuz. Sifrenizi baskasyla paylasmamaniz onerilir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. Rezervasyon ve Iptal</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Rezervasyonlar, ilgili hizmet saglayicinin iptal kosullarina tabidir.</li>
              <li>Iptal ve iade islemleri ilgili hizmet saglayicinin politikalari cercevesinde yapilir.</li>
              <li>Bazi ozel fiyatli urunlerde iptal ve iade mumkun olmayabilir.</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. Fiyatlandirma</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Gosterilen fiyatlar musaitlik durumuna gore degisebilir.
              Rezervasyon tamamlanana kadar fiyat degisiklikleri olabilir.
              Tum fiyatlar Turk Lirasi cinsinden ve vergiler dahil gosterilmektedir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. Sorumluluk Sinirlamasi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              X Travel, hizmet saglayicilarin (havayollari, oteller, transfer sirketleri)
              neden oldugu aksaklik, gecikme veya iptallerden sorumlu degildir.
              Bu durumlar ilgili hizmet saglayicinin sorumlulugundadir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">7. Fikri Mulkiyet</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Bu web sitesindeki tum icerik, tasarim, logo ve gorseller X Travel&apos;a aittir.
              Izinsiz kopyalanmasi, cogaltilmasi veya dagitilmasi yasaktir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">8. Uygulanacak Hukuk</h2>
            <p className="text-gray-600 leading-relaxed">
              Bu kullanim kosullari Turkiye Cumhuriyeti kanunlarina tabidir.
              Uyusmazliklarda Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
