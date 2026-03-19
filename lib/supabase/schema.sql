-- =============================================
-- XTurizm — Supabase Schema
-- =============================================

-- Tenants (Alt Acentalar)
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0f172a',
  secondary_color TEXT NOT NULL DEFAULT '#3b82f6',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending')),
  custom_domain TEXT UNIQUE,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('platform_admin', 'agency_admin', 'agency_agent', 'customer')),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers (Dış Sağlayıcılar)
CREATE TABLE providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'tour', 'transfer', 'package')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  adapter TEXT NOT NULL DEFAULT 'mock',
  credentials JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission Rules (Kademeli Komisyon)
CREATE TABLE commission_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,   -- NULL = platform kuralı
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE, -- NULL = tüm sağlayıcılar
  product_type TEXT CHECK (product_type IN ('flight', 'hotel', 'tour', 'transfer', 'package')),
  commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
  value NUMERIC(10,4) NOT NULL,
  min_amount NUMERIC(10,2),
  max_amount NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Normalize Ürün Cache)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'tour', 'transfer', 'package')),
  title TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  metadata JSONB NOT NULL DEFAULT '{}',
  available_from DATE,
  available_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, external_id)
);

-- Bookings (Rezervasyonlar)
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL DEFAULT 'XT-' || UPPER(SUBSTR(MD5(gen_random_uuid()::text), 1, 8)),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  platform_commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  agency_commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  metadata JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_commission_rules_tenant ON commission_rules(tenant_id);
CREATE INDEX idx_commission_rules_priority ON commission_rules(priority DESC);
CREATE INDEX idx_products_provider ON products(provider_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);

-- =============================================
-- Updated_at triggers
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_commission_rules_updated_at BEFORE UPDATE ON commission_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Platform admin her şeyi görebilir
CREATE POLICY "platform_admin_all" ON tenants FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
);

-- Acenta kendi tenant'ını görebilir
CREATE POLICY "agency_see_own_tenant" ON tenants FOR SELECT USING (
  id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
);

-- Users: platform admin tümünü görür, acenta kendi tenant kullanıcılarını görür
CREATE POLICY "platform_admin_all_users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
);
CREATE POLICY "agency_see_own_users" ON users FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "user_see_self" ON users FOR SELECT USING (id = auth.uid());

-- Products: herkes aktif ürünleri görebilir
CREATE POLICY "public_see_active_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "platform_admin_manage_products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
);

-- Bookings: acenta kendi rezervasyonlarını görür
CREATE POLICY "agency_see_own_bookings" ON bookings FOR SELECT USING (
  tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "platform_admin_all_bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
);

-- =============================================
-- Seed Data — Mock Provider + Demo Tenant
-- =============================================
INSERT INTO providers (name, slug, type, adapter, status) VALUES
  ('Mock Tour Provider', 'mock-tour', 'tour', 'mock', 'active'),
  ('Mock Hotel Provider', 'mock-hotel', 'hotel', 'mock', 'active'),
  ('Mock Flight Provider', 'mock-flight', 'flight', 'mock', 'active');

-- Platform komisyon kuralı (%10)
INSERT INTO commission_rules (name, commission_type, value, priority) VALUES
  ('Platform Default %10', 'percentage', 10, 0);

-- Demo acenta
INSERT INTO tenants (slug, name, primary_color, secondary_color, status, contact_email) VALUES
  ('demo', 'Demo Acenta', '#1e40af', '#3b82f6', 'active', 'demo@xturizm.com');
