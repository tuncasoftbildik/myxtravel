import { NextRequest, NextResponse } from "next/server";
import { resolveAgencyFromHeaders } from "@/lib/agency-products/resolve-agency";
import { checkRateLimit, getClientIp } from "@/lib/agency-products/rate-limit";

export async function POST(req: NextRequest) {
  const r = await resolveAgencyFromHeaders(req.headers);
  if (r.error) return NextResponse.json({ error: "Bulunamadi" }, { status: 404 });

  const ip = getClientIp(req.headers);
  const ua = req.headers.get("user-agent") || "";

  const rl = checkRateLimit(`booking:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Çok fazla istek, lütfen daha sonra tekrar deneyin" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const body = await req.json();
  const {
    product_id, customer_name, customer_email, customer_phone,
    requested_date, passenger_count, notes, company,
  } = body || {};

  if (company) return NextResponse.json({ success: true });

  if (!product_id || !customer_name || !customer_email || !customer_phone) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  const { data: product } = await r.supabase
    .from("agency_products")
    .select("id")
    .eq("id", product_id)
    .eq("agency_id", r.agency.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });

  const { data, error } = await r.supabase
    .from("agency_product_requests")
    .insert({
      agency_id: r.agency.id,
      product_id,
      customer_name: String(customer_name).slice(0, 200),
      customer_email: String(customer_email).slice(0, 200),
      customer_phone: String(customer_phone).slice(0, 50),
      requested_date: requested_date || null,
      passenger_count: Number(passenger_count) || 1,
      notes: String(notes || "").slice(0, 2000),
      ip_address: ip,
      user_agent: ua.slice(0, 500),
      status: "new",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, id: data.id });
}
