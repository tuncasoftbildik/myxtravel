"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

interface AdminState {
  loading: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  role: string | null;
  permissions: string[];
}

export function useAdmin() {
  const [state, setState] = useState<AdminState>({
    loading: true,
    isAdmin: false,
    isLoggedIn: false,
    role: null,
    permissions: [],
  });

  useEffect(() => {
    const supabase = createClient();

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ loading: false, isAdmin: false, isLoggedIn: false, role: null, permissions: [] });
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roleList = (roles || []).map((r) => r.role);
      const isAdmin = roleList.includes("super_admin") || roleList.includes("admin");
      const isSuperAdmin = roleList.includes("super_admin");

      // super_admin has all permissions, regular admins have specific ones
      let permissions: string[] = [];
      if (isSuperAdmin) {
        permissions = ["*"];
      } else if (isAdmin) {
        const { data: perms } = await supabase
          .from("admin_permissions")
          .select("permission")
          .eq("user_id", user.id);
        permissions = (perms || []).map((p) => p.permission);
      }

      setState({
        loading: false,
        isAdmin,
        isLoggedIn: true,
        role: roleList[0] || "user",
        permissions,
      });
    }

    check();
  }, []);

  return state;
}

/** Check if user has permission for a specific module */
export function hasPermission(permissions: string[], module: string): boolean {
  return permissions.includes("*") || permissions.includes(module);
}
