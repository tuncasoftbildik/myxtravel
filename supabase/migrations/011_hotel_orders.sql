-- Hotel orders — records the booking funnel state across suppliers.
-- Rows are created at book() time with status='pending' and advanced as
-- the supplier call progresses. raw_request / raw_response keep a full
-- audit trail for debugging and certification reviews.
--
-- Supplier contract:
--   travelrobot → HotelCode + RoomCode
--   ratehawk    → book_hash (from prebook) + partner_order_id (we generate)
--
-- Payment model phase 1: only payment_type='hotel' (misafir otelde öder,
-- biz sadece rezervasyonu tutarız — sıfır ödeme tahsili).

create table if not exists public.hotel_orders (
  id                uuid primary key default gen_random_uuid(),
  supplier          text not null check (supplier in ('travelrobot', 'ratehawk')),
  partner_order_id  text not null unique, -- our id sent to the supplier
  supplier_order_id text,                  -- supplier's returned id (filled on finish)
  book_hash         text,                  -- RH: the locked rate token
  hotel_code        text,                  -- RH: slug id, TR: HotelCode
  hotel_name        text,
  check_in          date not null,
  check_out         date not null,
  nights            int,
  adults            int not null default 1,
  child_ages        int[] default '{}',
  room_name         text,
  board_name        text,
  total             numeric(12,2) not null,
  currency          text not null,
  payment_type      text not null default 'hotel',
  guest_info        jsonb not null, -- {firstName,lastName,email,phone,tcNo,...}
  status            text not null default 'pending'
                    check (status in ('pending', 'form_submitted', 'confirmed', 'failed', 'cancelled')),
  error_message     text,
  raw_request       jsonb,
  raw_response      jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists hotel_orders_created_at_idx
  on public.hotel_orders (created_at desc);
create index if not exists hotel_orders_supplier_status_idx
  on public.hotel_orders (supplier, status);
create index if not exists hotel_orders_partner_order_id_idx
  on public.hotel_orders (partner_order_id);

-- Service-role only access. No client policies → anon/authenticated blocked.
alter table public.hotel_orders enable row level security;

-- updated_at trigger
create or replace function public.hotel_orders_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hotel_orders_touch_updated_at on public.hotel_orders;
create trigger hotel_orders_touch_updated_at
  before update on public.hotel_orders
  for each row execute function public.hotel_orders_touch_updated_at();
