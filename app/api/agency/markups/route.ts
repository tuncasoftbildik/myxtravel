import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SERVICE_TYPES = ["flight", "hotel", "bus", "car", "transfer", "tour"];

// Helper: check if user is agency owner/staff for given agency
async function getAgencyAccess(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, agencyId?: string) {
  let query = supabase
    .from("agency_users")
    .select("agency_id, role")
    .eq("user_id", userId);

  if (agencyId) query = query.eq("agency_id", agencyId);

  const { data } = await query.limit(1).single();
  return data;
}

// GET — get markups for an agency
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    let agencyId = searchParams.get("agency_id");

    // Check if admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    const isAdmin = roleList.includes("super_admin") || roleList.includes("admin");

    // If not admin, must be agency user
    if (!isAdmin) {
      const access = await getAgencyAccess(supabase, user.id);
      if (!access) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
      agencyId = access.agency_id;
    }

    if (!agencyId) return NextResponse.json({ error: "agency_id gerekli" }, { status: 400 });

    const { data: markups } = await supabase
      .from("agency_markups")
      .select("*")
      .eq("agency_id", agencyId);

    // Return all service types with defaults
    const result: Record<string, number> = {};
    for (const type of SERVICE_TYPES) {
      const found = (markups || []).find((m) => m.service_type === type);
      result[type] = found ? Number(found.markup_rate) : 0;
    }

    return NextResponse.json({ markups: result, agency_id: agencyId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — update markups (agency user or admin)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    const body = await req.json();
    let agencyId = body.agency_id as string | undefined;
    const markups = body.markups as Record<string, number>;

    // Check if admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    const isAdmin = roleList.includes("super_admin") || roleList.includes("admin");

    // If not admin, must be agency owner
    if (!isAdmin) {
      const access = await getAgencyAccess(supabase, user.id);
      if (!access || access.role !== "owner") {
        return NextResponse.json({ error: "Yalnızca acenta sahibi fiyat belirleyebilir" }, { status: 403 });
      }
      agencyId = access.agency_id;
    }

    if (!agencyId) return NextResponse.json({ error: "agency_id gerekli" }, { status: 400 });

    // Upsert each service type
    for (const type of SERVICE_TYPES) {
      if (markups[type] !== undefined) {
        await supabase
          .from("agency_markups")
          .upsert(
            {
              agency_id: agencyId,
              service_type: type,
              markup_rate: markups[type],
              updated_at: new Date().toISOString(),
            },
            { onConflict: "agency_id,service_type" }
          );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
