import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Acentanın rezervasyonlarından unique müşteri listesi
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return NextResponse.json([])

  const { data, error } = await supabase
    .from('bookings')
    .select('customer_name, customer_email, customer_phone, total_price, currency, status, created_at, metadata, booking_ref')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Email bazında grupla — her müşteri için özet hesapla
  const map: Record<string, {
    name: string
    email: string
    phone: string | null
    totalSpent: number
    bookingCount: number
    lastBooking: string
    lastRef: string
    currency: string
  }> = {}

  for (const b of data ?? []) {
    if (b.status === 'cancelled') continue
    const key = b.customer_email.toLowerCase()
    if (!map[key]) {
      map[key] = {
        name: b.customer_name,
        email: b.customer_email,
        phone: b.customer_phone,
        totalSpent: 0,
        bookingCount: 0,
        lastBooking: b.created_at,
        lastRef: b.booking_ref,
        currency: b.currency,
      }
    }
    map[key].totalSpent += b.total_price
    map[key].bookingCount += 1
    if (b.created_at > map[key].lastBooking) {
      map[key].lastBooking = b.created_at
      map[key].lastRef = b.booking_ref
    }
  }

  return NextResponse.json(Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent))
}
