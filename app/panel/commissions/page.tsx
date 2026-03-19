'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, calculatePrice } from '@/lib/commission/engine'

const mockPlatformRule = {
  id: 'mock-platform',
  name: 'Platform Default',
  tenant_id: null,
  provider_id: null,
  product_type: null,
  commission_type: 'percentage' as const,
  value: 10,
  min_amount: null,
  max_amount: null,
  is_active: true,
  priority: 0,
  created_at: '',
  updated_at: '',
}

export default function AgencyCommissions() {
  const [myRate, setMyRate] = useState(5)
  const exampleBase = 10000

  const myRule = {
    id: 'my-rule',
    name: 'Acenta Komisyonu',
    tenant_id: 'demo',
    provider_id: null,
    product_type: null,
    commission_type: 'percentage' as const,
    value: myRate,
    min_amount: null,
    max_amount: null,
    is_active: true,
    priority: 0,
    created_at: '',
    updated_at: '',
  }

  const pricing = calculatePrice({
    basePrice: exampleBase,
    currency: 'TRY',
    platformRules: [mockPlatformRule],
    agencyRules: [myRule],
    tenantId: 'demo',
    providerId: 'mock',
    productType: 'tour',
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Komisyon Ayarlarım</h1>
        <p className="text-slate-500 text-sm mt-1">
          Platform komisyonunun üzerine kendi komisyonunuzu ekleyin.
        </p>
      </div>

      {/* Platform komisyonu (salt okunur) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Platform Komisyonu</CardTitle>
            <Badge variant="secondary">Salt Okunur</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-1">
          <p>Platform tüm ürünlere <strong>%10</strong> komisyon ekler.</p>
          <p className="text-xs text-slate-400">Bu oran platform yöneticisi tarafından belirlenir; değiştiremezsiniz.</p>
        </CardContent>
      </Card>

      {/* Acenta komisyon ayarı */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Benim Komisyonum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 w-32">Oran (%):</label>
            <input
              type="number"
              min={0}
              max={50}
              value={myRate}
              onChange={e => setMyRate(Number(e.target.value))}
              className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Örnek hesaplama */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="font-medium text-slate-700 mb-2">Örnek Hesaplama (₺10.000 ürün için)</div>
            <div className="flex justify-between text-slate-500">
              <span>Sağlayıcı fiyatı</span>
              <span>{formatCurrency(pricing.basePrice)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Platform komisyonu (%10)</span>
              <span>+{formatCurrency(pricing.platformCommission)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Benim komisyonum (%{myRate})</span>
              <span>+{formatCurrency(pricing.agencyCommission)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-slate-900">
              <span>Müşteriye gösterilen fiyat</span>
              <span>{formatCurrency(pricing.totalPrice)}</span>
            </div>
          </div>

          <button className="bg-slate-900 text-white text-sm px-6 py-2 rounded-lg hover:bg-slate-700 transition">
            Kaydet (yakında)
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
