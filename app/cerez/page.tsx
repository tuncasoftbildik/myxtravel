import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Cerez Politikasi | X Travel",
  description: "X Travel cerez (cookie) kullanim politikasi hakkinda bilgilendirme.",
  alternates: { canonical: "https://xturizm.com/cerez" },
};

export default function CerezPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Cerez Politikasi</h1>

          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
            <p className="text-sm text-gray-400 mb-6">Son guncelleme: 26 Mart 2026</p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Cerez Nedir?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cerezler, web sitemizi ziyaret ettiginizde tarayiciniza yerlestirilen kucuk
              metin dosyalaridir. Bu dosyalar, sizi tanimamiza ve size daha iyi bir deneyim
              sunmamiza yardimci olur.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Kullandigimiz Cerez Turleri</h2>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Zorunlu Cerezler</h3>
                <p className="text-sm text-gray-500">
                  Web sitesinin duzgun calismasini saglayan temel cerezlerdir.
                  Oturum yonetimi, guvenlik ve temel islevler icin gereklidir.
                </p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Performans Cerezleri</h3>
                <p className="text-sm text-gray-500">
                  Ziyaretcilerin siteyi nasil kullandigini anlamamiza yardimci olur.
                  Sayfa goruntulenmeleri, ziyaret suresi gibi anonim veriler toplanir.
                </p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Islevsellik Cerezleri</h3>
                <p className="text-sm text-gray-500">
                  Dil tercihi, bolge secimi gibi kisisellestirme ayarlarinizi hatirlar.
                  Daha iyi bir kullanici deneyimi icin kullanilir.
                </p>
              </div>

              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Pazarlama Cerezleri</h3>
                <p className="text-sm text-gray-500">
                  Size ilgi alanlariniza uygun reklamlar gostermek icin kullanilir.
                  Ucuncu taraf reklam aglari tarafindan yerlestirilir.
                </p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Cerezleri Yonetme</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Tarayici ayarlarinizdan cerezleri silebilir veya engelleyebilirsiniz.
              Ancak cerezleri devre disi birakmaniz, web sitemizdeki bazi ozelliklerin
              duzgun calismamamsina neden olabilir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">Iletisim</h2>
            <p className="text-gray-600 leading-relaxed">
              Cerez politikamiz hakkinda sorulariniz icin <strong>info@myxtravel.com.tr</strong> adresinden
              bize ulasabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
