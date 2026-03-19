import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return NextResponse.json({ error: 'Acenta bulunamadı' }, { status: 400 })

  const formData = await request.formData()
  const file = formData.get('logo') as File | null

  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

  // Dosya tipi kontrolü
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
    return NextResponse.json({ error: 'Sadece PNG, JPG, WEBP veya SVG yüklenebilir.' }, { status: 400 })
  }

  // Max 2MB
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Dosya boyutu max 2MB olabilir.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const path = `${profile.tenant_id}/logo.${ext}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('tenant-logos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('tenant-logos')
    .getPublicUrl(path)

  // Logo URL'i tenant'a kaydet
  await supabase
    .from('tenants')
    .update({ logo_url: publicUrl })
    .eq('id', profile.tenant_id)

  return NextResponse.json({ ok: true, url: publicUrl })
}
