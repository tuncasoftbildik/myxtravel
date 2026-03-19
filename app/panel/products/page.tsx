import { searchProducts } from '@/lib/providers/mock'
import { calculatePrice, formatCurrency } from '@/lib/commission/engine'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plane, Hotel, MapPin, Car, Package } from 'lucide-react'

const typeConfig = {
  tour:     { label: 'Tur',     icon: MapPin,    color: 'bg-green-100 text-green-700' },
  hotel:    { label: 'Otel',    icon: Hotel,     color: 'bg-blue-100 text-blue-700' },
  flight:   { label: 'Uçuş',   icon: Plane,     color: 'bg-purple-100 text-purple-700' },
  transfer: { label: 'Transfer',icon: Car,       color: 'bg-orange-100 text-orange-700' },
  package:  { label: 'Paket',  icon: Package,   color: 'bg-rose-100 text-rose-700' },
}

// Platform %10 komisyon kuralı (mock — ilerleyen aşamada DB'den)
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

export default async function AgencyProducts() {
  const products = await searchProducts({})

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ürün Kataloğu</h1>
        <p className="text-slate-500 text-sm mt-1">
          Platform üzerindeki tüm aktif ürünler — fiyatlar platform komisyonu dahildir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map(product => {
          const cfg = typeConfig[product.type]
          const IconComp = cfg.icon
          const pricing = calculatePrice({
            basePrice: product.basePrice,
            currency: product.currency,
            platformRules: [mockPlatformRule],
            agencyRules: [],
            tenantId: 'demo',
            providerId: 'mock',
            productType: product.type,
          })

          return (
            <Card key={product.externalId} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{product.title}</CardTitle>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.color}`}>
                    <IconComp size={12} />
                    {cfg.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-slate-500 flex-1">{product.description}</p>

                {/* Fiyat Dökümü */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Sağlayıcı fiyatı</span>
                    <span>{formatCurrency(pricing.basePrice, pricing.currency)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Platform komisyonu (%10)</span>
                    <span>+{formatCurrency(pricing.platformCommission, pricing.currency)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Acenta komisyonu</span>
                    <span>+{formatCurrency(0, pricing.currency)}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between font-semibold text-slate-900 text-sm">
                    <span>Satış fiyatı</span>
                    <span>{formatCurrency(pricing.totalPrice, pricing.currency)}</span>
                  </div>
                </div>

                <button className="w-full text-sm bg-slate-900 text-white rounded-lg py-2 hover:bg-slate-700 transition">
                  Rezervasyon Oluştur
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
