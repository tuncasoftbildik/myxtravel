import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  if (!profile?.tenant_id) return NextResponse.json({ error: 'Acenta bulunamadı' }, { status: 400 })

  const { data } = await supabase
    .from('bookings')
    .select('booking_ref, created_at, status, customer_name, customer_email, customer_phone, base_price, platform_commission, agency_commission, total_price, currency, metadata')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  const rows = (data ?? []).map((b: Record<string, unknown>) => {
    const meta = b.metadata as { product_title?: string; product_type?: string } | null
    const netCost = Number(b.base_price) + Number(b.platform_commission)
    return [
      b.booking_ref, b.created_at, b.status,
      b.customer_name, b.customer_email, b.customer_phone ?? '',
      meta?.product_title ?? '', meta?.product_type ?? '',
      netCost, b.agency_commission, b.total_price, b.currency,
    ]
  })

  const header = ['Ref', 'Tarih', 'Durum', 'Müşteri Adı', 'Email', 'Telefon', 'Ürün', 'Tip', 'Net Fiyat', 'Komisyonum', 'Toplam', 'Para Birimi']
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rezervasyonlarim_${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}
