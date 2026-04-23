import { createClient } from "@/lib/supabase/server";

export async function getAgencyContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "unauthorized" as const };

  const { data: agencyUser } = await supabase
    .from("agency_users")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!agencyUser) return { supabase, error: "not_agency_user" as const };

  return { supabase, agencyId: agencyUser.agency_id as string, userId: user.id };
}
