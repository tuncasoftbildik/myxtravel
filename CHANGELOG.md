# Changelog

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
