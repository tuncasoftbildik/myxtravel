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
