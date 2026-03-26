"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin } from "@/lib/supabase/use-admin";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminAboneler() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { isAdmin, isLoggedIn, loading: authLoading } = useAdmin();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscribers");
      const data = await res.json();
      if (data.subscribers) setSubscribers(data.subscribers);
    } catch {}
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu aboneyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchSubscribers();
    } catch {
      alert("Silinemedi");
    }
  }

  function handleExportCSV() {
    const filtered = getFiltered();
    const csv = "E-posta,Kayıt Tarihi\n" + filtered.map((s) => `${s.email},${new Date(s.created_at).toLocaleDateString("tr-TR")}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aboneler_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getFiltered() {
    if (!search) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
  }

  if (authLoading) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">
              {!isLoggedIn ? "Bu sayfayı görüntülemek için giriş yapmalısınız." : "Bu sayfaya erişim yetkiniz bulunmamaktadır."}
            </p>
            {!isLoggedIn ? (
              <a href="/giris" className="text-brand-red font-semibold hover:underline">Giriş Yap</a>
            ) : (
              <a href="/" className="text-brand-red font-semibold hover:underline">Ana Sayfa</a>
            )}
          </div>
        </main>
      </>
    );
  }

  const filtered = getFiltered();

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E-Bülten Aboneleri</h1>
              <p className="text-sm text-gray-500 mt-1">{subscribers.length} kayıtlı abone</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
              {subscribers.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 text-sm font-semibold text-brand-red border border-brand-red/20 rounded-lg hover:bg-brand-red/5 transition"
                >
                  CSV İndir
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="E-posta ara..."
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-400">{search ? "Sonuç bulunamadı." : "Henüz abone yok."}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((sub) => (
                <div key={sub.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.email}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(sub.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
