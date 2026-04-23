import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";

const ALLOWED_STATUS = ["new", "contacted", "confirmed", "cancelled", "completed"] as const;
type AllowedStatus = typeof ALLOWED_STATUS[number];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!ALLOWED_STATUS.includes(body.status as AllowedStatus)) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.agency_notes === "string") update.agency_notes = body.agency_notes;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
  }

  const { data, error } = await ctx.supabase
    .from("agency_product_requests")
    .update(update)
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ request: data });
}
