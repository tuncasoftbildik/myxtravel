'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { Upload, LayoutDashboard, Package, BookOpen, Percent, Settings, Users } from 'lucide-react'

interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  contact_email: string
  contact_phone: string | null
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Ürünler', icon: Package },
  { label: 'Rezervasyonlar', icon: BookOpen },
  { label: 'Komisyonlarım', icon: Percent },
  { label: 'Müşteriler', icon: Users },
  { label: 'Ayarlar', icon: Settings },
]

export default function AgencySettings() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [form, setForm] = useState({ name: '', primary_color: '#1e40af', secondary_color: '#3b82f6', contact_email: '', contact_phone: '' })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/panel/settings')
      .then(r => r.json())
      .then((t: Tenant) => {
        setTenant(t)
        setForm({
          name: t.name,
          primary_color: t.primary_color,
          secondary_color: t.secondary_color,
          contact_email: t.contact_email,
          contact_phone: t.contact_phone ?? '',
        })
        setLogoPreview(t.logo_url)
      })
  }, [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Local önizleme
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    const fd = new FormData()
    fd.append('logo', file)

    const res = await fetch('/api/panel/upload-logo', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)

    if (!res.ok) {
      toast.error(data.error)
      setLogoPreview(tenant?.logo_url ?? null)
      return
    }

    setLogoPreview(data.url)
    toast.success('Logo güncellendi')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const res = await fetch('/api/panel/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      toast.error(data.error)
      return
    }

    toast.success('Ayarlar kaydedildi — sayfayı yenileyin')
    setTenant(data)
  }

  if (!tenant) {
    return <div className="p-8 text-slate-400 text-sm">Yükleniyor...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel Ayarları</h1>
        <p className="text-slate-500 text-sm mt-1">White-label görünüm ve acenta bilgilerinizi özelleştirin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol: Form */}
        <div className="space-y-6">

          {/* Logo */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Logo</h2>

            <div className="flex items-center gap-5">
              <div className="w-24 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo" width={96} height={64} className="object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">Logo yok</span>
                )}
              </div>

              <div className="space-y-2">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  <Upload size={15} />
                  {uploading ? 'Yükleniyor...' : 'Logo Yükle'}
                </button>
                <p className="text-xs text-slate-400">PNG, JPG, SVG · Max 2MB</p>
              </div>
            </div>
          </div>

          {/* Renkler */}
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Marka Renkleri</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ana Renk</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                    className="w-12 h-10 border rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.primary_color}
                    onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#1e40af"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">İkincil Renk</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                    className="w-12 h-10 border rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.secondary_color}
                    onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Acenta bilgileri */}
          <form onSubmit={handleSave} className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Acenta Bilgileri</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Acenta Adı</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </div>

        {/* Sağ: Canlı Önizleme */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Canlı Önizleme</h2>

          {/* Sidebar önizlemesi */}
          <div className="rounded-xl overflow-hidden border shadow-lg">
            <div className="flex" style={{ minHeight: 420 }}>
              {/* Mini sidebar */}
              <div className="w-48 bg-slate-900 flex flex-col">
                {/* Logo alanı */}
                <div className="px-3 py-4 border-b border-slate-700">
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Logo" width={120} height={60} className="object-contain" />
                  ) : (
                    <div className="h-10 flex items-center">
                      <span className="text-sm font-bold truncate" style={{ color: form.primary_color }}>
                        {form.name || 'Acenta Adı'}
                      </span>
                    </div>
                  )}
                  <div className="text-xs mt-1.5 truncate font-medium" style={{ color: form.primary_color }}>
                    {form.name || 'Acenta Adı'}
                  </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-2 py-3 space-y-0.5">
                  {navItems.map((item, i) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors"
                      style={i === 0 ? { backgroundColor: form.primary_color + '33', color: '#fff' } : { color: '#94a3b8' }}
                    >
                      <item.icon size={13} />
                      {item.label}
                    </div>
                  ))}
                </nav>

                <div className="px-3 py-3 border-t border-slate-700 text-xs text-slate-600">
                  XTurizm v0.1
                </div>
              </div>

              {/* İçerik alanı */}
              <div className="flex-1 bg-slate-50">
                {/* Topbar */}
                <div className="h-11 bg-white border-b flex items-center justify-end px-4 gap-3">
                  <div className="w-20 h-3 bg-slate-200 rounded-full" />
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: form.primary_color }}
                  >
                    A
                  </div>
                </div>

                {/* Sayfa içeriği (mock) */}
                <div className="p-4 space-y-3">
                  <div className="w-32 h-4 bg-slate-300 rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="bg-white border rounded-lg p-3 space-y-2">
                        <div className="w-full h-2 bg-slate-200 rounded" />
                        <div className="w-2/3 h-2 bg-slate-100 rounded" />
                        <div className="w-1/2 h-3 rounded" style={{ backgroundColor: form.secondary_color + '66' }} />
                      </div>
                    ))}
                  </div>
                  <div
                    className="w-full h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: form.primary_color }}
                  >
                    Rezervasyon Oluştur
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">Renk ve logo değişikliklerini gerçek zamanlı görebilirsiniz</p>
        </div>
      </div>
    </div>
  )
}
