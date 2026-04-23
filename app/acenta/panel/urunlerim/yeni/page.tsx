"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { AgencyProductForm } from "@/components/agency-product-form";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { ServiceType } from "@/lib/agency-products/types";

function YeniUrunInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const typeParam = sp.get("type");
  const serviceType: ServiceType = typeParam === "tour" ? "tour" : "transfer";

  const { isAgencyUser, isLoggedIn, loading } = useAgencyAuth();

  if (loading) return null;
  if (!isLoggedIn || !isAgencyUser) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </main>
      </>
    );
  }

  async function submit(payload: Record<string, unknown>) {
    const res = await fetch("/api/agency/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
    router.push("/acenta/panel/urunlerim");
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">
            Yeni {serviceType === "transfer" ? "Transfer" : "Tur"} Ekle
          </h1>
          <AgencyProductForm
            serviceType={serviceType}
            onSubmit={submit}
            submitLabel="Kaydet ve Yayına Al"
          />
        </div>
      </main>
    </>
  );
}

export default function YeniUrunPage() {
  return (
    <Suspense fallback={null}>
      <YeniUrunInner />
    </Suspense>
  );
}
