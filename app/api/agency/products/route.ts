import { NextRequest, NextResponse } from "next/server";
import { getAgencyContext } from "@/lib/agency-products/auth";
import { slugify, uniqueSlug } from "@/lib/agency-products/slug";

export async function GET() {
  const ctx = await getAgencyContext();
  if (ctx.error === "unauthorized") return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  if (ctx.error === "not_agency_user") return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .select("*")
    .eq("agency_id", ctx.agencyId!)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

export async function POST(req: NextRequest) {
  const ctx = await getAgencyContext();
  if (ctx.error === "unauthorized") return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  if (ctx.error === "not_agency_user") return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });

  const body = await req.json();
  const {
    service_type, title, short_description, description, photos,
    cover_photo, price, currency, price_note, details, is_active,
  } = body || {};

  if (!service_type || !["transfer", "tour", "hotel", "car", "bus"].includes(service_type)) {
    return NextResponse.json({ error: "Geçersiz servis tipi" }, { status: 400 });
  }
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });
  }
  if (price == null || Number.isNaN(Number(price))) {
    return NextResponse.json({ error: "Fiyat gerekli" }, { status: 400 });
  }

  const baseSlug = slugify(title) || "urun";
  const slug = await uniqueSlug(ctx.supabase, ctx.agencyId!, baseSlug);

  const { data, error } = await ctx.supabase
    .from("agency_products")
    .insert({
      agency_id: ctx.agencyId,
      service_type,
      title,
      slug,
      short_description: short_description || "",
      description: description || "",
      photos: Array.isArray(photos) ? photos : [],
      cover_photo: cover_photo || "",
      price: Number(price),
      currency: currency || "TRY",
      price_note: price_note || "",
      details: details || {},
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
