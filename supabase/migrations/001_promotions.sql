create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,              -- "%20 indirim!"
  description text,                 -- "Otellerde erken rezervasyon fırsatlarını kaçırma"
  badge text,                       -- "Otel", "Uçak" vb.
  discount_label text,              -- "-% 20" badge on top-right
  valid_until date,                 -- son geçerlilik tarihi
  link text,                        -- yönlendirme linki
  bg_color text default '#C41E3A',  -- kart arka plan/accent rengi
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table promotions enable row level security;

-- Herkes okuyabilir (aktif olanları)
create policy "Public read active promotions"
  on promotions for select
  using (is_active = true);

-- Sadece authenticated kullanıcılar (admin) yazabilir
create policy "Authenticated users can manage promotions"
  on promotions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
