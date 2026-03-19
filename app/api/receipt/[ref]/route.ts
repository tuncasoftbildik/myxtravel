import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, tenants(name, contact_email, contact_phone, logo_url, primary_color)')
    .eq('booking_ref', ref)
    .single()

  if (error || !booking) return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 })
  return NextResponse.json(booking)
}
