import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — resolve current agency from domain header (set by middleware)
export async function GET(req: NextRequest) {
  try {
    const domain = req.headers.get("x-agency-domain") || "";

    if (!domain) {
      // Main site, no agency
      return NextResponse.json({ agency: null });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("agencies")
      .select("id, name, slug, domain, logo_url, favicon_url, primary_color, secondary_color, commission_rate, contact_email, contact_phone, tursab_no")
      .eq("domain", domain)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ agency: null });
    }

    // Also fetch agency markups per service type
    const { data: markups } = await supabase
      .from("agency_markups")
      .select("service_type, markup_rate")
      .eq("agency_id", data.id);

    const markupMap: Record<string, number> = {};
    for (const m of markups || []) {
      markupMap[m.service_type] = Number(m.markup_rate);
    }

    return NextResponse.json({ agency: { ...data, markups: markupMap } });
  } catch {
    return NextResponse.json({ agency: null });
  }
}
