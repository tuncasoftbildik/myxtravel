import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// POST — create a new user account and assign to agency (super_admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    // Only super_admin can create users
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    if (!roleList.includes("super_admin")) {
      return NextResponse.json({ error: "Sadece Super Admin kullanici olusturabilir" }, { status: 403 });
    }

    const { agency_id, email, password, role = "owner" } = await req.json();

    if (!agency_id || !email || !password) {
      return NextResponse.json({ error: "agency_id, email ve password gerekli" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ayarlanmamis" }, { status: 500 });
    }

    // Create user with service role (admin API)
    const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createError) {
      if (createError.message.includes("already")) {
        return NextResponse.json({ error: "Bu e-posta ile zaten bir hesap var. 'Mevcut Kullanici Ata' sekmesini kullanin." }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user) {
      return NextResponse.json({ error: "Kullanici olusturulamadi" }, { status: 500 });
    }

    // Assign to agency
    const { error: assignError } = await adminClient
      .from("agency_users")
      .insert({
        agency_id,
        user_id: newUser.user.id,
        role,
      });

    if (assignError) {
      return NextResponse.json({ error: "Kullanici olusturuldu ama acentaya atanamadi: " + assignError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: { id: newUser.user.id, email: newUser.user.email },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
