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
- **Supabase** — Auth, PostgreSQL veritabanı
- **TravelRobot API** — 6 servis, 49+ endpoint

## Özellikler

- Uçak bileti arama ve karşılaştırma
- Otel arama, detay görüntüleme ve Google Maps entegrasyonu
- Transfer hizmeti arama
- Tur paketleri arama ve detay görüntüleme
- Rezervasyon sayfası (misafir bilgileri formu)
- Kampanya carousel (admin tarafından yönetilebilir)
- Havayolu logoları marquee (admin tarafından yönetilebilir)
- Hero navigasyon kartları (animasyonlu)
- Admin paneli (içerik, kampanya, logo yönetimi)
- Supabase Auth ile kullanıcı giriş/kayıt
- Mobile-first responsive tasarım
- BFF (Backend for Frontend) mimarisi
- Token yönetimi ile otomatik yenileme

## Admin Paneli

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| İçerik | `/admin/icerik` | Ana sayfa hero yazıları |
| Kampanyalar | `/admin/kampanyalar` | Kampanya ekleme/düzenleme/silme |
| Logolar | `/admin/logolar` | Havayolu logoları yönetimi |

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

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Supabase migration dosyalarını çalıştır:

```bash
# Supabase Dashboard > SQL Editor'da sırasıyla çalıştırın:
supabase/migrations/001_promotions.sql
supabase/migrations/002_site_settings.sql
supabase/migrations/003_airline_logos.sql
```

```bash
npm run dev
```

## Proje Yapısı

```
app/
├── api/
│   ├── flights/search/    # Uçuş arama API
│   ├── hotels/             # Otel arama, detay, oda API
│   ├── tours/              # Tur arama, detay, fiyat, rezervasyon API
│   ├── transfer/search/    # Transfer arama API
│   ├── promotions/         # Kampanya CRUD API
│   ├── airlines/           # Havayolu logoları CRUD API
│   └── settings/           # Site ayarları API
├── admin/
│   ├── icerik/            # İçerik yönetimi
│   ├── kampanyalar/       # Kampanya yönetimi
│   └── logolar/           # Logo yönetimi
├── ucus/                  # Uçuş sonuç sayfası
├── otel/                  # Otel sonuç & detay sayfaları
├── tur/                   # Tur sonuç & detay sayfaları
├── transfer/              # Transfer sonuç sayfası
├── rezervasyon/           # Rezervasyon formu
├── giris/                 # Giriş sayfası
└── kayit/                 # Kayıt sayfası

components/
├── search-forms/          # Arama formları
├── header.tsx             # Navigasyon
├── footer.tsx             # Alt bilgi
├── hero-section.tsx       # Ana sayfa hero (navigasyon kartları)
├── promotions-carousel.tsx # Kampanya carousel
├── airline-marquee.tsx    # Havayolu logoları marquee
├── search-tabs.tsx        # Arama sekmeleri
└── features.tsx           # Özellikler bölümü

lib/
├── supabase/              # Supabase client (server & client)
└── travelrobot/
    ├── client.ts          # API client (wrapper/token yönetimi)
    ├── config.ts          # Konfigürasyon
    ├── token-manager.ts   # Token oluşturma & cache
    └── services/          # Servis modülleri (air, hotel, tour, transfer, general)

supabase/migrations/
├── 001_promotions.sql     # Kampanyalar tablosu
├── 002_site_settings.sql  # Site ayarları tablosu
└── 003_airline_logos.sql  # Havayolu logoları tablosu
```

## Lisans

Bu proje özel ve gizlidir. Tüm hakları saklıdır.
