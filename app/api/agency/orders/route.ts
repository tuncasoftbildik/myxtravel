import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — list orders (admin sees all, agency user sees own agency only)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });

    // Check admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const roleList = (roles || []).map((r) => r.role);
    const isAdmin = roleList.includes("super_admin") || roleList.includes("admin");

    // Check agency user
    let forcedAgencyId: string | null = null;
    if (!isAdmin) {
      const { data: agencyUser } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      if (!agencyUser) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
      forcedAgencyId = agencyUser.agency_id;
    }

    const { searchParams } = new URL(req.url);
    const agencyId = forcedAgencyId || searchParams.get("agency_id");
    const agencyIds = searchParams.get("agency_ids"); // comma-separated for compare mode
    const month = searchParams.get("month"); // YYYY-MM format
    const dateFrom = searchParams.get("date_from"); // YYYY-MM-DD
    const dateTo = searchParams.get("date_to"); // YYYY-MM-DD
    const status = searchParams.get("status");

    let query = supabase
      .from("agency_orders")
      .select("*, agencies(name, slug)")
      .order("created_at", { ascending: false });

    if (forcedAgencyId) {
      query = query.eq("agency_id", forcedAgencyId);
    } else if (agencyIds) {
      const ids = agencyIds.split(",").filter(Boolean);
      if (ids.length > 0) query = query.in("agency_id", ids);
    } else if (agencyId) {
      query = query.eq("agency_id", agencyId);
    }

    if (status) query = query.eq("status", status);

    if (dateFrom || dateTo) {
      if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
      if (dateTo) query = query.lt("created_at", `${dateTo}T23:59:59Z`);
    } else if (month) {
      const start = `${month}-01T00:00:00Z`;
      const [y, m] = month.split("-").map(Number);
      const end = new Date(y, m, 1).toISOString(); // first day of next month
      query = query.gte("created_at", start).lt("created_at", end);
    }

    const { data, error } = await query.limit(500);
    if (error) throw error;

    // Calculate summary
    const orders = data || [];
    const summary = {
      total_orders: orders.length,
      total_base: orders.reduce((s, o) => s + Number(o.base_price), 0),
      total_commission: orders.reduce((s, o) => s + Number(o.commission_amount), 0),
      total_revenue: orders.reduce((s, o) => s + Number(o.total_price), 0),
      total_platform_commission: orders.reduce((s, o) => s + Number(o.platform_commission_amount || 0), 0),
      total_agency_markup: orders.reduce((s, o) => s + Number(o.agency_markup_amount || 0), 0),
      by_status: {} as Record<string, number>,
      by_type: {} as Record<string, number>,
    };
    for (const o of orders) {
      summary.by_status[o.status] = (summary.by_status[o.status] || 0) + 1;
      summary.by_type[o.order_type] = (summary.by_type[o.order_type] || 0) + 1;
    }

    return NextResponse.json({ orders, summary, isAdmin });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — create or update order (admin or system)
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

    // Auto-calc two-tier commission
    // platform_commission = base_price * platform_rate%  (our cut)
    // agency_cost = base_price + platform_commission
    // agency_markup = agency_cost * agency_markup_rate%  (agency's profit)
    // total_price = agency_cost + agency_markup  (customer pays)
    if (fields.base_price != null) {
      const base = Number(fields.base_price);
      const platformRate = Number(fields.platform_commission_rate || fields.commission_rate || 0);
      const agencyMarkupRate = Number(fields.agency_markup_rate || 0);

      const platformAmount = Number((base * platformRate / 100).toFixed(2));
      const agencyCost = base + platformAmount;
      const agencyMarkupAmount = Number((agencyCost * agencyMarkupRate / 100).toFixed(2));
      const totalPrice = Number((agencyCost + agencyMarkupAmount).toFixed(2));

      fields.platform_commission_rate = platformRate;
      fields.platform_commission_amount = platformAmount;
      fields.agency_markup_rate = agencyMarkupRate;
      fields.agency_markup_amount = agencyMarkupAmount;
      fields.commission_rate = platformRate; // backward compat
      fields.commission_amount = platformAmount; // backward compat
      fields.total_price = totalPrice;
    }

    if (id) {
      const { data, error } = await supabase
        .from("agency_orders")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ order: data });
    } else {
      const { data, error } = await supabase
        .from("agency_orders")
        .insert(fields)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ order: data });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
