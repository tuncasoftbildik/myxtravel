"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  commission_rate: number;
  contact_email: string;
  contact_phone: string;
  tursab_no: string;
  markups: Record<string, number>; // per service type: { flight: 5, hotel: 8, ... }
}

type ServiceType = "flight" | "hotel" | "bus" | "car" | "transfer" | "tour";

interface AgencyContextType {
  agency: Agency | null;
  isAgency: boolean;
  loading: boolean;
  /**
   * Two-tier price calculation:
   * 1. agencyCost = basePrice * (1 + platform_commission%)  — what agency pays us
   * 2. salePrice  = agencyCost * (1 + agency_markup%)        — what customer pays
   *
   * This returns the final customer-facing price.
   */
  withCommission: (basePrice: number, serviceType?: ServiceType) => number;
  /** Returns what the agency pays us (API + platform commission only) */
  agencyCost: (basePrice: number) => number;
}

const AgencyContext = createContext<AgencyContextType>({
  agency: null,
  isAgency: false,
  loading: true,
  withCommission: (p) => p,
  agencyCost: (p) => p,
});

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agency/current")
      .then((r) => r.json())
      .then((data) => {
        if (data.agency) setAgency(data.agency);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /** Agency cost = API price + platform commission */
  function agencyCostCalc(basePrice: number): number {
    if (!agency) return basePrice;
    return Math.round(basePrice * (1 + agency.commission_rate / 100));
  }

  /** Customer price = agency cost + agency markup per service type */
  function withCommission(basePrice: number, serviceType?: ServiceType): number {
    if (!agency) return basePrice;
    const cost = agencyCostCalc(basePrice);
    const markupRate = (serviceType && agency.markups?.[serviceType]) || 0;
    if (markupRate <= 0) return cost;
    return Math.round(cost * (1 + markupRate / 100));
  }

  return (
    <AgencyContext.Provider value={{ agency, isAgency: !!agency, loading, withCommission, agencyCost: agencyCostCalc }}>
      {/* Inject agency CSS variables for dynamic theming */}
      {agency && (
        <style>{`
          :root {
            --color-brand-red: ${agency.primary_color};
            --color-brand-dark: ${agency.secondary_color};
          }
        `}</style>
      )}
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgency() {
  return useContext(AgencyContext);
}
