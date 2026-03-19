# XTurizm Platform

B2B2C Turizm Satış Platformu — Multi-tenant, white-label acenta paneli, kademeli komisyon yönetimi.

## Mimari

```
Dış Sağlayıcılar → Provider API Layer → Commission Engine
                                              ↓
                    Admin Panel    Agency Panel    B2C Storefront
                    (platform)     (white-label)   (son müşteri)
```

## Tech Stack

- **Framework:** Next.js 16, TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL, RLS)
- **Routing:** Subdomain-based multi-tenant (`acenta.xturizm.com`)

## Modüller

| Modül | Durum |
|-------|-------|
| Supabase DB şeması | ✅ |
| Commission Engine (kademeli) | ✅ |
| Mock Provider adaptörü | ✅ |
| Subdomain tenant routing | ✅ |
| Auth sistemi (login/logout) | ✅ |
| Admin Dashboard | ✅ |
| Acenta Dashboard | ✅ |
| Ürün Kataloğu + fiyat dökümü | ✅ |
| Komisyon ayar sayfası | ✅ |
| B2C Arama sayfası | ✅ |
| Acenta CRUD (admin) | 🔜 |
| Rezervasyon akışı | 🔜 |
| White-label özelleştirme | 🔜 |
| Gerçek sağlayıcı API entegrasyonu | 🔜 |

## Kurulum

```bash
git clone https://github.com/tuncasoftbildik/-XTurizm.git
cd -XTurizm
npm install
cp .env.local.example .env.local
# .env.local dosyasını doldur
npm run dev
```

## Ortam Değişkenleri

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ROOT_DOMAIN=xturizm.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Komisyon Akışı

```
Sağlayıcı Fiyatı
  + Platform Komisyonu (%10 varsayılan)
  + Acenta Komisyonu (acenta tarafından belirlenir)
  = Müşteriye Gösterilen Fiyat
```

## Route Yapısı

| URL | Açıklama |
|-----|----------|
| `/` | B2C Storefront |
| `/search` | Ürün arama |
| `/admin/*` | Platform admin paneli |
| `/panel/*` | Acenta paneli (white-label) |

---

*Geliştirme aşamasında — v0.1*
