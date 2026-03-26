import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — get logged-in user's agency profile + stats
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    // Find which agency this user belongs to
    const { data: agencyUser } = await supabase
      .from("agency_users")
      .select("agency_id, role, agencies(*)")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!agencyUser || !agencyUser.agencies) {
      return NextResponse.json({ error: "Acenta bulunamadı" }, { status: 403 });
    }

    const agency = agencyUser.agencies as unknown as Record<string, unknown>;
    const agencyId = agencyUser.agency_id;

    // Get markups
    const { data: markups } = await supabase
      .from("agency_markups")
      .select("service_type, markup_rate")
      .eq("agency_id", agencyId);

    const markupMap: Record<string, number> = {};
    for (const m of markups || []) {
      markupMap[m.service_type] = Number(m.markup_rate);
    }

    // Get this month's stats
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00Z`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const { data: orders } = await supabase
      .from("agency_orders")
      .select("base_price, commission_amount, total_price, agency_markup_amount, status")
      .eq("agency_id", agencyId)
      .gte("created_at", monthStart)
      .lt("created_at", nextMonth);

    const stats = {
      total_orders: (orders || []).length,
      total_sales: (orders || []).reduce((s, o) => s + Number(o.total_price), 0),
      total_earnings: (orders || []).reduce((s, o) => s + Number(o.agency_markup_amount || 0), 0),
      completed: (orders || []).filter((o) => o.status === "completed").length,
      pending: (orders || []).filter((o) => o.status === "pending").length,
    };

    return NextResponse.json({
      agency,
      role: agencyUser.role,
      markups: markupMap,
      stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
