'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, User } from 'lucide-react'

interface TopbarProps {
  userEmail?: string
  userRole?: string
}

export function Topbar({ userEmail, userRole }: TopbarProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Çıkış yapıldı')
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User size={16} />
          <span>{userEmail}</span>
          {userRole && (
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
              {userRole}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition"
        >
          <LogOut size={15} />
          Çıkış
        </button>
      </div>
    </header>
  )
}
