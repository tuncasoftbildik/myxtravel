import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('providers')
    .select('id, name, slug, type, status, adapter, created_at')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'platform_admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const body = await request.json()
  const { name, type, adapter } = body

  if (!name || !type) return NextResponse.json({ error: 'Ad ve tip zorunludur' }, { status: 400 })

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data, error } = await supabase
    .from('providers')
    .insert({ name, slug, type, adapter: adapter ?? 'mock', status: 'active' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
