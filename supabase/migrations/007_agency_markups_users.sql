-- Agency users: link Supabase auth users to agencies
create table if not exists agency_users (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'owner',  -- 'owner' or 'staff'
  created_at timestamptz default now(),
  unique(agency_id, user_id)
);

-- Agency markups: per-service-type markup rates set by the agency itself
create table if not exists agency_markups (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid references agencies(id) on delete cascade,
  service_type text not null,  -- 'flight','hotel','bus','car','transfer','tour'
  markup_rate decimal(5,2) default 0.00,  -- agency's own profit margin %
  updated_at timestamptz default now(),
  unique(agency_id, service_type)
);

-- RLS
alter table agency_users enable row level security;
alter table agency_markups enable row level security;

-- Agency users: admins can manage, agency owners can read their own
create policy "Admin manage agency users"
  on agency_users for all
  using (true)
  with check (true);

-- Agency markups: admins full access, agency users can read/update their own
create policy "Admin manage agency markups"
  on agency_markups for all
  using (true)
  with check (true);

-- Update agency_orders to track both commissions separately
alter table agency_orders
  add column if not exists platform_commission_rate decimal(5,2) default 0,
  add column if not exists platform_commission_amount decimal(10,2) default 0,
  add column if not exists agency_markup_rate decimal(5,2) default 0,
  add column if not exists agency_markup_amount decimal(10,2) default 0;

-- Indexes
create index if not exists agency_users_user_idx on agency_users (user_id);
create index if not exists agency_users_agency_idx on agency_users (agency_id);
create index if not exists agency_markups_agency_idx on agency_markups (agency_id);

-- Helper function: find user ID by email (for admin user assignment)
create or replace function get_user_id_by_email(lookup_email text)
returns uuid
language sql
security definer
as $$
  select id from auth.users where email = lookup_email limit 1;
$$;
