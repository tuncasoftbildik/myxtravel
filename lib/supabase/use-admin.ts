"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

export function useAdmin() {
  const [state, setState] = useState<{
    loading: boolean;
    isAdmin: boolean;
    isLoggedIn: boolean;
    role: string | null;
  }>({ loading: true, isAdmin: false, isLoggedIn: false, role: null });

  useEffect(() => {
    const supabase = createClient();

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ loading: false, isAdmin: false, isLoggedIn: false, role: null });
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roleList = (roles || []).map((r) => r.role);
      const isAdmin = roleList.includes("super_admin") || roleList.includes("admin");

      setState({
        loading: false,
        isAdmin,
        isLoggedIn: true,
        role: roleList[0] || "user",
      });
    }

    check();
  }, []);

  return state;
}
