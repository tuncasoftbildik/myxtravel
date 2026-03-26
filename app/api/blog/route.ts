import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — fetch blog posts (public: published only, admin: all)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const slug = searchParams.get("slug");

    if (slug) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return NextResponse.json({ post: data });
    }

    let query = supabase.from("blog_posts").select("*");

    if (all) {
      // Admin wants all posts — verify admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        const roleList = (roles || []).map((r) => r.role);
        if (roleList.includes("super_admin") || roleList.includes("admin")) {
          query = query.order("created_at", { ascending: false });
          const { data, error } = await query;
          if (error) throw error;
          return NextResponse.json({ posts: data || [] });
        }
      }
    }

    // Public: only published
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ posts: data || [] });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

// POST — create or update blog post (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

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

    // Auto-generate slug from title if not provided
    if (fields.title && !fields.slug) {
      fields.slug = fields.title
        .toLowerCase()
        .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
        .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // Set published_at when publishing
    if (fields.is_published && !fields.published_at) {
      fields.published_at = new Date().toISOString();
    }

    if (id) {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ post: data });
    } else {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(fields)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ post: data });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove blog post (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    if (!roleList.includes("super_admin") && !roleList.includes("admin")) {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const { id } = await req.json();
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
