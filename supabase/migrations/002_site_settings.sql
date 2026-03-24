create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- RLS
alter table site_settings enable row level security;

-- Herkes okuyabilir
create policy "Public read site_settings"
  on site_settings for select
  using (true);

-- Authenticated kullanıcılar yazabilir
create policy "Authenticated users can manage site_settings"
  on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Varsayılan değerler
insert into site_settings (key, value) values
  ('hero_badge', 'Yeni sezon kampanyaları başladı'),
  ('hero_title_1', 'Seyahatini'),
  ('hero_title_2', 'Yeniden Keşfet'),
  ('hero_description', 'Uçak, otel, transfer ve tur — tek platformda karşılaştır, en uygun fiyatla rezerve et.'),
  ('hero_stat_1_value', '500+'),
  ('hero_stat_1_label', 'Havayolu'),
  ('hero_stat_2_value', '50K+'),
  ('hero_stat_2_label', 'Otel'),
  ('hero_stat_3_value', '1M+'),
  ('hero_stat_3_label', 'Mutlu Yolcu')
on conflict (key) do nothing;
