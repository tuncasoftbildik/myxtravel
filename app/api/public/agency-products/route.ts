import { NextRequest, NextResponse } from "next/server";
import { resolveAgencyFromHeaders } from "@/lib/agency-products/resolve-agency";

export async function GET(req: NextRequest) {
  const r = await resolveAgencyFromHeaders(req.headers);
  if (r.error === "no_domain") return NextResponse.json({ products: [] }, { status: 404 });
  if (r.error === "not_found") return NextResponse.json({ products: [] }, { status: 404 });

  const url = new URL(req.url);
  const serviceType = url.searchParams.get("service_type");

  let q = r.supabase
    .from("agency_products")
    .select("id,slug,service_type,title,short_description,photos,cover_photo,price,currency,price_note,details")
    .eq("agency_id", r.agency.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (serviceType) q = q.eq("service_type", serviceType);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [], agency: r.agency });
}
