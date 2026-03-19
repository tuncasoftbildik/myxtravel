import { AgencySidebar } from '@/components/agency/agency-sidebar'
import { Topbar } from '@/components/shared/topbar'
import { getUser } from '@/lib/supabase/auth'

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const tenant = user?.tenants as {
    name: string
    primary_color: string
    secondary_color: string
    logo_url: string | null
  } | null

  const primaryColor = tenant?.primary_color ?? '#1e40af'
  const secondaryColor = tenant?.secondary_color ?? '#3b82f6'

  return (
    <div
      className="flex h-full min-h-screen bg-slate-50"
      style={{
        '--tenant-primary': primaryColor,
        '--tenant-secondary': secondaryColor,
      } as React.CSSProperties}
    >
      <AgencySidebar
        tenantName={tenant?.name ?? 'Acenta'}
        accentColor={primaryColor}
        logoUrl={tenant?.logo_url}
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
