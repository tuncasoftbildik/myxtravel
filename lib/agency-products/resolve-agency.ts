import { createClient } from "@/lib/supabase/server";

export async function resolveAgencyFromHeaders(headers: Headers) {
  const domain = headers.get("x-agency-domain");
  if (!domain) return { error: "no_domain" as const };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agencies")
    .select("id, slug, name, contact_email, contact_phone, primary_color, secondary_color")
    .eq("domain", domain)
    .eq("is_active", true)
    .single();

  if (error || !data) return { error: "not_found" as const };
  return { supabase, agency: data };
}
