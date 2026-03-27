import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

async function requireSuperAdmin(supabase: any, userId: string) {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roleList = (roles || []).map((r: any) => r.role);
  return roleList.includes("super_admin");
}

// GET — list all admin users with their permissions
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const isSuperAdmin = await requireSuperAdmin(supabase, user.id);
    if (!isSuperAdmin) return NextResponse.json({ error: "Super Admin yetkisi gerekli" }, { status: 403 });

    // Get all admin roles (admin + super_admin)
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "super_admin"]);

    if (rolesError) throw rolesError;

    const userIds = (adminRoles || []).map((r) => r.user_id);
    if (userIds.length === 0) return NextResponse.json({ admins: [] });

    // Get permissions for all admins
    const { data: permissions } = await supabase
      .from("admin_permissions")
      .select("user_id, permission")
      .in("user_id", userIds);

    // Get user emails via service role
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let userMap: Record<string, { email: string; full_name: string }> = {};

    if (serviceKey) {
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
      );
      const { data: { users } } = await serviceClient.auth.admin.listUsers();
      for (const u of users || []) {
        userMap[u.id] = {
          email: u.email || "",
          full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "",
        };
      }
    }

    // Build admin list
    const permMap = new Map<string, string[]>();
    for (const p of permissions || []) {
      const list = permMap.get(p.user_id) || [];
      list.push(p.permission);
      permMap.set(p.user_id, list);
    }

    const admins = (adminRoles || []).map((r) => ({
      user_id: r.user_id,
      role: r.role,
      email: userMap[r.user_id]?.email || "",
      full_name: userMap[r.user_id]?.full_name || "",
      permissions: r.role === "super_admin" ? ["*"] : (permMap.get(r.user_id) || []),
    }));

    return NextResponse.json({ admins });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — add admin role to existing user OR create new user with admin role
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const isSuperAdmin = await requireSuperAdmin(supabase, user.id);
    if (!isSuperAdmin) return NextResponse.json({ error: "Super Admin yetkisi gerekli" }, { status: 403 });

    const body = await req.json();
    const { email, password, full_name, permissions } = body;

    if (!email) return NextResponse.json({ error: "Email gerekli" }, { status: 400 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ayarlanmamis" }, { status: 500 });

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    let targetUserId: string;

    // Check if user already exists
    const { data: { users: existingUsers } } = await serviceClient.auth.admin.listUsers();
    const existingUser = (existingUsers || []).find((u) => u.email === email);

    if (existingUser) {
      targetUserId = existingUser.id;
    } else {
      // Create new user
      if (!password || password.length < 6) {
        return NextResponse.json({ error: "Yeni kullanici icin en az 6 karakter sifre gerekli" }, { status: 400 });
      }
      const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || email.split("@")[0] },
      });
      if (createError) throw createError;
      targetUserId = newUser.user.id;
    }

    // Assign admin role (upsert to avoid duplicate)
    const { error: roleError } = await serviceClient
      .from("user_roles")
      .upsert(
        { user_id: targetUserId, role: "admin" },
        { onConflict: "user_id,role" }
      );
    if (roleError) throw roleError;

    // Set permissions — clear existing and insert new
    await serviceClient
      .from("admin_permissions")
      .delete()
      .eq("user_id", targetUserId);

    if (permissions && permissions.length > 0) {
      const permRows = permissions.map((p: string) => ({
        user_id: targetUserId,
        permission: p,
      }));
      const { error: permError } = await serviceClient
        .from("admin_permissions")
        .insert(permRows);
      if (permError) throw permError;
    }

    return NextResponse.json({
      success: true,
      user_id: targetUserId,
      email,
      permissions: permissions || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT — update admin permissions
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const isSuperAdmin = await requireSuperAdmin(supabase, user.id);
    if (!isSuperAdmin) return NextResponse.json({ error: "Super Admin yetkisi gerekli" }, { status: 403 });

    const body = await req.json();
    const { user_id, permissions } = body;

    if (!user_id) return NextResponse.json({ error: "user_id gerekli" }, { status: 400 });

    // Don't allow editing super_admin permissions
    const targetIsSuperAdmin = await requireSuperAdmin(supabase, user_id);
    if (targetIsSuperAdmin) {
      return NextResponse.json({ error: "Super Admin yetkilerini degistiremezsiniz" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ayarlanmamis" }, { status: 500 });

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    // Clear and re-insert permissions
    await serviceClient
      .from("admin_permissions")
      .delete()
      .eq("user_id", user_id);

    if (permissions && permissions.length > 0) {
      const permRows = permissions.map((p: string) => ({
        user_id,
        permission: p,
      }));
      const { error: permError } = await serviceClient
        .from("admin_permissions")
        .insert(permRows);
      if (permError) throw permError;
    }

    return NextResponse.json({ success: true, user_id, permissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove admin role from user
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const isSuperAdmin = await requireSuperAdmin(supabase, user.id);
    if (!isSuperAdmin) return NextResponse.json({ error: "Super Admin yetkisi gerekli" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("user_id");
    if (!targetUserId) return NextResponse.json({ error: "user_id gerekli" }, { status: 400 });

    // Don't allow removing super_admin
    const targetIsSuperAdmin = await requireSuperAdmin(supabase, targetUserId);
    if (targetIsSuperAdmin) {
      return NextResponse.json({ error: "Super Admin silinemez" }, { status: 400 });
    }

    // Can't remove yourself
    if (targetUserId === user.id) {
      return NextResponse.json({ error: "Kendinizi kaldiramazsiniz" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ayarlanmamis" }, { status: 500 });

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    // Remove admin role
    await serviceClient
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId)
      .eq("role", "admin");

    // Remove all permissions
    await serviceClient
      .from("admin_permissions")
      .delete()
      .eq("user_id", targetUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
