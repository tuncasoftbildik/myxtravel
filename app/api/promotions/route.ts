import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — public, fetch active promotions
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ promotions: data || [] });
  } catch {
    return NextResponse.json({ promotions: [] });
  }
}

// POST — create or update promotion (admin)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...fields } = body;
    fields.updated_at = new Date().toISOString();

    if (id) {
      // Update
      const { data, error } = await supabase
        .from("promotions")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ promotion: data });
    } else {
      // Insert
      const { data, error } = await supabase
        .from("promotions")
        .insert(fields)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ promotion: data });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove promotion (admin)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const { id } = await req.json();
    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
