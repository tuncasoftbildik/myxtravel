import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VERCEL_API = "https://api.vercel.com";
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// POST — add domain to Vercel project
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

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json({ error: "Vercel API ayarlari eksik (VERCEL_API_TOKEN ve VERCEL_PROJECT_ID)" }, { status: 500 });
    }

    const { domain } = await req.json();
    if (!domain) return NextResponse.json({ error: "Domain gerekli" }, { status: 400 });

    // Add domain to Vercel project
    const res = await fetch(`${VERCEL_API}/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Domain already exists is not an error for us
      if (data.error?.code === "domain_already_in_use" || data.error?.code === "DOMAIN_ALREADY_IN_USE") {
        return NextResponse.json({ success: true, status: "already_added", message: "Domain zaten Vercel'e ekli" });
      }
      return NextResponse.json({
        error: data.error?.message || "Vercel'e domain eklenemedi",
        vercel_error: data.error,
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, status: "added", vercel: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove domain from Vercel project
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

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json({ error: "Vercel API ayarlari eksik" }, { status: 500 });
    }

    const { domain } = await req.json();
    if (!domain) return NextResponse.json({ error: "Domain gerekli" }, { status: 400 });

    const res = await fetch(`${VERCEL_API}/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });

    if (!res.ok && res.status !== 404) {
      const data = await res.json();
      return NextResponse.json({ error: data.error?.message || "Silinemedi" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — check domain status on Vercel
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

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json({ configured: false, error: "Vercel API ayarlari eksik" });
    }

    const domain = new URL(req.url).searchParams.get("domain");
    if (!domain) return NextResponse.json({ error: "Domain gerekli" }, { status: 400 });

    // Check domain config on Vercel
    const res = await fetch(`${VERCEL_API}/v6/domains/${domain}/config`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });

    const data = await res.json();
    return NextResponse.json({ configured: true, domain_config: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bir hata olustu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
