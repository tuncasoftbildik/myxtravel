"use client";

import { useEffect, useState } from "react";
import { createClient } from "./client";

interface AgencyUser {
  agencyId: string;
  agencyName: string;
  agencySlug: string;
  role: string;
}

export function useAgencyAuth() {
  const [state, setState] = useState<{
    loading: boolean;
    isLoggedIn: boolean;
    isAgencyUser: boolean;
    agencyUser: AgencyUser | null;
  }>({ loading: true, isLoggedIn: false, isAgencyUser: false, agencyUser: null });

  useEffect(() => {
    const supabase = createClient();

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ loading: false, isLoggedIn: false, isAgencyUser: false, agencyUser: null });
        return;
      }

      const { data } = await supabase
        .from("agency_users")
        .select("role, agency_id, agencies(id, name, slug)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!data || !data.agencies) {
        setState({ loading: false, isLoggedIn: true, isAgencyUser: false, agencyUser: null });
        return;
      }

      const ag = data.agencies as unknown as { id: string; name: string; slug: string };
      setState({
        loading: false,
        isLoggedIn: true,
        isAgencyUser: true,
        agencyUser: {
          agencyId: ag.id,
          agencyName: ag.name,
          agencySlug: ag.slug,
          role: data.role,
        },
      });
    }

    check();
  }, []);

  return state;
}
