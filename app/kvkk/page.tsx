import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function KVKKPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">KVKK Aydinlatma Metni</h1>

          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
            <p className="text-sm text-gray-400 mb-6">Son guncelleme: 26 Mart 2026</p>

            <p className="text-gray-600 leading-relaxed mb-6">
              6698 sayili Kisisel Verilerin Korunmasi Kanunu (&quot;KVKK&quot;) kapsaminda, veri sorumlusu
              sifatiyla X Travel olarak kisisel verilerinizin islenmesine iliskin sizi bilgilendirmek istiyoruz.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. Veri Sorumlusu</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Kisisel verileriniz, veri sorumlusu sifatiyla X Travel tarafindan asagida aciklanan
              amaclar cercevesinde islenmektedir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. Islenen Kisisel Veriler</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarasi, dogum tarihi</li>
              <li><strong>Iletisim Bilgileri:</strong> E-posta, telefon numarasi, adres</li>
              <li><strong>Islem Guvenligi:</strong> IP adresi, cerez kayitlari, oturum bilgileri</li>
              <li><strong>Finansal Bilgiler:</strong> Odeme bilgileri, fatura bilgileri</li>
              <li><strong>Musteri Islem Bilgileri:</strong> Rezervasyon gecmisi, tercihler</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. Isleme Amaclari</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Seyahat ve rezervasyon hizmetlerinin sunulmasi</li>
              <li>Sozlesmesel yukumluluklerin yerine getirilmesi</li>
              <li>Yasal yukumluluklere uyum saglanmasi</li>
              <li>Musteri memnuniyetinin olculmesi ve iyilestirilmesi</li>
              <li>Bilgi guvenligi sureclerinin yurutulmesi</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. Verilerin Aktarilmasi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Kisisel verileriniz; rezervasyon hizmetlerinin saglanmasi amaciyla havayollari,
              oteller, transfer sirketleri ve tur operatorleri ile; yasal zorunluluklar
              kapsaminda yetkili kamu kurum ve kuruluslari ile paylasilabilir.
            </p>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. Veri Sahibi Haklari</h2>
            <p className="text-gray-600 leading-relaxed mb-3">KVKK&apos;nin 11. maddesi kapsaminda asagidaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Kisisel verilerinizin islenip islenmedigini ogrenme</li>
              <li>Islenmisse buna iliskin bilgi talep etme</li>
              <li>Isleme amacini ve amacina uygun kullanilip kullanilmadigini ogrenme</li>
              <li>Yurt icinde veya yurt disinda aktarildigi ucuncu kisileri bilme</li>
              <li>Eksik veya yanlis islenmisse duzeltilmesini isteme</li>
              <li>KVKK&apos;nin 7. maddesinde ongorulen sartlar cercevesinde silinmesini isteme</li>
              <li>Islenen verilerin munhasiran otomatik sistemler araciligiyla analiz edilmesi
                suretiyle aleyhinize bir sonucun ortaya cikmasina itiraz etme</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. Basvuru</h2>
            <p className="text-gray-600 leading-relaxed">
              Haklarinizi kullanmak icin <strong>info@myxtravel.com.tr</strong> adresine e-posta
              gonderebilir veya iletisim sayfamiz uzerinden basvurabilirsiniz.
              Basvurulariniz en gec 30 gun icinde yanitlanacaktir.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
