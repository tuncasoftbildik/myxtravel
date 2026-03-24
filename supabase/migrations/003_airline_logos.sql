-- Airline logos for marquee
create table if not exists airline_logos (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed default airlines
insert into airline_logos (name, image_url, sort_order) values
  ('X Travel', '/logo.png', 0),
  ('Turkish Airlines', '/airlines/thy.png', 1),
  ('Pegasus', '/airlines/pegasus.png', 2),
  ('Emirates', '/airlines/emirates.png', 3),
  ('American Airlines', '/airlines/american.png', 4),
  ('Delta Air Lines', '/airlines/delta.png', 5),
  ('SunExpress', '/airlines/sunexpress.png', 6),
  ('Aegean Airlines', '/airlines/aegean.png', 7),
  ('United Airlines', '/airlines/united.png', 8),
  ('Ryanair', '/airlines/ryanair.png', 9),
  ('AnadoluJet', '/airlines/anadolujet.png', 10),
  ('Corendon', '/airlines/corendon.png', 11),
  ('China Southern', '/airlines/chinasouthern.png', 12),
  ('Lufthansa', '/airlines/lufthansa.png', 13),
  ('Onur Air', '/airlines/onurair.png', 14),
  ('AtlasGlobal', '/airlines/atlasglobal.png', 15);
