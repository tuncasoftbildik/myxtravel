<p align="center">
  <img src="public/logo.png" alt="X Travel" width="180" />
</p>

<h1 align="center">X Travel</h1>
<p align="center"><strong>Live Your Dream</strong></p>
<p align="center">Uçak, otel, transfer ve tur — tek platformda karşılaştır, en uygun fiyatla rezerve et.</p>

---

## Teknolojiler

- **Next.js 16** (App Router, Turbopack)
- **React 19** & **TypeScript 5**
- **Tailwind CSS 4**
- **TravelRobot API** — 6 servis, 49+ endpoint

## Özellikler

- Uçak bileti arama ve karşılaştırma
- Otel arama ve fiyat karşılaştırma
- Transfer hizmeti arama
- Tur paketleri arama ve detay görüntüleme
- Mobile-first responsive tasarım
- BFF (Backend for Frontend) mimarisi
- Token yönetimi ile otomatik yenileme

## Kurulum

```bash
git clone https://github.com/tuncasoftbildik/X.git
cd X
npm install
```

`.env.local` dosyası oluştur:

```
TRAVELROBOT_API_URL=http://sandbox.kplus.com.tr/kplus/v0
TRAVELROBOT_CHANNEL_CODE=your_channel_code
TRAVELROBOT_CHANNEL_PASSWORD=your_channel_password
```

```bash
npm run dev
```

## Proje Yapısı

```
app/
├── api/
│   ├── flights/search/    # Uçuş arama API
│   ├── hotels/search/     # Otel arama API
│   ├── tours/search/      # Tur arama API
│   ├── tours/details/     # Tur detay API
│   └── transfer/search/   # Transfer arama API
├── ucus/                  # Uçuş sonuç sayfası
├── otel/                  # Otel sonuç sayfası
├── tur/                   # Tur sonuç & detay sayfaları
└── transfer/              # Transfer sonuç sayfası

components/
├── search-forms/          # Arama formları
├── header.tsx             # Navigasyon
├── footer.tsx             # Alt bilgi
└── search-tabs.tsx        # Ana sayfa arama sekmeleri

lib/travelrobot/
├── client.ts              # API client (wrapper/token yönetimi)
├── config.ts              # Konfigürasyon
├── token-manager.ts       # Token oluşturma & cache
└── services/              # Servis modülleri (air, hotel, tour, transfer, general)
```

## Lisans

Bu proje özel ve gizlidir. Tüm hakları saklıdır.
