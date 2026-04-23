# Acenta Kendi Ürünleri — Tasarım Dokümanı

**Tarih:** 2026-04-23
**Durum:** Onay bekliyor
**Kapsam:** MVP — Transfer + Tur

## Amaç

Acentayı yalnızca bir tedarikçi reseller'ından çıkarıp kendi ürünlerini (transfer ve tur) panelinden oluşturup satışa sunabilecek hâle getirmek. Müşteri, acentanın white-label domain'inden bu ürünleri görür ve rezervasyon talebi bırakır; ödeme ve takip platform dışında, acenta ile müşteri arasında yürür.

## Karar Özeti

| # | Konu | Karar |
|---|------|-------|
| 1 | Kapsam | Transfer + tur (otel/araç/otobüs sonraki faz için mimari hazır) |
| 2 | Görünürlük | Sadece acentanın kendi white-label domain'i |
| 3 | Komisyon | Platform komisyon **almıyor** — kendi ürünü saf acenta işidir |
| 4 | Moderasyon | Tamamen serbest; admin devrede değil |
| 5 | Ödeme | Rezervasyon talebi akışı; online ödeme yok |
| 6 | Kontenjan | Basit (fiyat + "talep üzerine müsait"); tarih zorunlu değil |
| 7 | Veri modeli | Tek generic `agency_products` tablosu + `details jsonb` |
| 8 | Listelemede supplier ile birleşim | Acenta ürünleri üstte "öne çıkan" section, altta supplier sonuçları |

## Mimari Genel Bakış

Mevcut: supplier API (TravelRobot / K+ / A2Tours) ürünleri → `/api/tours/search`, `/api/transfer/search` üzerinden listelenir, markup ile satılır.

Yeni: `agency_products` tablosu → acentanın kendi domain'inde **ayrı bir section** olarak listelenir → müşteri rezervasyon talebi bırakır → acenta panelinden işler.

## Veri Modeli

### Migration: `supabase/migrations/009_agency_products.sql`

```sql
create table if not exists agency_products (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid not null references agencies(id) on delete cascade,
  service_type text not null check (service_type in ('transfer','tour','hotel','car','bus')),

  title text not null,
  slug text,
  short_description text default '',
  description text default '',
  photos text[] default '{}',
  cover_photo text default '',

  price decimal(10,2) not null,
  currency text not null default 'TRY',
  price_note text default '',

  details jsonb default '{}'::jsonb,

  is_active boolean default true,
  display_order int default 0,
  deleted_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(agency_id, slug)
);

create index agency_products_agency_active_idx
  on agency_products (agency_id, is_active, service_type)
  where deleted_at is null;

create table if not exists agency_product_requests (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid not null references agencies(id) on delete cascade,
  product_id uuid not null references agency_products(id) on delete cascade,

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,

  requested_date date,
  passenger_count int default 1,
  notes text default '',

  status text not null default 'new'
    check (status in ('new','contacted','confirmed','cancelled','completed')),
  agency_notes text default '',

  ip_address text,
  user_agent text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index agency_product_requests_agency_status_idx
  on agency_product_requests (agency_id, status, created_at desc);
```

### RLS Politikaları

- **agency_products**
  - `Public read active` — `is_active = true and deleted_at is null`
  - `Agency manage own` — `agency_id in (select agency_id from agency_users where user_id = auth.uid())`
  - `Admin manage all` — `exists (select 1 from user_roles where user_id = auth.uid() and role in ('admin','super_admin'))`
- **agency_product_requests**
  - `Public create` — `insert` herkes yapabilir
  - `Agency read/update own` — aynı `agency_users` kuralı
  - `Admin manage all` — aynı admin kuralı

### `details` JSONB Şeması (TypeScript ile disipline)

```ts
// lib/agency-products/types.ts
type BaseProduct = {
  id: string;
  agency_id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  photos: string[];
  cover_photo: string;
  price: number;
  currency: string;
  price_note: string;
  is_active: boolean;
  display_order: number;
};

type TransferDetails = {
  from_location: string;
  to_location: string;
  vehicle_type: "sedan" | "minivan" | "minibus" | "bus";
  max_passengers: number;
  duration_minutes?: number;
  includes?: string[];
  round_trip?: boolean;
};

type TourDetails = {
  duration_days: number;
  duration_nights: number;
  departure_point?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  meeting_point?: string;
  languages?: string[];
};

type AgencyProduct =
  | (BaseProduct & { service_type: "transfer"; details: TransferDetails })
  | (BaseProduct & { service_type: "tour"; details: TourDetails });
```

## API Yüzeyi

### Acenta (auth gerekli; Supabase cookie session)

| Endpoint | Metot | Amaç |
|----------|-------|------|
| `/api/agency/products` | GET | Acentanın ürün listesi (soft-delete'leri hariç) |
| `/api/agency/products` | POST | Yeni ürün |
| `/api/agency/products/[id]` | GET | Tek ürün detay |
| `/api/agency/products/[id]` | PATCH | Düzenle |
| `/api/agency/products/[id]` | DELETE | Soft-delete (`deleted_at` set) |
| `/api/agency/bookings` | GET | Rezervasyon talepleri (`?status=new,contacted,...`) |
| `/api/agency/bookings/[id]` | PATCH | `status`, `agency_notes` güncelle |

### Public (auth yok; middleware `x-agency-domain` header ile acentayı çözümler)

Public endpoint'ler `x-agency-domain` header'ı yoksa (yani ana domain'den çağrıldıysa) 404 döner — acenta ürünleri ana domain'de listelenmez.


| Endpoint | Metot | Amaç |
|----------|-------|------|
| `/api/public/agency-products` | GET | `?service_type=transfer\|tour` → aktif ürünler |
| `/api/public/agency-products/[slug]` | GET | Tek ürün detay |
| `/api/public/booking-request` | POST | Rezervasyon talebi (honeypot + IP rate limit) |

### Mevcut `/api/upload`

Yeniden kullanılır (ürün fotoğrafları için). Ürün oluşturma formu foto yüklemesini bu endpoint'e yapar, dönen URL'leri `photos[]`'a ekler.

## Acenta Paneli UI

### `/acenta/panel/urunlerim` — ürün listesi

- Grid kartları: kapak foto / başlık / servis tipi rozeti (Transfer / Tur) / fiyat / durum toggle (Aktif/Pasif) / düzenle / sil (soft)
- Üstte: "Yeni Ürün Ekle" — servis tipi seçim modal'ı (Transfer / Tur)

### `/acenta/panel/urunlerim/yeni?type=transfer|tour` — oluşturma

**Ortak alanlar:**
- Başlık (zorunlu)
- Kısa açıklama (metin, tek satır)
- Açıklama (textarea, markdown değil; düz metin yeterli MVP'de)
- Fotoğraf yükleme (drag-drop, max 10, `/api/upload` kullanır)
- Kapak foto seçimi (yüklenen fotolardan radyo)
- Fiyat + currency (TRY/USD/EUR) + fiyat notu ("kişi başı", "araç başı")

**Transfer özgü:**
- Nereden (metin), Nereye (metin)
- Araç tipi (select: sedan / minivan / minibüs / otobüs)
- Max yolcu (number)
- Süre dakika (opsiyonel number)
- Dahil servisler (chip input)
- Gidiş-dönüş (checkbox)

**Tur özgü:**
- Süre: gün (number), gece (number)
- Kalkış noktası (metin)
- Öne çıkanlar (chip input)
- Dahil olanlar (chip input)
- Dahil olmayanlar (chip input)
- Buluşma noktası (metin)
- Diller (chip input)

**Kaydet:** Ürün direkt `is_active=true` yayına girer (moderasyon yok).

### `/acenta/panel/urunlerim/[id]` — düzenleme

Aynı form + "Sil" butonu (soft-delete onay modal'ı).

### `/acenta/panel/talepler` — rezervasyon inbox'ı

- Sekmeler (status filtresi): Yeni / İletişime Geçildi / Onaylandı / Tamamlandı / İptal
- Satır: müşteri adı / telefon / ürün / istenen tarih / oluşturulma zamanı / durum dropdown / acenta notu (inline edit)
- Telefon numarasına tıklayınca `tel:` ve WhatsApp quick-link (`https://wa.me/90...`)

### `/acenta/panel` dashboard güncellemesi

Üst kart satırına: **"Bekleyen Talepler: N"** (status=new sayısı).

## Public (müşteri) UI

### Acenta domain'inde `/tur` ve `/transfer` sayfaları

1. Sayfanın üst bölümü: **"Öne Çıkan [Tur/Transfer]larımız"** — acentanın kendi ürünleri (kart grid)
2. Alt bölüm: mevcut supplier arama sonuçları (değişiklik yok)

**Kart bileşeni** (`components/agency-product-card.tsx`):
- Kapak fotoğrafı, başlık, kısa açıklama, fiyat + fiyat notu, "Rezervasyon Talebi Bırak" butonu → detay sayfasına link

### Detay sayfaları

Supplier ürünü ile çakışmamak için yeni route grubu: **`/urun/[slug]`**
- İki servis tipi aynı route'u paylaşır (service_type ürün içinden okunur)
- Sol kolon: fotoğraf galerisi + açıklama + dahil/hariç + özellikler (service_type'a göre render)
- Sağ kolon (sticky): fiyat + **Rezervasyon Talebi Formu**
  - Ad, e-posta, telefon
  - İstenen tarih (opsiyonel date picker)
  - Yolcu sayısı
  - Not (textarea)
  - Honeypot hidden field (`company` vs.)
  - Submit → POST `/api/public/booking-request`
- Başarı durumu: "Talebiniz alındı. Acenta kısa sürede size dönüş yapacak." + acenta iletişim bilgileri (telefon / email)

**Spam koruması:**
- Honeypot field
- IP başına 5 istek/saat (endpoint katmanında, memory store yeterli MVP; prod için Vercel KV veya Supabase edge function daha iyi — şimdilik memory)

## Data Flow

```
[Acenta]
  panel/urunlerim/yeni
  → POST /api/agency/products (RLS: kendi agency_id)
  → row inserted, is_active=true

[Müşteri]
  acenta-domain.com/tur
  → middleware x-agency-domain = "acenta-domain.com"
  → page server-side: GET /api/public/agency-products?service_type=tour
  → domain → agency_id çözümlemesi → active products

  kart tıkla → /urun/[slug]
  → GET /api/public/agency-products/[slug]
  → form submit → POST /api/public/booking-request
  → row inserted, status='new'

[Acenta]
  panel/talepler
  → GET /api/agency/bookings?status=new
  → tel/WhatsApp ile müşteri ile iletişim
  → PATCH /api/agency/bookings/[id] { status: 'contacted' }
  → ilerletir: contacted → confirmed → completed

[Sistemin dışı]
  Ödeme tahsilatı, biletleme, iletişim — acenta ile müşteri arasında.
```

## Edge Cases & Kararlar

- **Soft-delete:** `agency_products.deleted_at`. Silinen ürünle ilişkili eski talepler korunur, listelerden kaybolur.
- **Ürün pasif (`is_active=false`):** Public listeden düşer; talepler etkilenmez.
- **Slug üretimi:** Başlıktan türetilir (`slugify`), çakışma varsa suffix (`-2`, `-3`). `unique(agency_id, slug)`.
- **Müşterinin çift submit:** Rate limit + aynı IP+product 10 dk içinde duplicate'i yumuşak engelle (veya kabul et, acenta inbox'ta eler). MVP: **kabul et + aynı talep varsa uyar.**
- **Resim yükleme hatası:** Client-side validation (type, boyut). DB insert ancak upload başarılı URL'lerle yapılır.
- **Email bildirimi:** MVP'de YOK. Acenta panele bakar. V2'de Supabase Edge Function + Resend/Postmark ile eklenir.
- **Admin UI:** MVP'de admin panelinde acenta ürünleri için **ekran yok**. RLS policy var (destek amaçlı DB'ye erişim); UI v2.
- **Currency:** TRY/USD/EUR select; conversion yok, her ürün kendi currency'sinde gösterilir.
- **i18n:** Mevcut proje Türkçe tek dil — bu feature da Türkçe.

## Testing

Mevcut projede otomatik test altyapısı yok. MVP için:
- **Manuel E2E akış:**
  1. Acenta hesabıyla login → ürün oluştur → aktif hâle getir
  2. Acenta domain'inden (veya `x-agency-domain` header injection ile localhost'tan) ürünü listele
  3. Detay sayfasından form gönder
  4. Acenta paneline dön → talebi gör → status değiştir
- **RLS doğrulama:**
  1. Acenta A login ile Acenta B'nin ürününü PATCH'le → 403/empty result bekle
  2. Login olmadan `/api/agency/products` çağır → 401 bekle
  3. `/api/public/agency-products` login olmadan çalışmalı ama sadece `is_active=true` ürünler dönmeli
- **Spam koruması:**
  1. 6. talep aynı IP'den gelince 429 bekle
  2. Honeypot dolu geldiğinde sessizce başarılı dön (saldırganı bilgilendirme) ama DB'ye yazma

## Etkilenen / Yeni Dosyalar

### Yeni

- `supabase/migrations/009_agency_products.sql`
- `lib/agency-products/types.ts`
- `lib/agency-products/slug.ts`
- `lib/agency-products/rate-limit.ts`
- `app/api/agency/products/route.ts`
- `app/api/agency/products/[id]/route.ts`
- `app/api/agency/bookings/route.ts`
- `app/api/agency/bookings/[id]/route.ts`
- `app/api/public/agency-products/route.ts`
- `app/api/public/agency-products/[slug]/route.ts`
- `app/api/public/booking-request/route.ts`
- `app/acenta/panel/urunlerim/page.tsx`
- `app/acenta/panel/urunlerim/yeni/page.tsx`
- `app/acenta/panel/urunlerim/[id]/page.tsx`
- `app/acenta/panel/talepler/page.tsx`
- `app/urun/[slug]/page.tsx`
- `components/agency-product-card.tsx`
- `components/agency-product-form.tsx`
- `components/agency-booking-form.tsx`

### Değişen

- `app/tur/page.tsx` — üstte acenta ürün section'ı
- `app/transfer/page.tsx` — üstte acenta ürün section'ı
- `app/acenta/panel/page.tsx` — bekleyen talep kartı

## Açık Bırakılanlar (V2)

- Email/WhatsApp bildirimi
- Admin paneli acenta ürünleri ekranı
- Tarih bazlı müsaitlik ve kontenjan (bu spec'te basit fiyat + "talep üzerine" seçildi; v2'de tarih başına fiyat/kontenjan eklenecek)
- Online ödeme entegrasyonu
- Acentalar arası çapraz marketplace (ana domain / diğer acenta domain'lerinde görünürlük)
- Otel / araç / otobüs detay formları (altyapı hazır, sadece form + tip)
