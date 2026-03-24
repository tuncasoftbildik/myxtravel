"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "@/lib/supabase/use-admin";

interface AirlineLogo {
  id?: string;
  name: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: AirlineLogo = {
  name: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

export default function AdminLogolar() {
  const [logos, setLogos] = useState<AirlineLogo[]>([]);
  const [editing, setEditing] = useState<AirlineLogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAdmin, isLoggedIn, loading: authLoading } = useAdmin();

  useEffect(() => {
    fetchLogos();
  }, []);

  async function fetchLogos() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("airline_logos")
        .select("*")
        .order("sort_order", { ascending: true });
      setLogos(data || []);
    } catch {
      // table may not exist yet
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editing || !editing.name || !editing.image_url) return;
    setSaving(true);
    try {
      const res = await fetch("/api/airlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditing(null);
      fetchLogos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu logoyu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch("/api/airlines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchLogos();
    } catch {
      alert("Silinemedi");
    }
  }

  async function handleToggle(logo: AirlineLogo) {
    try {
      await fetch("/api/airlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: logo.id, is_active: !logo.is_active }),
      });
      fetchLogos();
    } catch {
      alert("Güncellenemedi");
    }
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

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Logo Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-1">Ana sayfadaki dönen havayolu logolarını yönetin</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/admin/icerik" className="text-sm text-brand-red hover:underline">&larr; İçerik</a>
              <button
                onClick={() => setEditing({ ...EMPTY, sort_order: logos.length })}
                className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
              >
                + Yeni Logo
              </button>
            </div>
          </div>

          {/* Edit/Create modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {editing.id ? "Logo Düzenle" : "Yeni Logo Ekle"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">İsim *</label>
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      placeholder="Turkish Airlines"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Görsel URL *</label>
                    <input
                      value={editing.image_url}
                      onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                      placeholder="/airlines/thy.png veya https://..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">public/ klasörüne yüklenen dosya için /airlines/dosya.png yazın</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sıralama</label>
                      <input
                        type="number"
                        value={editing.sort_order}
                        onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editing.is_active}
                          onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-sm text-gray-700">Aktif</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview */}
                  {editing.image_url && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Önizleme</p>
                      <div className="flex items-center justify-center h-12">
                        <Image
                          src={editing.image_url}
                          alt={editing.name || "Logo"}
                          width={150}
                          height={40}
                          className="h-8 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditing(null)}
                    className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editing.name || !editing.image_url}
                    className="flex-1 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : logos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-400 mb-2">Henüz logo eklenmemiş.</p>
              <p className="text-xs text-gray-300">
                Supabase dashboard&apos;dan <code>supabase/migrations/003_airline_logos.sql</code> dosyasını çalıştırın.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logos.map((logo) => (
                <div key={logo.id} className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 ${!logo.is_active ? "opacity-50" : ""}`}>
                  <div className="w-24 h-10 flex items-center justify-center shrink-0">
                    <Image
                      src={logo.image_url}
                      alt={logo.name}
                      width={150}
                      height={40}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{logo.name}</h3>
                    <p className="text-[11px] text-gray-400 truncate">{logo.image_url}</p>
                  </div>
                  <span className="text-xs text-gray-300 shrink-0">#{logo.sort_order}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(logo)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                        logo.is_active
                          ? "text-green-600 border-green-200 hover:bg-green-50"
                          : "text-gray-400 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {logo.is_active ? "Aktif" : "Pasif"}
                    </button>
                    <button
                      onClick={() => setEditing({ ...logo })}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => logo.id && handleDelete(logo.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
