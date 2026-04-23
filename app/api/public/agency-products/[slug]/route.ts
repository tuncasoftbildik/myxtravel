import { NextRequest, NextResponse } from "next/server";
import { resolveAgencyFromHeaders } from "@/lib/agency-products/resolve-agency";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await resolveAgencyFromHeaders(req.headers);
  if (r.error) return NextResponse.json({ error: "Bulunamadi" }, { status: 404 });

  const { data, error } = await r.supabase
    .from("agency_products")
    .select("*")
    .eq("agency_id", r.agency.id)
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (error || !data) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json({ product: data, agency: r.agency });
}
