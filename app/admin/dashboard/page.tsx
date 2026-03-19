import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Package, BookOpen, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Genel platform durumu ve özet istatistikler</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Toplam Acenta</CardTitle>
            <Building2 size={20} className="text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-slate-900">1</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Aktif Ürün</CardTitle>
            <Package size={20} className="text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-slate-900">7</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Bu Ay Rezervasyon</CardTitle>
            <BookOpen size={20} className="text-orange-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-slate-900">0</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Bu Ay Gelir</CardTitle>
            <TrendingUp size={20} className="text-purple-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-slate-900">₺0</div></CardContent>
        </Card>
      </div>

      {/* Mimari Özeti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Komisyon Akışı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="bg-slate-100 rounded-lg px-4 py-2 text-center">
              <div className="font-semibold text-slate-700">Sağlayıcı Fiyatı</div>
              <div className="text-xs text-slate-500 mt-1">base_price</div>
            </div>
            <div className="text-slate-400 font-bold">+</div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
              <div className="font-semibold text-blue-700">Platform Komisyonu</div>
              <div className="text-xs text-blue-500 mt-1">Varsayılan %10</div>
            </div>
            <div className="text-slate-400 font-bold">+</div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
              <div className="font-semibold text-green-700">Acenta Komisyonu</div>
              <div className="text-xs text-green-500 mt-1">Acenta tanımlar</div>
            </div>
            <div className="text-slate-400 font-bold">=</div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-center">
              <div className="font-semibold text-orange-700">Satış Fiyatı</div>
              <div className="text-xs text-orange-500 mt-1">Müşteri görür</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sağlayıcılar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktif Sağlayıcılar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Mock Tour Provider', type: 'Tur', status: 'Aktif', products: 3 },
              { name: 'Mock Hotel Provider', type: 'Otel', status: 'Aktif', products: 2 },
              { name: 'Mock Flight Provider', type: 'Uçuş', status: 'Aktif', products: 2 },
            ].map(p => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.type} · {p.products} ürün</div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
