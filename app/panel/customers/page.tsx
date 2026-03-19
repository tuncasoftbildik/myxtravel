'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/commission/engine'
import { Users, Search, X, Mail, Phone, TrendingUp, BookOpen } from 'lucide-react'

interface Customer {
  name: string
  email: string
  phone: string | null
  totalSpent: number
  bookingCount: number
  lastBooking: string
  lastRef: string
  currency: string
}

export default function AgencyCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/panel/customers')
    const data = await res.json()
    setCustomers(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q)
    )
  })

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const totalBookings = customers.reduce((s, c) => s + c.bookingCount, 0)

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Müşteriler</h1>
        <p className="text-slate-500 text-sm mt-1">Acentanızdan rezervasyon yapmış müşteriler</p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Toplam Müşteri', value: customers.length, suffix: 'kişi', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Toplam Rezervasyon', value: totalBookings, suffix: 'adet', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Toplam Ciro', value: formatCurrency(totalRevenue), suffix: '', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white border rounded-xl p-4 flex items-start gap-3">
              <div className={`${s.bg} p-2 rounded-lg`}>
                <Icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {s.value}{s.suffix ? <span className="text-sm font-normal text-slate-400 ml-1">{s.suffix}</span> : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Arama */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="İsim, email veya telefon..."
          className="w-full border rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              {search ? 'Aramanızla eşleşen müşteri bulunamadı.' : 'Henüz müşteri yok.'}
            </p>
            {!search && <p className="text-slate-400 text-xs mt-1">Rezervasyonlar oluşturuldukça müşteriler burada görünür.</p>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Müşteri</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">İletişim</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Rezervasyon</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Toplam Harcama</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Son Rezervasyon</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(c => (
                <tr
                  key={c.email}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${selected?.email === c.email ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelected(selected?.email === c.email ? null : c)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: `hsl(${c.email.charCodeAt(0) * 7 % 360}, 55%, 50%)` }}
                      >
                        {initials(c.name)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-400">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.phone ? (
                      <span className="text-slate-600 text-xs">{c.phone}</span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="font-semibold text-slate-900">{c.bookingCount}</span>
                    <span className="text-slate-400 text-xs ml-1">adet</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    {formatCurrency(c.totalSpent, c.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs text-blue-600">{c.lastRef}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(c.lastBooking).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detay paneli */}
      {selected && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: `hsl(${selected.email.charCodeAt(0) * 7 % 360}, 55%, 50%)` }}
              >
                {initials(selected.name)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Toplam Rezervasyon</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{selected.bookingCount}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Toplam Harcama</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{formatCurrency(selected.totalSpent, selected.currency)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Son Rezervasyon Ref</p>
              <p className="font-mono text-sm font-bold text-blue-600 mt-0.5">{selected.lastRef}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">Son İşlem Tarihi</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {new Date(selected.lastBooking).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <a
              href={`mailto:${selected.email}`}
              className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              <Mail size={14} />
              E-posta Gönder
            </a>
            {selected.phone && (
              <a
                href={`tel:${selected.phone}`}
                className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                <Phone size={14} />
                {selected.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
