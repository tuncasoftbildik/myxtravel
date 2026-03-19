'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/commission/engine'
import { ArrowLeft, Building2, BookOpen, TrendingUp, Percent, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react'

interface Tenant {
  id: string
  name: string
  slug: string
  status: string
  contact_email: string
  contact_phone: string | null
  primary_color: string
  created_at: string
}

interface Booking {
  id: string
  booking_ref: string
  customer_name: string
  customer_email: string
  total_price: number
  platform_commission: number
  agency_commission: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  metadata: { product_title?: string }
  created_at: string
}

interface Rule {
  id: string
  name: string
  product_type: string | null
  commission_type: 'percentage' | 'fixed'
  value: number
  is_active: boolean
}

const STATUS_CONFIG = {
  pending:   { label: 'Bekliyor',   icon: Clock,        className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Onaylı',     icon: CheckCircle,  className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'İptal',      icon: XCircle,      className: 'bg-red-100 text-red-700' },
  completed: { label: 'Tamamlandı', icon: CheckCircle,  className: 'bg-blue-100 text-blue-700' },
}

export default function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<{ tenant: Tenant; bookings: Booking[]; commissionRules: Rule[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/agencies/${id}/details`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-slate-400 text-sm">Yükleniyor...</div>
  if (!data) return <div className="p-8 text-slate-400 text-sm">Acenta bulunamadı.</div>

  const { tenant, bookings, commissionRules } = data
  const active = bookings.filter(b => b.status !== 'cancelled')
  const totalRevenue = active.reduce((s, b) => s + b.total_price, 0)
  const totalPlatformComm = active.reduce((s, b) => s + b.platform_commission, 0)
  const totalAgencyComm = active.reduce((s, b) => s + b.agency_commission, 0)

  return (
    <div className="p-8 space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 transition">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tenant.primary_color }}>
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
            <p className="text-slate-500 text-sm">{tenant.slug} · {tenant.contact_email}</p>
          </div>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {tenant.status === 'active' ? 'Aktif' : 'Askıya Alındı'}
        </span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Rezervasyon', value: bookings.length, suffix: 'adet', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Toplam Ciro', value: formatCurrency(totalRevenue), suffix: '', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Platform Komisyonu', value: formatCurrency(totalPlatformComm), suffix: '', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Acenta Komisyonu', value: formatCurrency(totalAgencyComm), suffix: '', icon: Percent, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white border rounded-xl p-4 flex items-start gap-3">
              <div className={`${s.bg} p-2 rounded-lg`}><Icon size={18} className={s.color} /></div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{s.value}{s.suffix && <span className="text-sm font-normal text-slate-400 ml-1">{s.suffix}</span>}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rezervasyonlar */}
        <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Son Rezervasyonlar</h2>
            <span className="text-xs text-slate-400">{bookings.length} adet</span>
          </div>
          {bookings.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">Henüz rezervasyon yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs">Ref</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs">Müşteri</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs">Ürün</th>
                    <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs">Toplam</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs">Durum</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.slice(0, 20).map(b => {
                    const sc = STATUS_CONFIG[b.status]
                    const Icon = sc.icon
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-600">{b.booking_ref}</td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-900 text-xs">{b.customer_name}</div>
                          <div className="text-slate-400 text-xs">{b.customer_email}</div>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 text-xs max-w-[140px] truncate">{b.metadata?.product_title ?? '—'}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-xs">{formatCurrency(b.total_price, b.currency)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.className}`}>
                            <Icon size={10} />{sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <a href={`/receipt/${b.booking_ref}`} target="_blank" className="text-slate-400 hover:text-blue-600 transition">
                            <ExternalLink size={13} />
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sağ: acenta bilgileri + komisyon kuralları */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 text-sm">Acenta Bilgileri</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Kayıt Tarihi</span>
                <span className="text-slate-800">{new Date(tenant.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telefon</span>
                <span className="text-slate-800">{tenant.contact_phone ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vitrin</span>
                <a href={`/display/${tenant.slug}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                  Görüntüle <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-slate-800 text-sm">Komisyon Kuralları</h2>
            {commissionRules.length === 0 ? (
              <p className="text-slate-400 text-xs">Kural tanımlanmamış.</p>
            ) : (
              <div className="space-y-2">
                {commissionRules.map(r => (
                  <div key={r.id} className={`flex items-center justify-between text-xs ${!r.is_active ? 'opacity-40' : ''}`}>
                    <span className="text-slate-600 truncate max-w-[140px]">{r.name}</span>
                    <span className={`font-semibold ${r.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                      {r.commission_type === 'percentage' ? `%${r.value}` : `₺${r.value}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
