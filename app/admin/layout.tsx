import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Topbar } from '@/components/shared/topbar'
import { getUser } from '@/lib/supabase/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  return (
    <div className="flex h-full min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Topbar userEmail={user?.email} userRole="Platform Admin" />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
