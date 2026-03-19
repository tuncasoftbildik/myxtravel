import { createClient } from './server'
import { redirect } from 'next/navigation'
import type { UserRole } from './types'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  tenant_id: string | null
  avatar_url: string | null
  is_active: boolean
  tenants: {
    id: string
    slug: string
    name: string
    primary_color: string
    secondary_color: string
    logo_url: string | null
  } | null
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*, tenants(id, slug, name, primary_color, secondary_color, logo_url)')
    .eq('id', user.id)
    .single()

  return (profile as unknown as UserProfile) ?? null
}

export async function requireAuth(redirectTo = '/login') {
  const user = await getUser()
  if (!user) redirect(redirectTo)
  return user
}

export async function requireRole(role: string | string[], redirectTo = '/') {
  const user = await getUser()
  if (!user) redirect('/login')
  const roles = Array.isArray(role) ? role : [role]
  if (!roles.includes(user.role)) redirect(redirectTo)
  return user
}
