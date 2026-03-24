import { createClient } from "./server";

export async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null, isAdmin: false, supabase };

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roleList = (roles || []).map((r) => r.role);
  const isAdmin = roleList.includes("super_admin") || roleList.includes("admin");

  return {
    user,
    role: roleList[0] || "user",
    isAdmin,
    supabase,
  };
}
