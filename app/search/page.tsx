import { searchProducts } from '@/lib/providers/mock'
import { calculatePrice, formatCurrency } from '@/lib/commission/engine'
import { Plane, Hotel, MapPin } from 'lucide-react'
import Link from 'next/link'

const mockPlatformRule = {
  id: 'mock-platform', name: 'Platform Default', tenant_id: null,
  provider_id: null, product_type: null, commission_type: 'percentage' as const,
  value: 10, min_amount: null, max_amount: null, is_active: true, priority: 0,
  created_at: '', updated_at: '',
}

const typeIcon = { tour: MapPin, hotel: Hotel, flight: Plane, transfer: MapPin, package: MapPin }
const typeLabel = { tour: 'Tur', hotel: 'Otel', flight: 'Uçuş', transfer: 'Transfer', package: 'Paket' }

export default async function SearchPage() {
  const products = await searchProducts({})

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-blue-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-blue-300 text-sm hover:text-white mb-4 block">← Ana Sayfa</Link>
          <h1 className="text-3xl font-bold">Ürün Arama</h1>
          <p className="text-blue-300 mt-2">Turlar, oteller ve uçuşlar</p>
        </div>
      </header>

      {/* Ürünler */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-slate-500 text-sm mb-6">{products.length} ürün bulundu</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const Icon = typeIcon[product.type]
            const pricing = calculatePrice({
              basePrice: product.basePrice,
              currency: product.currency,
              platformRules: [mockPlatformRule],
              agencyRules: [],
              tenantId: 'storefront',
              providerId: 'mock',
              productType: product.type,
            })

            return (
              <div key={product.externalId} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      {typeLabel[product.type]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 leading-snug">{product.title}</h3>
                  <p className="text-sm text-slate-500">{product.description}</p>
                  <div className="pt-2 border-t flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">itibaren</div>
                      <div className="text-xl font-bold text-slate-900">
                        {formatCurrency(pricing.totalPrice, pricing.currency)}
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                      İncele
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
