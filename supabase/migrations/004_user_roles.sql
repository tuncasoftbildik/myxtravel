-- User roles table
create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'user',
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- RLS
alter table user_roles enable row level security;

-- Herkes kendi rolünü okuyabilir
create policy "Users can read own roles"
  on user_roles for select
  using (auth.uid() = user_id);

-- Sadece super_admin yeni rol atayabilir
create policy "Super admins can manage roles"
  on user_roles for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- İlk super_admin'i ata (info@viagotransfer.com)
insert into user_roles (user_id, role)
select id, 'super_admin'
from auth.users
where email = 'info@viagotransfer.com'
on conflict (user_id, role) do nothing;
