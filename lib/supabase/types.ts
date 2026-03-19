export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'platform_admin' | 'agency_admin' | 'agency_agent' | 'customer'
export type TenantStatus = 'active' | 'suspended' | 'pending'
export type ProviderStatus = 'active' | 'inactive'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type CommissionType = 'percentage' | 'fixed'
export type ProductType = 'flight' | 'hotel' | 'tour' | 'transfer' | 'package'

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string
          name: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          status: TenantStatus
          custom_domain: string | null
          contact_email: string
          contact_phone: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          tenant_id: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      providers: {
        Row: {
          id: string
          name: string
          slug: string
          type: ProductType
          status: ProviderStatus
          adapter: string
          credentials: Json
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['providers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['providers']['Insert']>
      }
      commission_rules: {
        Row: {
          id: string
          name: string
          tenant_id: string | null         // null = platform kuralı
          provider_id: string | null        // null = tüm sağlayıcılara uygula
          product_type: ProductType | null  // null = tüm ürün tiplerine uygula
          commission_type: CommissionType
          value: number
          min_amount: number | null
          max_amount: number | null
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['commission_rules']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['commission_rules']['Insert']>
      }
      products: {
        Row: {
          id: string
          provider_id: string
          external_id: string
          type: ProductType
          title: string
          description: string | null
          base_price: number
          currency: string
          metadata: Json
          available_from: string | null
          available_to: string | null
          is_active: boolean
          cached_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          booking_ref: string
          tenant_id: string
          user_id: string | null
          product_id: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          base_price: number
          platform_commission: number
          agency_commission: number
          total_price: number
          currency: string
          status: BookingStatus
          metadata: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
    }
  }
}
