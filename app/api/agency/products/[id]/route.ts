import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";
import { slugify, uniqueSlug } from "@/lib/agency-products/slug";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .select("*")
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!)
    .is("deleted_at", null)
    .single();

  if (error) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const body = await req.json();
  const allowed = [
    "title", "short_description", "description", "photos", "cover_photo",
    "price", "currency", "price_note", "details", "is_active", "display_order",
  ];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) update[k] = body[k];

  if (typeof body.title === "string" && body.title.trim()) {
    const baseSlug = slugify(body.title) || "urun";
    update.slug = await uniqueSlug(ctx.supabase, ctx.agencyId!, baseSlug, id);
  }

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .update(update)
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getAgencyContext();
  if (ctx.error) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const { error } = await ctx.supabase
    .from("agency_products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id)
    .eq("agency_id", ctx.agencyId!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
