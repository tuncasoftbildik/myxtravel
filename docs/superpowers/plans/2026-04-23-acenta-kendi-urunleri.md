# Acenta Kendi Ürünleri — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Acenta, panelinden kendi transfer ve tur ürünlerini oluşturup kendi white-label domain'inde satışa sunabilir; müşteri rezervasyon talebi bırakır.

**Architecture:** Tek generic `agency_products` tablosu + `details jsonb` ile servis tipi esnek. Ayrı `agency_product_requests` tablosunda müşteri talepleri tutulur. RLS politikaları acentayı kendi verisine hapseder. Public API middleware'den `x-agency-domain` okuyarak acentayı çözer. Platform komisyon almaz; ödeme acenta↔müşteri arasında dışarıda yürür.

**Tech Stack:** Next.js 16.2.1 (Turbopack, App Router) · React 19 · Supabase (Postgres + RLS + Auth + Storage) · Tailwind v4 · TypeScript.

**Spec:** `docs/superpowers/specs/2026-04-23-acenta-kendi-urunleri-design.md`

**Önemli not:** Bu proje Next.js 16 — breaking changes içerir. Route handler / middleware pattern'lerinde şüphe olursa `node_modules/next/dist/docs/` altındaki ilgili kılavuza bak. Mevcut kodda kullanılan pattern'leri (örneğin `app/api/agency/orders/route.ts`) örnek al. Otomatik test altyapısı yok — her taskta "Verification" bölümü manuel (curl / Supabase SQL / tarayıcı) doğrulama içerir.

---

## Task 1: Veri modeli — migration + RLS

**Files:**
- Create: `supabase/migrations/009_agency_products.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/009_agency_products.sql

-- Acenta kendi ürünleri (transfer + tur; şema gelecekte otel/araç/otobüs için hazır)
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

create index if not exists agency_products_agency_active_idx
  on agency_products (agency_id, is_active, service_type)
  where deleted_at is null;

-- Müşteri rezervasyon talepleri
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

create index if not exists agency_product_requests_agency_status_idx
  on agency_product_requests (agency_id, status, created_at desc);

-- RLS
alter table agency_products enable row level security;
alter table agency_product_requests enable row level security;

-- agency_products: public aktif ürünleri okuyabilir
create policy "Public read active agency products"
  on agency_products for select
  using (is_active = true and deleted_at is null);

-- agency_products: acenta kendi ürünlerini tam yönetir
create policy "Agency manage own products"
  on agency_products for all
  using (
    agency_id in (select agency_id from agency_users where user_id = auth.uid())
  )
  with check (
    agency_id in (select agency_id from agency_users where user_id = auth.uid())
  );

-- agency_products: admin full access
create policy "Admin manage all agency products"
  on agency_products for all
  using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('admin','super_admin'))
  )
  with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('admin','super_admin'))
  );

-- agency_product_requests: herkes talep oluşturabilir
create policy "Public create booking request"
  on agency_product_requests for insert
  with check (true);

-- agency_product_requests: acenta kendi taleplerini görüntüleyip güncelleyebilir
create policy "Agency read own requests"
  on agency_product_requests for select
  using (
    agency_id in (select agency_id from agency_users where user_id = auth.uid())
  );

create policy "Agency update own requests"
  on agency_product_requests for update
  using (
    agency_id in (select agency_id from agency_users where user_id = auth.uid())
  )
  with check (
    agency_id in (select agency_id from agency_users where user_id = auth.uid())
  );

-- agency_product_requests: admin full access
create policy "Admin manage all requests"
  on agency_product_requests for all
  using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('admin','super_admin'))
  )
  with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('admin','super_admin'))
  );

-- updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists agency_products_updated_at on agency_products;
create trigger agency_products_updated_at before update on agency_products
  for each row execute function set_updated_at();

drop trigger if exists agency_product_requests_updated_at on agency_product_requests;
create trigger agency_product_requests_updated_at before update on agency_product_requests
  for each row execute function set_updated_at();
```

- [ ] **Step 2: Apply migration via Supabase**

Supabase projesinde migration'ı çalıştır. Opsiyon 1: Supabase CLI (`supabase db push`) eğer lokal link edilmişse. Opsiyon 2: Supabase Studio → SQL Editor'de dosyanın tamamını çalıştır.

- [ ] **Step 3: Verify tables and policies exist**

Supabase Studio → SQL Editor:

```sql
select table_name from information_schema.tables
  where table_schema='public' and table_name like 'agency_%';
-- Beklenen: agencies, agency_markups, agency_orders, agency_product_requests, agency_products, agency_users

select tablename, policyname from pg_policies
  where tablename in ('agency_products','agency_product_requests')
  order by tablename, policyname;
-- Beklenen: agency_products için 3 politika, agency_product_requests için 4 politika
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/009_agency_products.sql
git commit -m "feat(db): add agency_products and agency_product_requests tables with RLS"
```

---

## Task 2: TypeScript tipleri ve slug helper

**Files:**
- Create: `lib/agency-products/types.ts`
- Create: `lib/agency-products/slug.ts`

- [ ] **Step 1: Create types file**

```ts
// lib/agency-products/types.ts

export type ServiceType = "transfer" | "tour" | "hotel" | "car" | "bus";

export type BookingStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "cancelled"
  | "completed";

export type BaseProduct = {
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
  created_at: string;
  updated_at: string;
};

export type TransferDetails = {
  from_location: string;
  to_location: string;
  vehicle_type: "sedan" | "minivan" | "minibus" | "bus";
  max_passengers: number;
  duration_minutes?: number;
  includes?: string[];
  round_trip?: boolean;
};

export type TourDetails = {
  duration_days: number;
  duration_nights: number;
  departure_point?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  meeting_point?: string;
  languages?: string[];
};

export type TransferProduct = BaseProduct & {
  service_type: "transfer";
  details: TransferDetails;
};

export type TourProduct = BaseProduct & {
  service_type: "tour";
  details: TourDetails;
};

export type AgencyProduct = TransferProduct | TourProduct;

export type AgencyProductRequest = {
  id: string;
  agency_id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  requested_date: string | null;
  passenger_count: number;
  notes: string;
  status: BookingStatus;
  agency_notes: string;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 2: Create slug helper**

```ts
// lib/agency-products/slug.ts

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
  ı: "i", İ: "i",
  ö: "o", Ö: "o",
  ş: "s", Ş: "s",
  ü: "u", Ü: "u",
};

export function slugify(input: string): string {
  return input
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Verilen agency_id + taban slug için uniqueness sağlar.
 * Çakışma varsa -2, -3, ... suffix ekler.
 * supabase: SupabaseClient from @supabase/supabase-js (server client de olur)
 */
export async function uniqueSlug(
  supabase: { from: (t: string) => {
    select: (c: string) => {
      eq: (k: string, v: string) => {
        eq: (k: string, v: string) => Promise<{ data: { id: string }[] | null }>
      }
    }
  } },
  agencyId: string,
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;
  for (;;) {
    const { data } = await supabase
      .from("agency_products")
      .select("id")
      .eq("agency_id", agencyId)
      .eq("slug", candidate);
    const rows = (data || []).filter((r) => r.id !== excludeId);
    if (rows.length === 0) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
```

- [ ] **Step 3: Type-check**

```bash
npm --prefix /Users/tuncabildik/xturizm run lint
# veya:
npx --prefix /Users/tuncabildik/xturizm tsc --noEmit
```
Beklenen: yeni dosyalarda hata yok.

- [ ] **Step 4: Commit**

```bash
git add lib/agency-products/
git commit -m "feat(lib): add agency product types and slug helper"
```

---

## Task 3: Rate-limit helper (in-memory)

**Files:**
- Create: `lib/agency-products/rate-limit.ts`

- [ ] **Step 1: Implement in-memory token bucket**

```ts
// lib/agency-products/rate-limit.ts

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * IP + key başına windowMs süresinde max `limit` istek.
 * Dönüş { ok, retryAfterSec }.
 * MVP için in-memory; prod için Vercel KV/Upstash'e taşınmalı.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/agency-products/rate-limit.ts
git commit -m "feat(lib): add in-memory rate limit helper"
```

---

## Task 4: Agency products CRUD API

**Files:**
- Create: `app/api/agency/products/route.ts`
- Create: `app/api/agency/products/[id]/route.ts`

- [ ] **Step 1: Build a shared helper for agency auth**

Önce `lib/agency-products/auth.ts` oluştur — tekrar eden auth kodu.

```ts
// lib/agency-products/auth.ts
import { createClient } from "@/lib/supabase/server";

export async function getAgencyContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "unauthorized" as const };

  const { data: agencyUser } = await supabase
    .from("agency_users")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!agencyUser) return { supabase, error: "not_agency_user" as const };

  return { supabase, agencyId: agencyUser.agency_id, userId: user.id };
}
```

- [ ] **Step 2: Implement list + create endpoint**

```ts
// app/api/agency/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";
import { slugify, uniqueSlug } from "@/lib/agency-products/slug";

// GET — acentanın ürünleri (soft-delete'leri hariç)
export async function GET() {
  const ctx = await getAgencyContext();
  if (ctx.error === "unauthorized") return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  if (ctx.error === "not_agency_user") return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .select("*")
    .eq("agency_id", ctx.agencyId!)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

// POST — yeni ürün
export async function POST(req: NextRequest) {
  const ctx = await getAgencyContext();
  if (ctx.error === "unauthorized") return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  if (ctx.error === "not_agency_user") return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const body = await req.json();
  const {
    service_type, title, short_description, description, photos,
    cover_photo, price, currency, price_note, details, is_active,
  } = body || {};

  if (!service_type || !["transfer","tour","hotel","car","bus"].includes(service_type)) {
    return NextResponse.json({ error: "Geçersiz servis tipi" }, { status: 400 });
  }
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });
  }
  if (price == null || Number.isNaN(Number(price))) {
    return NextResponse.json({ error: "Fiyat gerekli" }, { status: 400 });
  }

  const baseSlug = slugify(title) || "urun";
  const slug = await uniqueSlug(ctx.supabase, ctx.agencyId!, baseSlug);

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .insert({
      agency_id: ctx.agencyId,
      service_type,
      title,
      slug,
      short_description: short_description || "",
      description: description || "",
      photos: Array.isArray(photos) ? photos : [],
      cover_photo: cover_photo || "",
      price: Number(price),
      currency: currency || "TRY",
      price_note: price_note || "",
      details: details || {},
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
```

- [ ] **Step 3: Implement single-product endpoint**

```ts
// app/api/agency/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";
import { slugify, uniqueSlug } from "@/lib/agency-products/slug";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .select("*")
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!)
    .is("deleted_at", null)
    .single();

  if (error) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const body = await req.json();
  const allowed = [
    "title","short_description","description","photos","cover_photo",
    "price","currency","price_note","details","is_active","display_order",
  ];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) update[k] = body[k];

  if (typeof body.title === "string" && body.title.trim()) {
    const baseSlug = slugify(body.title) || "urun";
    update.slug = await uniqueSlug(ctx.supabase, ctx.agencyId!, baseSlug, id);
  }

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .update(update)
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

// Soft-delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const { error } = await ctx.supabase
    .from("agency_products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Verification — manuel test**

Dev server'ın çalıştığından emin ol (`npm --prefix /Users/tuncabildik/xturizm run dev`).

Tarayıcıda acenta kullanıcısıyla login ol (gerekirse Supabase Studio → Authentication'dan test kullanıcısı ekle + `agency_users` tablosunda bir acentaya bağla).

DevTools console'da:
```js
// Boş liste dönmeli (veya var olan ürünler)
await fetch("/api/agency/products").then(r => r.json())

// Yeni ürün oluştur
await fetch("/api/agency/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    service_type: "transfer",
    title: "Havalimani Transfer Test",
    price: 750,
    details: { from_location: "Istanbul Havalimani", to_location: "Sultanahmet", vehicle_type: "sedan", max_passengers: 3 }
  })
}).then(r => r.json())

// Liste artık 1 eleman içermeli; ID'yi kopyala
const id = "<yeni-id>"

// PATCH dene
await fetch(`/api/agency/products/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ price: 850 }),
}).then(r => r.json())

// DELETE dene
await fetch(`/api/agency/products/${id}`, { method: "DELETE" }).then(r => r.json())
```

Beklenen: POST 201 + product objesi; PATCH price güncellenmiş; DELETE success=true; sonraki GET listede ürünü göstermez (soft-deleted).

- [ ] **Step 5: Commit**

```bash
git add app/api/agency/products/ lib/agency-products/auth.ts
git commit -m "feat(api): agency products CRUD endpoints"
```

---

## Task 5: Agency bookings API

**Files:**
- Create: `app/api/agency/bookings/route.ts`
- Create: `app/api/agency/bookings/[id]/route.ts`

- [ ] **Step 1: List endpoint**

```ts
// app/api/agency/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";

export async function GET(req: NextRequest) {
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // virgülle ayrılmış liste olabilir

  let q = ctx.supabase
    .from("agency_product_requests")
    .select("*, product:agency_products(id,title,service_type,slug)")
    .eq("agency_id", ctx.agencyId!)
    .order("created_at", { ascending: false });

  if (status) {
    const list = status.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length) q = q.in("status", list);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data || [] });
}
```

- [ ] **Step 2: Status / notes update endpoint**

```ts
// app/api/agency/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";

const ALLOWED_STATUS = ["new","contacted","confirmed","cancelled","completed"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!ALLOWED_STATUS.includes(body.status as typeof ALLOWED_STATUS[number])) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.agency_notes === "string") update.agency_notes = body.agency_notes;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
  }

  const { data, error } = await ctx.supabase
    .from("agency_product_requests")
    .update(update)
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ request: data });
}
```

- [ ] **Step 3: Verification**

Henüz talep yok — Task 7 sonrası talep eklenince tam test edilir. Şimdilik sadece GET boş liste dönmeli:

```js
await fetch("/api/agency/bookings").then(r => r.json())
// { requests: [] }
```

- [ ] **Step 4: Commit**

```bash
git add app/api/agency/bookings/
git commit -m "feat(api): agency bookings list/update endpoints"
```

---

## Task 6: Public agency-products API

**Files:**
- Create: `app/api/public/agency-products/route.ts`
- Create: `app/api/public/agency-products/[slug]/route.ts`

- [ ] **Step 1: Shared helper — domain'den agency_id çözümle**

```ts
// lib/agency-products/resolve-agency.ts
import { createClient } from "@/lib/supabase/server";

/**
 * Middleware x-agency-domain header'ını ayarlar; burada DB'de active acentayı çözeriz.
 */
export async function resolveAgencyFromHeaders(headers: Headers) {
  const domain = headers.get("x-agency-domain");
  if (!domain) return { error: "no_domain" as const };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agencies")
    .select("id, slug, name, contact_email, contact_phone, primary_color, secondary_color")
    .eq("domain", domain)
    .eq("is_active", true)
    .single();

  if (error || !data) return { error: "not_found" as const };
  return { supabase, agency: data };
}
```

- [ ] **Step 2: List endpoint**

```ts
// app/api/public/agency-products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveAgencyFromHeaders } from "@/lib/agency-products/resolve-agency";

export async function GET(req: NextRequest) {
  const r = await resolveAgencyFromHeaders(req.headers);
  if (r.error === "no_domain") return NextResponse.json({ products: [] }, { status: 404 });
  if (r.error === "not_found") return NextResponse.json({ products: [] }, { status: 404 });

  const url = new URL(req.url);
  const serviceType = url.searchParams.get("service_type");

  let q = r.supabase
    .from("agency_products")
    .select("id,slug,service_type,title,short_description,photos,cover_photo,price,currency,price_note,details")
    .eq("agency_id", r.agency.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (serviceType) q = q.eq("service_type", serviceType);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [], agency: r.agency });
}
```

- [ ] **Step 3: Detail endpoint**

```ts
// app/api/public/agency-products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveAgencyFromHeaders } from "@/lib/agency-products/resolve-agency";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await resolveAgencyFromHeaders(req.headers);
  if (r.error) return NextResponse.json({ error: "Bulunamadi" }, { status: 404 });

  const { data, error } = await r.supabase
    .from("agency_products")
    .select("*")
    .eq("agency_id", r.agency.id)
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (error || !data) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json({ product: data, agency: r.agency });
}
```

- [ ] **Step 4: Verification**

Localhost'ta x-agency-domain middleware çalışmaz (middleware sadece non-main domainleri işliyor; `localhost` main sayılıyor). Test için iki seçenek:

**A)** cURL ile header'ı elle inject et:
```bash
# Var olan bir acenta domain'i (agencies tablosundan oku)
curl -H "x-agency-domain: acenta-domain.com" "http://localhost:3000/api/public/agency-products?service_type=transfer"
```
Beklenen: ilgili acentanın aktif transfer ürünleri.

**B)** Test acenta oluştur ve `/etc/hosts` ile yönlendir. Bu MVP için overkill — cURL yöntemi yeterli.

Hatalı domain'de 404 dönmeli:
```bash
curl -H "x-agency-domain: olmayandomain.com" "http://localhost:3000/api/public/agency-products"
```
Beklenen: `{"products":[]}` + 404.

- [ ] **Step 5: Commit**

```bash
git add app/api/public/agency-products/ lib/agency-products/resolve-agency.ts
git commit -m "feat(api): public agency products list/detail endpoints"
```

---

## Task 7: Public booking request endpoint

**Files:**
- Create: `app/api/public/booking-request/route.ts`

- [ ] **Step 1: Implement POST with honeypot + rate limit**

```ts
// app/api/public/booking-request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveAgencyFromHeaders } from "@/lib/agency-products/resolve-agency";
import { checkRateLimit, getClientIp } from "@/lib/agency-products/rate-limit";

export async function POST(req: NextRequest) {
  const r = await resolveAgencyFromHeaders(req.headers);
  if (r.error) return NextResponse.json({ error: "Bulunamadi" }, { status: 404 });

  const ip = getClientIp(req.headers);
  const ua = req.headers.get("user-agent") || "";

  const rl = checkRateLimit(`booking:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla istek, lütfen daha sonra tekrar deneyin" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = await req.json();
  const {
    product_id, customer_name, customer_email, customer_phone,
    requested_date, passenger_count, notes, company, // honeypot
  } = body || {};

  // Honeypot dolu gelirse sessizce başarı dön (bot bilgilendirilmesin), DB'ye yazma
  if (company) return NextResponse.json({ success: true });

  if (!product_id || !customer_name || !customer_email || !customer_phone) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  // Ürünün bu acentaya ait ve aktif olduğunu doğrula
  const { data: product } = await r.supabase
    .from("agency_products")
    .select("id")
    .eq("id", product_id)
    .eq("agency_id", r.agency.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });

  const { data, error } = await r.supabase
    .from("agency_product_requests")
    .insert({
      agency_id: r.agency.id,
      product_id,
      customer_name: String(customer_name).slice(0, 200),
      customer_email: String(customer_email).slice(0, 200),
      customer_phone: String(customer_phone).slice(0, 50),
      requested_date: requested_date || null,
      passenger_count: Number(passenger_count) || 1,
      notes: String(notes || "").slice(0, 2000),
      ip_address: ip,
      user_agent: ua.slice(0, 500),
      status: "new",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, id: data.id });
}
```

- [ ] **Step 2: Verification**

```bash
# Önce bir product_id al (Supabase Studio'dan veya Task 4'te oluşturduğun ürünün ID'si)
curl -X POST "http://localhost:3000/api/public/booking-request" \
  -H "Content-Type: application/json" \
  -H "x-agency-domain: acenta-domain.com" \
  -d '{
    "product_id": "<id>",
    "customer_name": "Ahmet Test",
    "customer_email": "test@example.com",
    "customer_phone": "5551234567",
    "requested_date": "2026-05-01",
    "passenger_count": 2,
    "notes": "VIP transfer lutfen"
  }'
```

Beklenen: `{"success": true, "id": "..."}`. Aynı IP'den 6. istek 429 döner.

Honeypot testi:
```bash
curl -X POST "http://localhost:3000/api/public/booking-request" \
  -H "Content-Type: application/json" \
  -H "x-agency-domain: acenta-domain.com" \
  -d '{ "product_id":"...", "customer_name":"X", "customer_email":"x@y", "customer_phone":"1", "company":"bot" }'
```
Beklenen: `{"success":true}` — ama Supabase'de yeni satır OLMAMALI.

- [ ] **Step 3: Commit**

```bash
git add app/api/public/booking-request/
git commit -m "feat(api): public booking request endpoint with honeypot and rate limit"
```

---

## Task 8: Ürünler listesi sayfası (panel)

**Files:**
- Create: `app/acenta/panel/urunlerim/page.tsx`

- [ ] **Step 1: Implement list page**

```tsx
// app/acenta/panel/urunlerim/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { AgencyProduct } from "@/lib/agency-products/types";

export default function UrunlerimPage() {
  const { isAgencyUser, isLoggedIn, loading: authLoading } = useAgencyAuth();
  const [products, setProducts] = useState<AgencyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    if (!isAgencyUser) return;
    fetch("/api/agency/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [isAgencyUser]);

  async function toggleActive(id: string, is_active: boolean) {
    const res = await fetch(`/api/agency/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !is_active }),
    });
    if (res.ok) {
      setProducts((xs) => xs.map((p) => (p.id === id ? { ...p, is_active: !is_active } : p)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/agency/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((xs) => xs.filter((p) => p.id !== id));
  }

  if (authLoading) return <LoadingShell />;
  if (!isLoggedIn || !isAgencyUser) return <UnauthorizedShell />;

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Ürünlerim</h1>
            <button
              onClick={() => setShowTypeModal(true)}
              className="bg-brand-red text-white rounded-lg px-4 py-2 font-medium hover:opacity-90"
            >
              + Yeni Ürün Ekle
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500">Henüz ürününüz yok. Hemen oluşturun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-video bg-gray-100">
                    {p.cover_photo || p.photos[0] ? (
                      <img src={p.cover_photo || p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">Foto yok</div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs uppercase font-semibold text-gray-500">{p.service_type}</span>
                    <h3 className="font-semibold text-gray-900 mt-1">{p.title}</h3>
                    <p className="text-brand-red font-bold mt-2">
                      {p.price.toLocaleString("tr-TR")} {p.currency}{" "}
                      <span className="text-xs text-gray-500 font-normal">{p.price_note}</span>
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={p.is_active}
                          onChange={() => toggleActive(p.id, p.is_active)}
                        />
                        {p.is_active ? "Aktif" : "Pasif"}
                      </label>
                      <div className="flex gap-3 text-sm">
                        <Link href={`/acenta/panel/urunlerim/${p.id}`} className="text-blue-600">Düzenle</Link>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600">Sil</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTypeModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Servis tipi seçin</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/acenta/panel/urunlerim/yeni?type=transfer" className="border rounded-xl p-4 text-center hover:bg-gray-50">
                <div className="text-2xl mb-1">🚐</div>
                <div className="font-medium">Transfer</div>
              </Link>
              <Link href="/acenta/panel/urunlerim/yeni?type=tour" className="border rounded-xl p-4 text-center hover:bg-gray-50">
                <div className="text-2xl mb-1">🗺️</div>
                <div className="font-medium">Tur</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LoadingShell() {
  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
      </main>
    </>
  );
}

function UnauthorizedShell() {
  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Browser verification**

Acenta kullanıcısıyla login ol → `http://localhost:3000/acenta/panel/urunlerim` aç → Task 4'teki test ürünü görünmeli (silindiyse yeniden oluştur).

- [ ] **Step 3: Commit**

```bash
git add app/acenta/panel/urunlerim/page.tsx
git commit -m "feat(panel): agency products list page"
```

---

## Task 9: Ürün formu bileşeni

**Files:**
- Create: `components/agency-product-form.tsx`

- [ ] **Step 1: Extract reusable form**

```tsx
// components/agency-product-form.tsx
"use client";

import { useState } from "react";
import type { ServiceType, TransferDetails, TourDetails } from "@/lib/agency-products/types";

type FormState = {
  title: string;
  short_description: string;
  description: string;
  photos: string[];
  cover_photo: string;
  price: string;
  currency: "TRY" | "USD" | "EUR";
  price_note: string;
  is_active: boolean;
  details: Partial<TransferDetails & TourDetails>;
};

type Props = {
  serviceType: ServiceType;
  initial?: Partial<FormState>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
};

export function AgencyProductForm({ serviceType, initial, onSubmit, submitLabel }: Props) {
  const [state, setState] = useState<FormState>({
    title: initial?.title || "",
    short_description: initial?.short_description || "",
    description: initial?.description || "",
    photos: initial?.photos || [],
    cover_photo: initial?.cover_photo || "",
    price: String(initial?.price ?? ""),
    currency: (initial?.currency as FormState["currency"]) || "TRY",
    price_note: initial?.price_note || "",
    is_active: initial?.is_active ?? true,
    details: (initial?.details as Partial<TransferDetails & TourDetails>) || {},
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
    return data.url as string;
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 10 - state.photos.length).map(upload));
      setState((s) => ({
        ...s,
        photos: [...s.photos, ...urls].slice(0, 10),
        cover_photo: s.cover_photo || urls[0] || "",
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme hatası");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        service_type: serviceType,
        title: state.title,
        short_description: state.short_description,
        description: state.description,
        photos: state.photos,
        cover_photo: state.cover_photo,
        price: Number(state.price),
        currency: state.currency,
        price_note: state.price_note,
        is_active: state.is_active,
        details: state.details,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  function setDetail<K extends keyof (TransferDetails & TourDetails)>(
    key: K,
    value: (TransferDetails & TourDetails)[K],
  ) {
    setState((s) => ({ ...s, details: { ...s.details, [key]: value } }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6">
      <Field label="Başlık">
        <input required className="input" value={state.title}
          onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))} />
      </Field>

      <Field label="Kısa açıklama (1 cümle)">
        <input className="input" value={state.short_description}
          onChange={(e) => setState((s) => ({ ...s, short_description: e.target.value }))} />
      </Field>

      <Field label="Açıklama">
        <textarea rows={6} className="input" value={state.description}
          onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))} />
      </Field>

      <Field label={`Fotoğraflar (${state.photos.length}/10)`}>
        <input type="file" accept="image/*" multiple
          onChange={(e) => handleFiles(e.target.files)} />
        {state.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {state.photos.map((url) => (
              <label key={url} className="relative block border rounded-lg overflow-hidden cursor-pointer">
                <img src={url} alt="" className="w-full aspect-square object-cover" />
                <input type="radio" name="cover" className="absolute top-2 left-2" checked={state.cover_photo === url}
                  onChange={() => setState((s) => ({ ...s, cover_photo: url }))} />
                <button type="button" className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 text-xs"
                  onClick={(e) => { e.preventDefault(); setState((s) => ({ ...s, photos: s.photos.filter((p) => p !== url), cover_photo: s.cover_photo === url ? s.photos.find((p) => p !== url) || "" : s.cover_photo })); }}>
                  ×
                </button>
              </label>
            ))}
          </div>
        )}
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Fiyat">
          <input required type="number" step="0.01" min="0" className="input" value={state.price}
            onChange={(e) => setState((s) => ({ ...s, price: e.target.value }))} />
        </Field>
        <Field label="Para birimi">
          <select className="input" value={state.currency}
            onChange={(e) => setState((s) => ({ ...s, currency: e.target.value as FormState["currency"] }))}>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </Field>
        <Field label="Fiyat notu">
          <input className="input" placeholder="kişi başı / araç başı" value={state.price_note}
            onChange={(e) => setState((s) => ({ ...s, price_note: e.target.value }))} />
        </Field>
      </div>

      {serviceType === "transfer" ? (
        <TransferFields detail={state.details as TransferDetails} set={setDetail} />
      ) : (
        <TourFields detail={state.details as TourDetails} set={setDetail} />
      )}

      <Field label="">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={state.is_active}
            onChange={(e) => setState((s) => ({ ...s, is_active: e.target.checked }))} />
          Aktif (müşterilere görünür)
        </label>
      </Field>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button disabled={saving} type="submit"
        className="bg-brand-red text-white rounded-lg px-6 py-3 font-medium disabled:opacity-60">
        {saving ? "Kaydediliyor..." : submitLabel}
      </button>

      <style>{`.input { width:100%; padding:0.625rem 0.875rem; border:1px solid #e5e7eb; border-radius:0.5rem; background:white; }`}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {children}
    </div>
  );
}

function ChipInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (!v) return;
    onChange([...value, v]);
    setInput("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((v, i) => (
          <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-1">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" placeholder={placeholder}
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="px-3 border rounded-lg">Ekle</button>
      </div>
    </div>
  );
}

function TransferFields({ detail, set }: { detail: TransferDetails; set: <K extends keyof TransferDetails>(k: K, v: TransferDetails[K]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Nereden"><input required className="input" value={detail.from_location || ""} onChange={(e) => set("from_location", e.target.value)} /></Field>
      <Field label="Nereye"><input required className="input" value={detail.to_location || ""} onChange={(e) => set("to_location", e.target.value)} /></Field>
      <Field label="Araç tipi">
        <select className="input" value={detail.vehicle_type || "sedan"} onChange={(e) => set("vehicle_type", e.target.value as TransferDetails["vehicle_type"])}>
          <option value="sedan">Sedan</option>
          <option value="minivan">Minivan</option>
          <option value="minibus">Minibüs</option>
          <option value="bus">Otobüs</option>
        </select>
      </Field>
      <Field label="Max yolcu"><input required type="number" min="1" className="input" value={detail.max_passengers || ""} onChange={(e) => set("max_passengers", Number(e.target.value))} /></Field>
      <Field label="Süre (dk)"><input type="number" min="1" className="input" value={detail.duration_minutes || ""} onChange={(e) => set("duration_minutes", Number(e.target.value) || undefined)} /></Field>
      <Field label="">
        <label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={!!detail.round_trip} onChange={(e) => set("round_trip", e.target.checked)} /> Gidiş-dönüş</label>
      </Field>
      <div className="col-span-2">
        <Field label="Dahil olanlar"><ChipInput value={detail.includes || []} onChange={(v) => set("includes", v)} placeholder="VIP karşılama, su ikramı..." /></Field>
      </div>
    </div>
  );
}

function TourFields({ detail, set }: { detail: TourDetails; set: <K extends keyof TourDetails>(k: K, v: TourDetails[K]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Süre (gün)"><input required type="number" min="1" className="input" value={detail.duration_days || ""} onChange={(e) => set("duration_days", Number(e.target.value))} /></Field>
      <Field label="Süre (gece)"><input required type="number" min="0" className="input" value={detail.duration_nights || ""} onChange={(e) => set("duration_nights", Number(e.target.value))} /></Field>
      <Field label="Kalkış noktası"><input className="input" value={detail.departure_point || ""} onChange={(e) => set("departure_point", e.target.value)} /></Field>
      <Field label="Buluşma noktası"><input className="input" value={detail.meeting_point || ""} onChange={(e) => set("meeting_point", e.target.value)} /></Field>
      <div className="col-span-2"><Field label="Öne çıkanlar"><ChipInput value={detail.highlights || []} onChange={(v) => set("highlights", v)} /></Field></div>
      <div className="col-span-2"><Field label="Dahil olanlar"><ChipInput value={detail.includes || []} onChange={(v) => set("includes", v)} /></Field></div>
      <div className="col-span-2"><Field label="Dahil olmayanlar"><ChipInput value={detail.excludes || []} onChange={(v) => set("excludes", v)} /></Field></div>
      <div className="col-span-2"><Field label="Diller"><ChipInput value={detail.languages || []} onChange={(v) => set("languages", v)} placeholder="Türkçe, İngilizce..." /></Field></div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/agency-product-form.tsx
git commit -m "feat(components): agency product form with transfer/tour field sets"
```

---

## Task 10: Yeni ürün sayfası

**Files:**
- Create: `app/acenta/panel/urunlerim/yeni/page.tsx`

- [ ] **Step 1: Wire form to POST endpoint**

```tsx
// app/acenta/panel/urunlerim/yeni/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { AgencyProductForm } from "@/components/agency-product-form";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { ServiceType } from "@/lib/agency-products/types";

export default function YeniUrunPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const typeParam = sp.get("type");
  const serviceType: ServiceType = typeParam === "tour" ? "tour" : "transfer";

  const { isAgencyUser, isLoggedIn, loading } = useAgencyAuth();

  if (loading) return null;
  if (!isLoggedIn || !isAgencyUser) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </main>
      </>
    );
  }

  async function submit(payload: Record<string, unknown>) {
    const res = await fetch("/api/agency/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
    router.push("/acenta/panel/urunlerim");
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">
            Yeni {serviceType === "transfer" ? "Transfer" : "Tur"} Ekle
          </h1>
          <AgencyProductForm
            serviceType={serviceType}
            onSubmit={submit}
            submitLabel="Kaydet ve Yayına Al"
          />
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Browser verification**

`http://localhost:3000/acenta/panel/urunlerim/yeni?type=transfer` — form yüklenmeli. Doldurup kaydet → liste sayfasına redirect + yeni ürün görünmeli.

Aynısını `?type=tour` için tekrar et.

- [ ] **Step 3: Commit**

```bash
git add app/acenta/panel/urunlerim/yeni/
git commit -m "feat(panel): new product page"
```

---

## Task 11: Ürün düzenleme sayfası

**Files:**
- Create: `app/acenta/panel/urunlerim/[id]/page.tsx`

- [ ] **Step 1: Load + submit PATCH**

```tsx
// app/acenta/panel/urunlerim/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/header";
import { AgencyProductForm } from "@/components/agency-product-form";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { AgencyProduct } from "@/lib/agency-products/types";

export default function UrunDuzenlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isAgencyUser, isLoggedIn, loading: authLoading } = useAgencyAuth();
  const [product, setProduct] = useState<AgencyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAgencyUser || !params.id) return;
    fetch(`/api/agency/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.product || null))
      .finally(() => setLoading(false));
  }, [isAgencyUser, params.id]);

  if (authLoading || loading) return null;
  if (!isLoggedIn || !isAgencyUser) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </main>
      </>
    );
  }
  if (!product) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <p className="text-gray-600">Ürün bulunamadı.</p>
        </main>
      </>
    );
  }

  async function submit(payload: Record<string, unknown>) {
    // service_type değiştirilemez; drop et
    const { service_type: _ignored, ...rest } = payload;
    const res = await fetch(`/api/agency/products/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
    router.push("/acenta/panel/urunlerim");
  }

  async function handleDelete() {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/agency/products/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/acenta/panel/urunlerim");
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
            <button onClick={handleDelete} className="text-red-600 hover:underline">Sil</button>
          </div>
          <AgencyProductForm
            serviceType={product.service_type as "transfer" | "tour"}
            initial={product}
            onSubmit={submit}
            submitLabel="Değişiklikleri Kaydet"
          />
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Browser verification**

Liste sayfasında bir ürünün "Düzenle"sine tıkla → form doldu halde yüklenmeli → bir alan değiştir, kaydet → liste güncel değerle gelsin.

- [ ] **Step 3: Commit**

```bash
git add app/acenta/panel/urunlerim/\[id\]/
git commit -m "feat(panel): product edit page"
```

---

## Task 12: Rezervasyon talepleri inbox'ı

**Files:**
- Create: `app/acenta/panel/talepler/page.tsx`

- [ ] **Step 1: Tabs + list + inline update**

```tsx
// app/acenta/panel/talepler/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { BookingStatus } from "@/lib/agency-products/types";

type RequestRow = {
  id: string;
  product_id: string;
  product?: { title: string; service_type: string };
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  requested_date: string | null;
  passenger_count: number;
  notes: string;
  status: BookingStatus;
  agency_notes: string;
  created_at: string;
};

const TABS: { key: BookingStatus; label: string }[] = [
  { key: "new", label: "Yeni" },
  { key: "contacted", label: "İletişime Geçildi" },
  { key: "confirmed", label: "Onaylandı" },
  { key: "completed", label: "Tamamlandı" },
  { key: "cancelled", label: "İptal" },
];

function phoneToWa(raw: string) {
  const digits = raw.replace(/\D+/g, "");
  const withCountry = digits.startsWith("0") ? "90" + digits.slice(1) : digits;
  return `https://wa.me/${withCountry}`;
}

export default function TaleplerPage() {
  const { isAgencyUser, isLoggedIn, loading: authLoading } = useAgencyAuth();
  const [tab, setTab] = useState<BookingStatus>("new");
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAgencyUser) return;
    setLoading(true);
    fetch(`/api/agency/bookings?status=${tab}`)
      .then((r) => r.json())
      .then((d) => setRows(d.requests || []))
      .finally(() => setLoading(false));
  }, [isAgencyUser, tab]);

  async function update(id: string, patch: Partial<Pick<RequestRow, "status" | "agency_notes">>) {
    const res = await fetch(`/api/agency/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    if (patch.status && patch.status !== tab) {
      setRows((xs) => xs.filter((r) => r.id !== id));
    } else {
      setRows((xs) => xs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    }
  }

  if (authLoading) return null;
  if (!isLoggedIn || !isAgencyUser) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Rezervasyon Talepleri</h1>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.key ? "bg-brand-red text-white" : "bg-white text-gray-700"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500">Bu kategoride talep yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{r.customer_name}</p>
                      <p className="text-sm text-gray-500">{r.product?.title || "Ürün silinmiş"}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.created_at).toLocaleString("tr-TR")}
                        {r.requested_date ? ` • İstenen tarih: ${r.requested_date}` : ""}
                        {` • ${r.passenger_count} kişi`}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <a href={`tel:${r.customer_phone}`} className="text-sm text-blue-600">📞 Ara</a>
                      <a href={phoneToWa(r.customer_phone)} target="_blank" rel="noopener" className="text-sm text-green-600">💬 WhatsApp</a>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>📧 {r.customer_email}</div>
                    <div>📱 {r.customer_phone}</div>
                  </div>
                  {r.notes && (
                    <p className="mt-3 text-sm bg-gray-50 rounded p-2">Müşteri notu: {r.notes}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 items-center">
                    <select className="border rounded px-2 py-1 text-sm" value={r.status}
                      onChange={(e) => update(r.id, { status: e.target.value as BookingStatus })}>
                      {TABS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                    <input className="border rounded px-2 py-1 text-sm flex-1 min-w-48"
                      placeholder="Acenta notu (müşteri görmez)"
                      defaultValue={r.agency_notes}
                      onBlur={(e) => { if (e.target.value !== r.agency_notes) update(r.id, { agency_notes: e.target.value }); }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Browser verification (end-to-end)**

Task 7'de cURL ile oluşturduğun talep(ler) "Yeni" sekmesinde görünmeli. Durumu "İletişime Geçildi"ye al → satır o sekmeye geçsin. Acenta notu yaz → sayfayı yenile → değer kalıcı.

- [ ] **Step 3: Commit**

```bash
git add app/acenta/panel/talepler/
git commit -m "feat(panel): bookings inbox with inline status and notes"
```

---

## Task 13: Dashboard bekleyen talep kartı

**Files:**
- Modify: `app/acenta/panel/page.tsx`

- [ ] **Step 1: Read existing dashboard**

`app/acenta/panel/page.tsx` dosyasını aç. Üst kısımdaki kart grid'ini bul (mevcut kartlar siparişler / cirolar vb. içerir).

- [ ] **Step 2: Add pending bookings fetch + card**

Dosyanın başındaki state'lere ekle:

```tsx
const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  if (!isAgencyUser) return;
  fetch("/api/agency/bookings?status=new")
    .then((r) => r.json())
    .then((d) => setPendingCount((d.requests || []).length))
    .catch(() => {});
}, [isAgencyUser]);
```

Kart grid'inin en başına yeni kart ekle:

```tsx
<Link href="/acenta/panel/talepler" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow block">
  <p className="text-xs uppercase text-gray-500 font-semibold">Bekleyen Talepler</p>
  <p className="text-3xl font-bold mt-2 text-brand-red">{pendingCount}</p>
  <p className="text-xs text-gray-400 mt-1">Yeni rezervasyon talepleri</p>
</Link>
```

Import'u unutma: `import Link from "next/link";` (muhtemelen zaten var).

- [ ] **Step 3: Browser verification**

Dashboard'a git → yeni kart görünsün → sayı Task 12'de kaldığın talep sayısıyla eşleşsin.

- [ ] **Step 4: Commit**

```bash
git add app/acenta/panel/page.tsx
git commit -m "feat(panel): add pending bookings card to dashboard"
```

---

## Task 14: Public ürün kartı bileşeni

**Files:**
- Create: `components/agency-product-card.tsx`

- [ ] **Step 1: Create card**

```tsx
// components/agency-product-card.tsx
import Link from "next/link";

type Props = {
  product: {
    slug: string;
    title: string;
    short_description: string;
    cover_photo: string;
    photos: string[];
    price: number;
    currency: string;
    price_note: string;
  };
};

export function AgencyProductCard({ product: p }: Props) {
  const cover = p.cover_photo || p.photos[0];
  return (
    <Link href={`/urun/${p.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition block">
      <div className="aspect-[4/3] bg-gray-100">
        {cover ? (
          <img src={cover} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">Foto yok</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h3>
        {p.short_description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.short_description}</p>
        )}
        <p className="text-brand-red font-bold mt-3">
          {p.price.toLocaleString("tr-TR")} {p.currency}{" "}
          <span className="text-xs text-gray-500 font-normal">{p.price_note}</span>
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/agency-product-card.tsx
git commit -m "feat(components): agency product card"
```

---

## Task 15: Rezervasyon talebi formu bileşeni

**Files:**
- Create: `components/agency-booking-form.tsx`

- [ ] **Step 1: Form with honeypot**

```tsx
// components/agency-booking-form.tsx
"use client";

import { useState } from "react";

type Props = {
  productId: string;
  agencyContact?: { email?: string; phone?: string };
};

export function AgencyBookingForm({ productId, agencyContact }: Props) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    requested_date: "",
    passenger_count: 1,
    notes: "",
    company: "", // honeypot
  });
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/public/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderilemedi");
      setState("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <p className="font-semibold text-green-800">Talebiniz alındı ✓</p>
        <p className="text-sm text-green-700 mt-1">Acenta kısa sürede sizinle iletişime geçecek.</p>
        {(agencyContact?.phone || agencyContact?.email) && (
          <p className="text-xs text-green-700 mt-3">
            İletişim: {agencyContact.phone}
            {agencyContact.phone && agencyContact.email ? " • " : ""}
            {agencyContact.email}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input hidden tabIndex={-1} autoComplete="off" name="company"
        value={form.company} onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))} />

      <input required placeholder="Ad Soyad" className="input"
        value={form.customer_name} onChange={(e) => setForm((s) => ({ ...s, customer_name: e.target.value }))} />
      <input required type="email" placeholder="E-posta" className="input"
        value={form.customer_email} onChange={(e) => setForm((s) => ({ ...s, customer_email: e.target.value }))} />
      <input required placeholder="Telefon" className="input"
        value={form.customer_phone} onChange={(e) => setForm((s) => ({ ...s, customer_phone: e.target.value }))} />
      <input type="date" className="input"
        value={form.requested_date} onChange={(e) => setForm((s) => ({ ...s, requested_date: e.target.value }))} />
      <input type="number" min="1" className="input"
        value={form.passenger_count} onChange={(e) => setForm((s) => ({ ...s, passenger_count: Number(e.target.value) || 1 }))} />
      <textarea rows={3} placeholder="Notunuz (opsiyonel)" className="input"
        value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button disabled={state === "submitting"} type="submit"
        className="bg-brand-red text-white rounded-lg px-5 py-3 font-medium w-full disabled:opacity-60">
        {state === "submitting" ? "Gönderiliyor..." : "Rezervasyon Talebi Gönder"}
      </button>

      <style>{`.input { width:100%; padding:0.625rem 0.875rem; border:1px solid #e5e7eb; border-radius:0.5rem; background:white; }`}</style>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/agency-booking-form.tsx
git commit -m "feat(components): agency booking request form"
```

---

## Task 16: Ürün detay sayfası `/urun/[slug]`

**Files:**
- Create: `app/urun/[slug]/page.tsx`

- [ ] **Step 1: Server component — fetch + render**

```tsx
// app/urun/[slug]/page.tsx
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { AgencyBookingForm } from "@/components/agency-booking-form";

type PageProps = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const h = await headers();
  const host = h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;

  // İç fetch — middleware x-agency-domain'i zaten set etti; fetch aynı header'ı taşımalı.
  const domain = h.get("x-agency-domain") || "";
  if (!domain) return null;

  const res = await fetch(`${base}/api/public/agency-products/${slug}`, {
    headers: { "x-agency-domain": domain },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ product: any; agency: any }>;
}

export default async function UrunDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();
  const { product, agency } = data;

  const details = product.details || {};
  const photos: string[] = product.photos?.length ? product.photos : product.cover_photo ? [product.cover_photo] : [];

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {photos.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden">
                <img src={photos[0]} alt={product.title} className="w-full aspect-video object-cover" />
                {photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {photos.slice(1, 5).map((src: string) => (
                      <img key={src} src={src} alt="" className="aspect-square object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6">
              <span className="text-xs uppercase font-semibold text-gray-500">
                {product.service_type === "transfer" ? "Transfer" : "Tur"}
              </span>
              <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
              {product.short_description && <p className="text-gray-600 mt-2">{product.short_description}</p>}
              {product.description && (
                <p className="mt-4 text-gray-700 whitespace-pre-wrap">{product.description}</p>
              )}

              {product.service_type === "transfer" && (
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Nereden" value={details.from_location} />
                  <Info label="Nereye" value={details.to_location} />
                  <Info label="Araç" value={details.vehicle_type} />
                  <Info label="Max yolcu" value={details.max_passengers} />
                  {details.duration_minutes && <Info label="Süre" value={`${details.duration_minutes} dk`} />}
                  {details.round_trip && <Info label="" value="Gidiş-dönüş" />}
                </dl>
              )}
              {product.service_type === "tour" && (
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Süre" value={`${details.duration_days} gün / ${details.duration_nights} gece`} />
                  {details.departure_point && <Info label="Kalkış" value={details.departure_point} />}
                  {details.meeting_point && <Info label="Buluşma" value={details.meeting_point} />}
                </dl>
              )}

              {details.highlights?.length > 0 && <Bullets title="Öne çıkanlar" items={details.highlights} />}
              {details.includes?.length > 0 && <Bullets title="Dahil olanlar" items={details.includes} />}
              {details.excludes?.length > 0 && <Bullets title="Dahil olmayanlar" items={details.excludes} />}
              {details.languages?.length > 0 && <Bullets title="Diller" items={details.languages} />}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-2xl font-bold text-brand-red">
                {Number(product.price).toLocaleString("tr-TR")} {product.currency}
              </p>
              {product.price_note && <p className="text-xs text-gray-500">{product.price_note}</p>}
              <hr className="my-4" />
              <AgencyBookingForm
                productId={product.id}
                agencyContact={{ email: agency?.contact_email, phone: agency?.contact_phone }}
              />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === "") return null;
  return (
    <div>
      {label && <dt className="text-gray-500">{label}</dt>}
      <dd className="font-medium text-gray-900">{String(value)}</dd>
    </div>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <ul className="mt-2 list-disc list-inside text-gray-700 text-sm space-y-1">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Browser verification**

Task 10'da oluşturduğun transfer ürününün slug'ını Supabase Studio'dan oku. cURL ile agency domain'i görmüş olacağın test: acenta domain'i ile açmak zor (middleware local'de çalışmıyor), bu yüzden lokal test için middleware'i geçici olarak bypass edebilir veya ürünü sadece API üzerinden doğrulayabilirsin:

```bash
curl -H "x-agency-domain: <acenta-domain>" http://localhost:3000/api/public/agency-products/<slug> | jq
```

Tarayıcı testi için: production deploy sonrası acenta domain'inden test et; veya lokal'de middleware'i geçici düzenle (MAIN_DOMAINS listesinden localhost'u çıkar + `/etc/hosts` ile test domain'i → 127.0.0.1). Bu kapsamda MVP: cURL doğrulaması yeterli, asıl QA production'da.

- [ ] **Step 3: Commit**

```bash
git add app/urun/
git commit -m "feat(public): agency product detail page with booking form"
```

---

## Task 17: `/tur` ve `/transfer` sayfalarına section ekle

**Files:**
- Modify: `app/tur/page.tsx`
- Modify: `app/transfer/page.tsx`

- [ ] **Step 1: Read current pages**

Her iki dosyayı oku. Üstte hero/başlık olacak, altta supplier sonuçları olacak. Biz ikisi arasına "Öne Çıkan [Tur/Transfer]larımız" section'ı ekleyeceğiz — sadece acenta domain'inde görünen (yani boş geldiğinde section'ı gösterme).

- [ ] **Step 2: Create shared section component**

```tsx
// components/agency-featured-section.tsx
"use client";

import { useEffect, useState } from "react";
import { AgencyProductCard } from "@/components/agency-product-card";

type Product = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  cover_photo: string;
  photos: string[];
  price: number;
  currency: string;
  price_note: string;
};

export function AgencyFeaturedSection({ serviceType, title }: { serviceType: "transfer" | "tour"; title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/public/agency-products?service_type=${serviceType}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoaded(true));
  }, [serviceType]);

  if (!loaded) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-10 bg-[#f5f0e8]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-bold mb-5">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => <AgencyProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire into pages**

`app/tur/page.tsx`'in hero'sundan sonra, mevcut search/results bölümünden önce ekle:

```tsx
import { AgencyFeaturedSection } from "@/components/agency-featured-section";

// ...hero sonrası, results öncesi:
<AgencyFeaturedSection serviceType="tour" title="Öne Çıkan Turlarımız" />
```

`app/transfer/page.tsx`'e aynısı:

```tsx
import { AgencyFeaturedSection } from "@/components/agency-featured-section";

<AgencyFeaturedSection serviceType="transfer" title="Öne Çıkan Transferlerimiz" />
```

- [ ] **Step 4: Verification**

Ana domain'de (localhost) section görünmeyecek (API 404 → products=[]). Acenta domain'inde aktif ürün varsa section render edilecek. cURL ile doğrula:

```bash
# localhost (main) — boş
curl http://localhost:3000/api/public/agency-products?service_type=tour
# Beklenen: 404 + {"products":[]}

# acenta domain — dolu
curl -H "x-agency-domain: <acenta-domain>" http://localhost:3000/api/public/agency-products?service_type=tour
# Beklenen: 200 + products dolu
```

- [ ] **Step 5: Commit**

```bash
git add components/agency-featured-section.tsx app/tur/page.tsx app/transfer/page.tsx
git commit -m "feat(public): agency featured section on tour and transfer pages"
```

---

## Task 18: Manuel end-to-end + RLS doğrulama

**Files:** (no changes — verification only)

- [ ] **Step 1: Full customer flow**

Bir acenta hesabıyla login ol → `/acenta/panel/urunlerim/yeni?type=tour` → ürün oluştur (fotoğraflı, açıklamalı, fiyatlı). Liste sayfasında ürünü gör.

cURL ile acenta domain'inden listele + detay al:
```bash
curl -H "x-agency-domain: <acenta-domain>" http://localhost:3000/api/public/agency-products?service_type=tour | jq
curl -H "x-agency-domain: <acenta-domain>" http://localhost:3000/api/public/agency-products/<slug> | jq
```

Rezervasyon talebi gönder (cURL veya UI üzerinden).

Acenta paneli → `/acenta/panel/talepler` → yeni talep görünmeli. Status'ü değiştir. Dashboard'da bekleyen sayısı 1 azalmalı.

- [ ] **Step 2: RLS isolation test**

İki acenta oluştur (Supabase Studio'dan). Acenta A'da bir ürün oluştur. Acenta B kullanıcısıyla login ol → `/api/agency/products/<A'nın-id>` PATCH dene:

```js
await fetch("/api/agency/products/<A-id>", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ price: 1 }),
}).then(r => ({ ok: r.ok, status: r.status }))
```
Beklenen: `{ok: false, status: 500}` veya 404 — RLS nedeniyle satır bulunamaz, update başarısız.

Acenta B'nin `/api/agency/products` GET çağrısında A'nın ürünü GÖRÜNMEMELİ.

- [ ] **Step 3: Spam koruması testi**

Aynı IP'den 6 kez booking-request gönder — 6. istek 429 Retry-After header'ıyla dönmeli.

Honeypot (company) dolu gönder → `{success:true}` dön ama Supabase `agency_product_requests` tablosunda yeni satır OLMAMALI.

- [ ] **Step 4: Commit nothing — mark complete**

Eğer tüm adımlar geçtiyse plan tamamlandı.

```bash
# Opsiyonel: final commit with CHANGELOG update (if project has one — -XTurizm has one, xturizm doesn't)
```

---

## Self-Review Notes

- **Spec coverage:** Tüm spec bölümleri (veri modeli, API, panel UI, public UI, data flow, edge cases) bir task'a eşleniyor.
- **Test altyapısı:** Proje otomatik test kullanmıyor; her task "Verification" bölümünde manuel adımlar içeriyor (cURL + Supabase Studio + tarayıcı). Yeni test framework kurmak bu feature'ın scope'u dışında.
- **Admin UI:** MVP'de yok (spec kararı); RLS policy eklendi (destek amaçlı). Admin ekranı v2.
- **Next.js 16 farkları:** `params: Promise<{...}>` pattern'i kullanıldı (mevcut `agency/orders` route'undan kopyalandı). Route handler'larda `NextResponse.json()` standart.
- **middleware → proxy deprecation:** Spec dışı; bu plan dokunmuyor. Ayrı bir teknik-borç task'ı olarak ele alınabilir.
- **Yedek/otomatik kayıt:** Yok — acenta form doldururken tarayıcıyı kapatırsa veri kaybolur. MVP için kabul edilebilir.
