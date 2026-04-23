"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/header";
import { AgencyProductForm } from "@/components/agency-product-form";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { AgencyProduct } from "@/lib/agency-products/types";

export default function UrunDuzenlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isAgencyUser, isLoggedIn, loading: authLoading } = useAgencyAuth();
  const [product, setProduct] = useState<AgencyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAgencyUser || !params.id) return;
    fetch(`/api/agency/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.product || null))
      .finally(() => setLoading(false));
  }, [isAgencyUser, params.id]);

  if (authLoading || loading) return null;
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
  if (!product) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <p className="text-gray-600">Ürün bulunamadı.</p>
        </main>
      </>
    );
  }

  async function submit(payload: Record<string, unknown>) {
    const { service_type: _unused, ...rest } = payload;
    void _unused;
    const res = await fetch(`/api/agency/products/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
    router.push("/acenta/panel/urunlerim");
  }

  async function handleDelete() {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/agency/products/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/acenta/panel/urunlerim");
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
            <button onClick={handleDelete} className="text-red-600 hover:underline">Sil</button>
          </div>
          <AgencyProductForm
            serviceType={product.service_type as "transfer" | "tour"}
            initial={{
              title: product.title,
              short_description: product.short_description,
              description: product.description,
              photos: product.photos,
              cover_photo: product.cover_photo,
              price: product.price as unknown as string,
              currency: product.currency as "TRY" | "USD" | "EUR",
              price_note: product.price_note,
              is_active: product.is_active,
              details: product.details,
            }}
            onSubmit={submit}
            submitLabel="Değişiklikleri Kaydet"
          />
        </div>
      </main>
    </>
  );
}
