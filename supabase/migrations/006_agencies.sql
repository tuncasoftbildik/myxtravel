-- Agencies (white-label partners)
create table if not exists agencies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  domain text unique,
  logo_url text default '',
  favicon_url text default '',
  primary_color text default '#C41E3A',
  secondary_color text default '#1a0a2e',
  commission_rate decimal(5,2) default 10.00,
  contact_name text default '',
  contact_email text default '',
  contact_phone text default '',
  address text default '',
  tax_number text default '',
  tursab_no text default '',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agency orders / sales tracking
create table if not exists agency_orders (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agencies(id) on delete cascade,
  order_type text not null,           -- 'flight','hotel','bus','car','transfer','tour'
  product_name text not null,
  customer_name text default '',
  customer_email text default '',
  customer_phone text default '',
  base_price decimal(10,2) not null,  -- API'den gelen fiyat
  commission_rate decimal(5,2) not null,
  commission_amount decimal(10,2) not null,
  total_price decimal(10,2) not null, -- müşterinin ödediği fiyat
  currency text default 'TRY',
  status text default 'pending',      -- 'pending','confirmed','cancelled','completed','refunded'
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table agencies enable row level security;
alter table agency_orders enable row level security;

-- Public can read active agencies (for domain lookup)
create policy "Public read active agencies"
  on agencies for select
  using (is_active = true);

-- Admin full access
create policy "Admin manage agencies"
  on agencies for all
  using (true)
  with check (true);

create policy "Admin manage agency orders"
  on agency_orders for all
  using (true)
  with check (true);

-- Indexes
create index if not exists agencies_domain_idx on agencies (domain);
create index if not exists agencies_slug_idx on agencies (slug);
create index if not exists agency_orders_agency_idx on agency_orders (agency_id, created_at desc);
create index if not exists agency_orders_status_idx on agency_orders (status);
create index if not exists agency_orders_month_idx on agency_orders (agency_id, created_at);
