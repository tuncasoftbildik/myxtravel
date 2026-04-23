import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";

export async function GET(req: NextRequest) {
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let q = ctx.supabase
    .from("agency_product_requests")
    .select("*, product:agency_products(id,title,service_type,slug)")
    .eq("agency_id", ctx.agencyId!)
    .order("created_at", { ascending: false });

  if (status) {
    const list = status.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length) q = q.in("status", list);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data || [] });
}
