-- =============================================
-- RLS Policy Düzeltmesi — Sonsuz döngü giderme
-- Supabase SQL Editor'da çalıştır
-- =============================================

-- 1. Mevcut hatalı policy'leri kaldır
DROP POLICY IF EXISTS "platform_admin_all" ON tenants;
DROP POLICY IF EXISTS "agency_see_own_tenant" ON tenants;
DROP POLICY IF EXISTS "platform_admin_all_users" ON users;
DROP POLICY IF EXISTS "agency_see_own_users" ON users;
DROP POLICY IF EXISTS "user_see_self" ON users;
DROP POLICY IF EXISTS "public_see_active_products" ON products;
DROP POLICY IF EXISTS "platform_admin_manage_products" ON products;
DROP POLICY IF EXISTS "agency_see_own_bookings" ON bookings;
DROP POLICY IF EXISTS "platform_admin_all_bookings" ON bookings;

-- 2. Security definer fonksiyonlar
-- (RLS bypass ederek users tablosunu sorgular — döngü olmaz)
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Tenants
CREATE POLICY "platform_admin_all_tenants" ON tenants FOR ALL
  USING (auth_user_role() = 'platform_admin');

CREATE POLICY "agency_see_own_tenant" ON tenants FOR SELECT
  USING (id = auth_user_tenant_id());

-- 4. Users
CREATE POLICY "platform_admin_all_users" ON users FOR ALL
  USING (auth_user_role() = 'platform_admin');

CREATE POLICY "agency_see_own_users" ON users FOR SELECT
  USING (tenant_id = auth_user_tenant_id());

CREATE POLICY "user_see_self" ON users FOR SELECT
  USING (id = auth.uid());

-- 5. Products
CREATE POLICY "public_see_active_products" ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "platform_admin_manage_products" ON products FOR ALL
  USING (auth_user_role() = 'platform_admin');

-- 6. Bookings
CREATE POLICY "agency_see_own_bookings" ON bookings FOR SELECT
  USING (tenant_id = auth_user_tenant_id());

CREATE POLICY "platform_admin_all_bookings" ON bookings FOR ALL
  USING (auth_user_role() = 'platform_admin');

-- 7. Commission rules — anon okuyabilsin (fiyat hesaplama için)
DROP POLICY IF EXISTS "platform_admin_all_commission_rules" ON commission_rules;

CREATE POLICY "public_see_active_rules" ON commission_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "platform_admin_manage_rules" ON commission_rules FOR ALL
  USING (auth_user_role() = 'platform_admin');
