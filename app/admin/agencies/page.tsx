'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Building2 } from 'lucide-react'
import { AgencyFormModal } from '@/components/admin/agency-form-modal'
import { Badge } from '@/components/ui/badge'

interface Agency {
  id: string
  name: string
  slug: string
  contact_email: string
  contact_phone: string | null
  primary_color: string
  secondary_color: string
  status: 'active' | 'suspended' | 'pending'
  created_at: string
}

const statusConfig = {
  active:    { label: 'Aktif',   className: 'bg-green-100 text-green-700' },
  suspended: { label: 'Pasif',   className: 'bg-red-100 text-red-700' },
  pending:   { label: 'Bekliyor',className: 'bg-yellow-100 text-yellow-700' },
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAgencies = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/agencies')
    const data = await res.json()
    setAgencies(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAgencies() }, [fetchAgencies])

  async function toggleStatus(agency: Agency) {
    const newStatus = agency.status === 'active' ? 'suspended' : 'active'
    const res = await fetch(`/api/admin/agencies/${agency.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      toast.success(newStatus === 'active' ? 'Acenta aktif edildi' : 'Acenta pasife alındı')
      fetchAgencies()
    } else {
      toast.error('İşlem başarısız')
    }
  }

  async function deleteAgency(id: string) {
    if (!confirm('Bu acentayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/agencies/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (res.ok) {
      toast.success('Acenta silindi')
      fetchAgencies()
    } else {
      toast.error('Silme işlemi başarısız')
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Acentalar</h1>
          <p className="text-slate-500 text-sm mt-1">Platforma kayıtlı tüm acentalar</p>
        </div>
        <button
          onClick={() => { setEditingAgency(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Yeni Acenta
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Yükleniyor...</div>
        ) : agencies.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">Henüz acenta yok.</p>
            <button
              onClick={() => { setEditingAgency(null); setModalOpen(true) }}
              className="mt-4 text-blue-600 text-sm hover:underline"
            >
              İlk acentayı oluştur →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Acenta</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Renkler</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Durum</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {agencies.map(agency => {
                const sc = statusConfig[agency.status] ?? statusConfig.pending
                return (
                  <tr key={agency.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{agency.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{agency.slug}</td>
                    <td className="px-5 py-3.5 text-slate-500">{agency.contact_email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: agency.primary_color }} title={agency.primary_color} />
                        <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: agency.secondary_color }} title={agency.secondary_color} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.className}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Aktif/Pasif */}
                        <button
                          onClick={() => toggleStatus(agency)}
                          title={agency.status === 'active' ? 'Pasife al' : 'Aktif et'}
                          className="text-slate-400 hover:text-slate-700 transition"
                        >
                          {agency.status === 'active'
                            ? <ToggleRight size={20} className="text-green-500" />
                            : <ToggleLeft size={20} />
                          }
                        </button>
                        {/* Düzenle */}
                        <button
                          onClick={() => { setEditingAgency(agency); setModalOpen(true) }}
                          title="Düzenle"
                          className="text-slate-400 hover:text-blue-600 transition"
                        >
                          <Pencil size={16} />
                        </button>
                        {/* Sil */}
                        <button
                          onClick={() => deleteAgency(agency.id)}
                          disabled={deletingId === agency.id}
                          title="Sil"
                          className="text-slate-400 hover:text-red-600 transition disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <AgencyFormModal
        open={modalOpen}
        agency={editingAgency}
        onClose={() => setModalOpen(false)}
        onSaved={fetchAgencies}
      />
    </div>
  )
}
