import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const isAdmin = roleList.includes("super_admin") || roleList.includes("admin");

    let isAgencyUser = false;
    if (!isAdmin) {
      const { data: agencyUser } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      isAgencyUser = !!agencyUser;
    }

    if (!isAdmin && !isAgencyUser) {
      return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) || (isAdmin ? "blog" : "agency-products");
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadi" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Sadece JPG, PNG, WebP ve GIF desteklenir" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya boyutu en fazla 5MB olabilir" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]+/g, "").slice(0, 40) || "blog";
    const fileName = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yuklenemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
