'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Agency {
  id: string
  name: string
  slug: string
  contact_email: string
  contact_phone: string | null
  primary_color: string
  secondary_color: string
  status: string
}

interface Props {
  open: boolean
  agency?: Agency | null
  onClose: () => void
  onSaved: () => void
}

export function AgencyFormModal({ open, agency, onClose, onSaved }: Props) {
  const isEdit = !!agency
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    contact_email: '',
    contact_phone: '',
    primary_color: '#1e40af',
    secondary_color: '#3b82f6',
  })

  useEffect(() => {
    if (agency) {
      setForm({
        name: agency.name,
        slug: agency.slug,
        contact_email: agency.contact_email,
        contact_phone: agency.contact_phone ?? '',
        primary_color: agency.primary_color,
        secondary_color: agency.secondary_color,
      })
    } else {
      setForm({ name: '', slug: '', contact_email: '', contact_phone: '', primary_color: '#1e40af', secondary_color: '#3b82f6' })
    }
  }, [agency, open])

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const url = isEdit ? `/api/admin/agencies/${agency.id}` : '/api/admin/agencies'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error)
      return
    }

    toast.success(isEdit ? 'Acenta güncellendi' : 'Acenta oluşturuldu')
    onSaved()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">{isEdit ? 'Acentayı Düzenle' : 'Yeni Acenta'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Acenta Adı *</label>
            <input
              value={form.name}
              onChange={e => {
                const name = e.target.value
                setForm(f => ({ ...f, name, slug: isEdit ? f.slug : autoSlug(name) }))
              }}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC Turizm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug * <span className="text-xs text-slate-400">(subdomain: slug.xturizm.com)</span></label>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              required
              disabled={isEdit}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="abc-turizm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="info@abcturizm.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
            <input
              value={form.contact_phone}
              onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+90 555 000 0000"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ana Renk</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                  className="w-10 h-9 border rounded cursor-pointer"
                />
                <span className="text-xs text-slate-500 font-mono">{form.primary_color}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">İkincil Renk</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                  className="w-10 h-9 border rounded cursor-pointer"
                />
                <span className="text-xs text-slate-500 font-mono">{form.secondary_color}</span>
              </div>
            </div>
          </div>

          {/* Önizleme */}
          <div className="rounded-lg p-3 text-sm font-medium text-white text-center" style={{ backgroundColor: form.primary_color }}>
            {form.name || 'Acenta Adı'} — Sidebar önizleme
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
              İptal
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
