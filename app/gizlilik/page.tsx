import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function GizlilikPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Gizlilik Politikasi</h1>

          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm prose prose-gray max-w-none">
            <p className="text-sm text-gray-400 mb-6">Son guncelleme: 26 Mart 2026</p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. Genel Bakis</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              X Travel olarak kisisel verilerinizin guvenligine onem veriyoruz. Bu gizlilik politikasi,
              web sitemizi ve hizmetlerimizi kullanirken toplanan, islenen ve saklanan kisisel verileriniz
              hakkinda sizi bilgilendirmek amaci ile hazirlanmistir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. Toplanan Veriler</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Hizmetlerimizi kullanirken asagidaki veriler toplanabilir:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Ad, soyad ve iletisim bilgileri</li>
              <li>E-posta adresi ve telefon numarasi</li>
              <li>Rezervasyon ve seyahat bilgileri</li>
              <li>Odeme bilgileri</li>
              <li>IP adresi ve tarayici bilgileri</li>
              <li>Cerez verileri</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. Verilerin Kullanimi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Toplanan veriler asagidaki amaclarla kullanilmaktadir:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Rezervasyon ve seyahat hizmetlerinin saglanmasi</li>
              <li>Musteri hizmetleri ve destek</li>
              <li>Hizmet kalitesinin iyilestirilmesi</li>
              <li>Yasal yukumluluklerin yerine getirilmesi</li>
              <li>Pazarlama iletisimleri (onayiniz dahilinde)</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. Veri Guvenligi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Kisisel verileriniz SSL sifreleme, guvenlik duvarlari ve erisim kontrolleri
              ile korunmaktadir. Verilerinize yalnizca yetkili personel erisebilir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. Ucuncu Taraflarla Paylasim</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Kisisel verileriniz, rezervasyon hizmetlerinin saglanmasi icin gerekli olan
              havayollari, oteller ve transfer sirketleri ile paylasilabilir.
              Verileriniz pazarlama amacli ucuncu taraflarla paylasilmaz.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. Haklariniz</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              KVKK kapsaminda kisisel verilerinize erisim, duzeltme, silme ve islenmesini
              kisitlama hakkina sahipsiniz. Bu haklarinizi kullanmak icin
              <strong> info@myxtravel.com.tr</strong> adresinden bize ulasabilirsiniz.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">7. Iletisim</h2>
            <p className="text-gray-600 leading-relaxed">
              Gizlilik politikamiz hakkinda sorulariniz icin <strong>info@myxtravel.com.tr</strong> adresinden
              bize ulasabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
