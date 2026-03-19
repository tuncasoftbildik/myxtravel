'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Plug, Pencil, Trash2, ToggleRight, ToggleLeft, X } from 'lucide-react'

interface Provider {
  id: string
  name: string
  slug: string
  type: string
  status: 'active' | 'inactive'
  adapter: string
  created_at: string
}

const TYPES = [
  { value: 'tour',     label: 'Tur' },
  { value: 'hotel',    label: 'Otel' },
  { value: 'flight',   label: 'Uçuş' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'package',  label: 'Paket' },
]

const ADAPTERS = [
  { value: 'mock',       label: 'Mock (Test)' },
  { value: 'travelgate', label: 'TravelGate' },
  { value: 'hotelbeds',  label: 'HotelBeds' },
  { value: 'amadeus',    label: 'Amadeus' },
  { value: 'custom',     label: 'Özel' },
]

const EMPTY_FORM = { name: '', type: 'tour', adapter: 'mock' }

export default function AdminProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Provider | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/providers')
    const data = await res.json()
    setProviders(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(p: Provider) {
    setEditing(p)
    setForm({ name: p.name, type: p.type, adapter: p.adapter })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const url = editing ? `/api/admin/providers/${editing.id}` : '/api/admin/providers'
    const method = editing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { toast.error(data.error); return }
    toast.success(editing ? 'Güncellendi' : 'Sağlayıcı eklendi')
    setShowForm(false)
    fetchProviders()
  }

  async function toggleStatus(p: Provider) {
    const res = await fetch(`/api/admin/providers/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: p.status === 'active' ? 'inactive' : 'active' }),
    })
    if (res.ok) { fetchProviders(); toast.success('Durum güncellendi') }
  }

  async function deleteProvider(id: string) {
    if (!confirm('Bu sağlayıcıyı silmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' })
    if (res.ok) { fetchProviders(); toast.success('Silindi') }
    else { const d = await res.json(); toast.error(d.error) }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sağlayıcılar</h1>
          <p className="text-slate-500 text-sm mt-1">Tur, otel ve uçuş API sağlayıcılarını yönetin</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={15} /> Sağlayıcı Ekle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">{editing ? 'Sağlayıcı Düzenle' : 'Yeni Sağlayıcı'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sağlayıcı Adı *</label>
              <input
                value={form.name} required
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: THY Uçuşları"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tip *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Adaptör</label>
              <select value={form.adapter} onChange={e => setForm(f => ({ ...f, adapter: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {ADAPTERS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="col-span-3 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition">İptal</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Kaydediliyor...' : editing ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Yükleniyor...</div>
        ) : providers.length === 0 ? (
          <div className="p-12 text-center">
            <Plug size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">Sağlayıcı yok.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Sağlayıcı</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Tip</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Adaptör</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Durum</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Eklenme</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {providers.map(p => (
                <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${p.status === 'inactive' ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{p.slug}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {TYPES.find(t => t.value === p.type)?.label ?? p.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{p.adapter}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(p.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleStatus(p)} className="text-slate-400 hover:text-slate-700 transition">
                        {p.status === 'active' ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-blue-600 transition"><Pencil size={15} /></button>
                      <button onClick={() => deleteProvider(p.id)} className="text-slate-400 hover:text-red-600 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
