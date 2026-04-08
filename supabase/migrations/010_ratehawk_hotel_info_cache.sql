-- RateHawk hotel metadata cache.
--
-- Avoids N+1 /hotel/info/ round-trips on every search. Populated lazily by
-- the hotels aggregator: a cache miss triggers a fetch, a hit is used as-is
-- until `expires_at` elapses. Service-role only — no public read/write.
--
-- TTL is enforced at read time by the application (simpler than pg_cron),
-- but we index on expires_at to make pruning cheap.

create table if not exists public.ratehawk_hotel_info_cache (
  id          text primary key,
  hid         bigint,
  data        jsonb not null,
  fetched_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '7 days')
);

create index if not exists ratehawk_hotel_info_cache_expires_at_idx
  on public.ratehawk_hotel_info_cache (expires_at);

create index if not exists ratehawk_hotel_info_cache_hid_idx
  on public.ratehawk_hotel_info_cache (hid);

alter table public.ratehawk_hotel_info_cache enable row level security;

-- No policies → service role only. Anon/authenticated cannot read or write.
