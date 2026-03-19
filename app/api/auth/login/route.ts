import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: 'Email veya şifre hatalı' }, { status: 401 })
  }

  // Kullanıcı profilini çek
  const { data: profile } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', data.user.id)
    .single<{ role: string; tenant_id: string | null }>()

  const role = profile?.role ?? 'customer'

  // Role göre yönlendirme hedefi
  let redirectTo = '/'
  if (role === 'platform_admin') redirectTo = '/admin/dashboard'
  else if (role === 'agency_admin' || role === 'agency_agent') redirectTo = '/panel/dashboard'

  return NextResponse.json({ ok: true, role, redirectTo })
}
