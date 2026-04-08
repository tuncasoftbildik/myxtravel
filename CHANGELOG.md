# Changelog

## 0.2.5 — 2026-04-08

### RateHawk booking flow — B3 + B4 (gerçek book + DB)

- **Yeni migration:** `011_hotel_orders.sql` — id/supplier/partner_order_id/supplier_order_id/book_hash/hotel_code/guest_info jsonb/status/raw_request+response jsonb, status enum (pending/form_submitted/confirmed/failed/cancelled), updated_at trigger, RLS enabled (service role only).
- **Yeni:** `POST /api/hotels/book` — 4 adımlı akış: (1) Supabase'e `pending` order insert, (2) `bookFormPartner`, (3) status='form_submitted', (4) `bookFinish` → status='confirmed' + supplier_order_id. Her adımda raw request/response audit için DB'ye yazılıyor. Hata durumunda row status='failed' + error_message güncelleniyor.
- **Feat:** Phase 1 ödeme tipi **`hotel`** — misafir otelde öder, sistem sıfır ödeme tahsilatı yapar. PSP/kart akışı yok.
- **UI:** Rezervasyon formu artık gerçekten book endpoint'ini çağırıyor. Confirmation ekranında `partner_order_id` + tedarikçi ref'i gösteriliyor, "Ödeme otelde check-in sırasında yapılacaktır" notu. Submit hatası form içinde kırmızı kart olarak render ediliyor.
- **Scope:** Tek oda, tek lead guest (certification checklist'in multiroom/children case'leri B5'te).

## 0.2.4 — 2026-04-08

### RateHawk booking funnel — B1 + B2 (supplier context + prebook)

- **Feat:** Supplier (travelrobot/ratehawk) artık liste → detay → oda → rezervasyon akışında URL üzerinden taşınıyor. Detay sayfası ve `/api/hotels/rooms` supplier'a göre doğru tedarikçiye gidiyor.
- **Feat:** `/api/hotels/details` supplier-aware — RateHawk için TR'ye gitmek yerine cache'li `hotelInfo`'dan metadata dönüyor (ad, yıldız, görseller 1024x768, adres, koordinat, check-in/out saatleri).
- **Yeni:** `POST /api/hotels/prebook` — RateHawk adım 2. `book_hash`'i kilitliyor, kesin fiyat + iptal politikası + `free_cancellation_before` döner. Fiyat değiştiyse `priceChanged: true` bayrağı.
- **UI:** Rezervasyon sayfası RateHawk için açılışta prebook çağırıyor. Loading/error state, fiyat değişim uyarısı (kullanıcı kabul etmeden submit bloklanır — certification gereği), iptal politika listesi ve ücretsiz iptal deadline'ı gösteriliyor.
- **Fix:** `/api/hotels/rooms` RateHawk path'i de `DD.MM.YYYY → YYYY-MM-DD` dönüşümü yapıyor (aggregator'la paralel).
- **Ertelenen (B3+B4):** Gerçek book endpoint, `hotel_orders` tablosu, misafir form payload mapping, confirmation page. Ödeme tipi kararı bekliyor.

## 0.2.3 — 2026-04-08

### RateHawk tarih format fix

- **Fix:** `lib/hotels/aggregator.ts` — UI'dan gelen `DD.MM.YYYY` tarih formatı RateHawk'a gitmeden önce `YYYY-MM-DD`'ye çevriliyor. Preview'da `?demo=ratehawk` ile "Beklenmeyen hata oluştu" görünmesinin sebebi buydu (TravelRobot dotted format'ı kabul ediyor, RateHawk ISO istiyor).

## 0.2.2 — 2026-04-08

### RateHawk Supabase cache layer

- **Yeni migration:** `010_ratehawk_hotel_info_cache.sql` — id/hid/data/expires_at, expires_at ve hid index'leri, RLS enabled (yalnızca service role).
- **Yeni:** `lib/supabase/service.ts` — backend-only service-role client (singleton, RLS bypass).
- **Yeni:** `lib/ratehawk/cache.ts` — `getCachedHotelInfo`, `setCachedHotelInfo`, `hotelInfoBatchCached` (7 gün TTL, hata-tolere, cache bozulsa arama devam eder).
- **Aggregator:** artık cache-transparent — önce Supabase'e bakıyor, eksikleri RateHawk'tan batch çekiyor, fire-and-forget write-back.
- **Test:** `scripts/rh-cache-test.mts` — cold/warm/partial miss senaryoları canlı Supabase'e karşı doğrulandı (cold 825ms + 3 rows yazıldı, warm 355ms 0 fetch, partial miss yalnız eksik id için fetch).

## 0.2.1 — 2026-04-08

### RateHawk metadata hydration

- **Yeni:** `lib/ratehawk/services/hotel.ts` → `hotelInfo` + `hotelInfoBatch` (paralel, hata-tolere).
- **Yeni:** `lib/ratehawk/image.ts` → `rhImage(url, size)` — `{size}` placeholder'lı cdn URL'leri için yardımcı.
- **Yeni:** `RhHotelInfo` tipi (name, star_rating, images, address, region, lat/lng).
- **Aggregator:** RateHawk SERP sonuçları artık otomatik olarak hotel/info/ ile zenginleştiriliyor — ad, yıldız, görsel, şehir/ülke, koordinat UnifiedHotel'e geçiyor.
- **Yeni:** `fetchRatehawkByHotelIds()` — spesifik hid listesi için pipeline (test + future search-by-hotels flow için).
- **Test:** `scripts/rh-test.mts` — sandbox certification hid'leri (10595223, 10004834, 8819557) ile end-to-end doğrulama. Sonuç: Conrad LA, Rosa Bell Motel LA, Key View Residences başarıyla hidrate edildi.
- **Types:** `RhSearchRequest`'e `hids: number[]` ve `ids: string[]` eklendi (slug sandbox'ta boş dönüyor, `hids` kullanılmalı).

## 0.2.0 — 2026-04-08

### RateHawk (Emerging Travel) çoklu tedarikçi entegrasyonu — faz 1

- **Yeni:** `lib/ratehawk/` — B2B v3 istemcisi (config, Basic Auth client, types, hotel services: region/hotels search, HP, prebook, book, overview).
- **Yeni:** `lib/hotels/` — tedarikçi-bağımsız birleşik katman. `UnifiedHotel` tipi, paralel aggregator, TravelRobot ve RateHawk için normalize modülleri.
- **Feature flag:** `HOTEL_SUPPLIERS` env değişkeni ile hangi tedarikçilerin sorgulanacağı kontrol edilebilir. Varsayılan `travelrobot` — RateHawk dark-launch için hazır.
- **Refactor:** `app/api/hotels/search/route.ts` artık birleşik aggregator'ı kullanıyor. Yanıt geriye dönük uyumlu, ek olarak her otelde `supplier` alanı ve üst seviye `suppliers` tanı bilgisi dönüyor.
- **Refactor:** `app/api/hotels/rooms/route.ts` tedarikçi farkındalıklı. `supplier` gövde alanına göre TravelRobot veya RateHawk'a yönleniyor.
- **UI:** Otel kartında tedarikçi rozeti (TR / RH) — stars satırının yanında gösteriliyor.
- **Env:** `.env.local` → `RATEHAWK_BASE_URL`, `RATEHAWK_KEY_ID`, `RATEHAWK_API_KEY` eklendi (sandbox, 2026-04-08).
- **Doğrulama:** Sandbox `/overview/` 200 OK ile credentials doğrulandı. Arama endpoint'leri erişilebilir; geçerli test region/hotel id'leri için RateHawk support'a mail atılacak.

### Ertelenen

- Gerçek prebook + book flow (her iki tedarikçi için). DB şeması, iptal politikası yüzeyi ve ödeme akışı product kararı gerektiriyor — ayrı feature olarak takipte.
- RateHawk otel metadata zenginleştirmesi (hotel info dump → ad, yıldız, görseller). Şu an SERP sonuçlarında sadece id + fiyat var.
