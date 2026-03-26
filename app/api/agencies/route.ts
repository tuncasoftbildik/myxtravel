import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — list agencies (admin: all, public: active only)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const id = searchParams.get("id");

    // Single agency by ID
    if (id) {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return NextResponse.json({ agency: data });
    }

    if (all) {
      // Verify admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        const roleList = (roles || []).map((r) => r.role);
        if (roleList.includes("super_admin") || roleList.includes("admin")) {
          const { data, error } = await supabase
            .from("agencies")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return NextResponse.json({ agencies: data || [] });
        }
      }
    }

    // Public: active only
    const { data, error } = await supabase
      .from("agencies")
      .select("id, name, slug, domain, logo_url, primary_color, secondary_color, commission_rate")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return NextResponse.json({ agencies: data || [] });
  } catch {
    return NextResponse.json({ agencies: [] });
  }
}

// POST — create or update agency (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    if (!roleList.includes("super_admin") && !roleList.includes("admin")) {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...fields } = body;
    fields.updated_at = new Date().toISOString();

    // Auto-generate slug if not provided
    if (fields.name && !fields.slug) {
      fields.slug = fields.name
        .toLowerCase()
        .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
        .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (id) {
      const { data, error } = await supabase
        .from("agencies")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ agency: data });
    } else {
      const { data, error } = await supabase
        .from("agencies")
        .insert(fields)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ agency: data });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove agency (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    if (!roleList.includes("super_admin") && !roleList.includes("admin")) {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const { id } = await req.json();
    const { error } = await supabase.from("agencies").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
