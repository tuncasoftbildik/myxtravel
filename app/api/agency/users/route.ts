import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — list users for an agency (admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    if (!roleList.includes("super_admin") && !roleList.includes("admin")) {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const agencyId = new URL(req.url).searchParams.get("agency_id");
    if (!agencyId) return NextResponse.json({ error: "agency_id gerekli" }, { status: 400 });

    const { data, error } = await supabase
      .from("agency_users")
      .select("id, user_id, role, created_at")
      .eq("agency_id", agencyId);

    if (error) throw error;
    return NextResponse.json({ users: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — assign a user to an agency by email (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    if (!roleList.includes("super_admin") && !roleList.includes("admin")) {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const body = await req.json();
    const { agency_id, email, role = "owner" } = body;

    if (!agency_id || !email) {
      return NextResponse.json({ error: "agency_id ve email gerekli" }, { status: 400 });
    }

    // Find user by email using auth admin — fallback to checking profiles or just try
    // Since we can't access auth.admin from client, we look up via a workaround
    // We'll use supabase auth admin listUsers or RPC
    // Simple approach: try to find in auth.users via service role
    const { data: foundUsers, error: lookupError } = await supabase
      .rpc("get_user_id_by_email", { lookup_email: email });

    // If RPC doesn't exist, try a different approach
    let userId: string | null = null;

    if (lookupError || !foundUsers) {
      // Fallback: check if there's a profile or just inform admin
      return NextResponse.json({
        error: "Kullanici bulunamadi. Kullanicinin once sisteme kayit olmasi gerekir. E-posta: " + email
      }, { status: 404 });
    }

    userId = foundUsers;

    if (!userId) {
      return NextResponse.json({ error: "Bu e-posta ile kayitli kullanici bulunamadi" }, { status: 404 });
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from("agency_users")
      .select("id")
      .eq("agency_id", agency_id)
      .eq("user_id", userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Bu kullanici zaten bu acentaya atanmis" }, { status: 409 });
    }

    const { data, error: insertError } = await supabase
      .from("agency_users")
      .insert({ agency_id, user_id: userId, role })
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json({ user: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove user from agency (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    if (!roleList.includes("super_admin") && !roleList.includes("admin")) {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

    const { error } = await supabase.from("agency_users").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
