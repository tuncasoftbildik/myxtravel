import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'platform_admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const [tenantRes, bookingsRes, rulesRes] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', id).single(),
    supabase.from('bookings').select('*').eq('tenant_id', id).order('created_at', { ascending: false }),
    supabase.from('commission_rules').select('*').eq('tenant_id', id),
  ])

  if (!tenantRes.data) return NextResponse.json({ error: 'Acenta bulunamadı' }, { status: 404 })

  return NextResponse.json({
    tenant: tenantRes.data,
    bookings: bookingsRes.data ?? [],
    commissionRules: rulesRes.data ?? [],
  })
}
