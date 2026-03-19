/**
 * Commission Engine — Kademeli komisyon hesaplama
 *
 * Fiyat akışı:
 *   base_price (sağlayıcı fiyatı)
 *   + platform_commission
 *   + agency_commission
 *   = total_price (müşterinin gördüğü fiyat)
 */

import type { Database } from '@/lib/supabase/types'

type CommissionRule = Database['public']['Tables']['commission_rules']['Row']

export interface PriceBreakdown {
  basePrice: number
  platformCommission: number
  agencyCommission: number
  totalPrice: number
  currency: string
}

/**
 * Bir kurala göre komisyon tutarını hesapla
 */
function applyRule(rule: CommissionRule, amount: number): number {
  let commission = 0

  if (rule.commission_type === 'percentage') {
    commission = (amount * Number(rule.value)) / 100
  } else {
    commission = Number(rule.value)
  }

  // Min/max sınırları
  if (rule.min_amount !== null) commission = Math.max(commission, Number(rule.min_amount))
  if (rule.max_amount !== null) commission = Math.min(commission, Number(rule.max_amount))

  return Math.round(commission * 100) / 100
}

/**
 * En yüksek öncelikli aktif kuralı bul
 */
function findBestRule(
  rules: CommissionRule[],
  opts: {
    tenantId: string | null
    providerId: string | null
    productType: string | null
  }
): CommissionRule | null {
  const active = rules
    .filter(r => r.is_active)
    .filter(r => {
      if (opts.tenantId !== null && r.tenant_id !== null && r.tenant_id !== opts.tenantId) return false
      if (opts.providerId !== null && r.provider_id !== null && r.provider_id !== opts.providerId) return false
      if (opts.productType !== null && r.product_type !== null && r.product_type !== opts.productType) return false
      return true
    })
    .sort((a, b) => b.priority - a.priority)

  return active[0] ?? null
}

/**
 * Ana hesaplama fonksiyonu
 */
export function calculatePrice(opts: {
  basePrice: number
  currency: string
  platformRules: CommissionRule[]
  agencyRules: CommissionRule[]
  tenantId: string
  providerId: string
  productType: string
}): PriceBreakdown {
  const { basePrice, currency } = opts

  // 1. Platform komisyonu
  const platformRule = findBestRule(opts.platformRules, {
    tenantId: null, // Platform kuralları tenant bağımsız
    providerId: opts.providerId,
    productType: opts.productType,
  })
  const platformCommission = platformRule ? applyRule(platformRule, basePrice) : 0

  // 2. Acenta komisyonu (platform komisyonu eklenmiş fiyat üzerinden)
  const priceAfterPlatform = basePrice + platformCommission
  const agencyRule = findBestRule(opts.agencyRules, {
    tenantId: opts.tenantId,
    providerId: opts.providerId,
    productType: opts.productType,
  })
  const agencyCommission = agencyRule ? applyRule(agencyRule, priceAfterPlatform) : 0

  const totalPrice = Math.round((basePrice + platformCommission + agencyCommission) * 100) / 100

  return {
    basePrice,
    platformCommission,
    agencyCommission,
    totalPrice,
    currency,
  }
}

/**
 * Fiyat dökümünü formatla
 */
export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
