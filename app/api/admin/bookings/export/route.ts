import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single<{ role: string }>()
  if (profile?.role !== 'platform_admin') return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const { data } = await supabase
    .from('bookings')
    .select('booking_ref, created_at, status, customer_name, customer_email, customer_phone, base_price, platform_commission, agency_commission, total_price, currency, metadata, tenants(name)')
    .order('created_at', { ascending: false })

  const rows = (data ?? []).map((b: Record<string, unknown>) => {
    const tenants = b.tenants as { name?: string } | null
    const meta = b.metadata as { product_title?: string; product_type?: string } | null
    return [
      b.booking_ref, b.created_at, b.status,
      b.customer_name, b.customer_email, b.customer_phone ?? '',
      tenants?.name ?? '',
      meta?.product_title ?? '', meta?.product_type ?? '',
      b.base_price, b.platform_commission, b.agency_commission, b.total_price, b.currency,
    ]
  })

  const header = ['Ref', 'Tarih', 'Durum', 'Müşteri Adı', 'Email', 'Telefon', 'Acenta', 'Ürün', 'Tip', 'Net Fiyat', 'Plt. Komisyon', 'Aca. Komisyon', 'Toplam', 'Para Birimi']
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rezervasyonlar_${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}
