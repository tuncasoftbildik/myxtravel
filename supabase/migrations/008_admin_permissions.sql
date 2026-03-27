-- Admin permissions: super_admin can assign specific module access to admin users
-- super_admin always has full access (bypasses this table)

create table if not exists admin_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  permission text not null,
  created_at timestamptz default now(),
  unique(user_id, permission)
);

-- RLS
alter table admin_permissions enable row level security;

-- Users can read their own permissions
create policy "Users can read own permissions"
  on admin_permissions for select
  using (auth.uid() = user_id);

-- Super admins can read all permissions
create policy "Super admins can read all permissions"
  on admin_permissions for select
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'super_admin'
    )
  );

-- Only super_admin can manage permissions
create policy "Super admins can insert permissions"
  on admin_permissions for insert
  with check (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'super_admin'
    )
  );

create policy "Super admins can delete permissions"
  on admin_permissions for delete
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'super_admin'
    )
  );

-- Available permissions (for reference):
-- genel        → Genel Ayarlar
-- icerik       → Ana Sayfa İçerik
-- kampanyalar  → Kampanya Yönetimi
-- logolar      → Logo Yönetimi
-- footer       → Footer Ayarları
-- sayfalar     → Sayfa İçerikleri
-- blog         → Blog Yönetimi
-- aboneler     → E-Bülten Aboneleri
-- acentalar    → Acenta Yönetimi
-- raporlar     → Satış Raporları
