import { AgencySidebar } from '@/components/agency/agency-sidebar'
import { Topbar } from '@/components/shared/topbar'
import { getUser } from '@/lib/supabase/auth'

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const tenant = user?.tenants as { name: string; primary_color: string } | null

  return (
    <div className="flex h-full min-h-screen bg-slate-50">
      <AgencySidebar
        tenantName={tenant?.name ?? 'Acenta'}
        accentColor={tenant?.primary_color ?? '#10b981'}
      />
      <div className="flex-1 flex flex-col overflow-auto">
        <Topbar userEmail={user?.email} userRole="Acenta Admin" />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
