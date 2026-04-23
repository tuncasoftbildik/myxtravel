"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAgencyAuth } from "@/lib/supabase/use-agency-auth";
import type { AgencyProduct } from "@/lib/agency-products/types";

export default function UrunlerimPage() {
  const { isAgencyUser, isLoggedIn, loading: authLoading } = useAgencyAuth();
  const [products, setProducts] = useState<AgencyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    if (!isAgencyUser) return;
    fetch("/api/agency/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [isAgencyUser]);

  async function toggleActive(id: string, is_active: boolean) {
    const res = await fetch(`/api/agency/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !is_active }),
    });
    if (res.ok) {
      setProducts((xs) => xs.map((p) => (p.id === id ? { ...p, is_active: !is_active } : p)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/agency/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((xs) => xs.filter((p) => p.id !== id));
  }

  if (authLoading) return <LoadingShell />;
  if (!isLoggedIn || !isAgencyUser) return <UnauthorizedShell />;

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Ürünlerim</h1>
            <button
              onClick={() => setShowTypeModal(true)}
              className="bg-brand-red text-white rounded-lg px-4 py-2 font-medium hover:opacity-90"
            >
              + Yeni Ürün Ekle
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-gray-500">Henüz ürününüz yok. Hemen oluşturun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-video bg-gray-100">
                    {p.cover_photo || p.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover_photo || p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">Foto yok</div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs uppercase font-semibold text-gray-500">{p.service_type}</span>
                    <h3 className="font-semibold text-gray-900 mt-1">{p.title}</h3>
                    <p className="text-brand-red font-bold mt-2">
                      {p.price.toLocaleString("tr-TR")} {p.currency}{" "}
                      <span className="text-xs text-gray-500 font-normal">{p.price_note}</span>
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={p.is_active}
                          onChange={() => toggleActive(p.id, p.is_active)}
                        />
                        {p.is_active ? "Aktif" : "Pasif"}
                      </label>
                      <div className="flex gap-3 text-sm">
                        <Link href={`/acenta/panel/urunlerim/${p.id}`} className="text-blue-600">Düzenle</Link>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600">Sil</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTypeModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Servis tipi seçin</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/acenta/panel/urunlerim/yeni?type=transfer" className="border rounded-xl p-4 text-center hover:bg-gray-50">
                <div className="text-2xl mb-1">🚐</div>
                <div className="font-medium">Transfer</div>
              </Link>
              <Link href="/acenta/panel/urunlerim/yeni?type=tour" className="border rounded-xl p-4 text-center hover:bg-gray-50">
                <div className="text-2xl mb-1">🗺️</div>
                <div className="font-medium">Tur</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LoadingShell() {
  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
      </main>
    </>
  );
}

function UnauthorizedShell() {
  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
      </main>
    </>
  );
}
