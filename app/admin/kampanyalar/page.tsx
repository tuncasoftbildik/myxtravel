"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/client";

interface Promotion {
  id?: string;
  title: string;
  description: string;
  badge: string;
  discount_label: string;
  valid_until: string;
  link: string;
  bg_color: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Promotion = {
  title: "",
  description: "",
  badge: "Otel",
  discount_label: "",
  valid_until: "",
  link: "/otel",
  bg_color: "#C41E3A",
  is_active: true,
  sort_order: 0,
};

export default function AdminKampanyalar() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(!!data.user);
    });
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .order("sort_order", { ascending: true });
      setPromotions(data || []);
    } catch {
      // table may not exist yet
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editing || !editing.title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditing(null);
      fetchPromotions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;
    try {
      await fetch("/api/promotions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchPromotions();
    } catch {
      alert("Silinemedi");
    }
  }

  function updateField(field: keyof Promotion, value: string | number | boolean) {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  }

  if (!user) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
            <a href="/giris" className="text-brand-red font-semibold hover:underline">Giriş Yap</a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Kampanya Yönetimi</h1>
            <button
              onClick={() => setEditing({ ...EMPTY })}
              className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
            >
              + Yeni Kampanya
            </button>
          </div>

          {/* Edit/Create modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {editing.id ? "Kampanya Düzenle" : "Yeni Kampanya"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Başlık *</label>
                    <input
                      value={editing.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="%20 indirim!"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                    <textarea
                      value={editing.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Otellerde erken rezervasyon fırsatlarını kaçırma"
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Etiket</label>
                      <input
                        value={editing.badge}
                        onChange={(e) => updateField("badge", e.target.value)}
                        placeholder="Otel, Uçak + Otel"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">İndirim Etiketi</label>
                      <input
                        value={editing.discount_label}
                        onChange={(e) => updateField("discount_label", e.target.value)}
                        placeholder="-%20, -250₺, Hediye"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Geçerlilik Tarihi</label>
                      <input
                        type="date"
                        value={editing.valid_until}
                        onChange={(e) => updateField("valid_until", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
                      <input
                        value={editing.link}
                        onChange={(e) => updateField("link", e.target.value)}
                        placeholder="/otel"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Renk</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editing.bg_color}
                          onChange={(e) => updateField("bg_color", e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400">{editing.bg_color}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Sıralama</label>
                      <input
                        type="number"
                        value={editing.sort_order}
                        onChange={(e) => updateField("sort_order", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editing.is_active}
                          onChange={(e) => updateField("is_active", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-sm text-gray-700">Aktif</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-5 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Önizleme</p>
                  <div className="flex items-center gap-2 mb-2">
                    {editing.badge.split("+").map((b, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: editing.bg_color, borderColor: editing.bg_color + "40" }}>
                        {b.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-lg font-black" style={{ color: editing.bg_color }}>{editing.title || "Başlık"}</p>
                  <p className="text-xs text-gray-500">{editing.description || "Açıklama"}</p>
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
                    disabled={saving || !editing.title}
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
                <div key={i} className="h-20 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : promotions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-400 mb-2">Henüz kampanya eklenmemiş.</p>
              <p className="text-xs text-gray-300">
                Supabase dashboard&apos;dan <code>supabase/migrations/001_promotions.sql</code> dosyasını çalıştırdığınızdan emin olun.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.map((promo) => (
                <div key={promo.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                  <div
                    className="w-2 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: promo.bg_color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{promo.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium" style={{ color: promo.bg_color, borderColor: promo.bg_color + "40" }}>
                        {promo.badge}
                      </span>
                      {!promo.is_active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Pasif</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{promo.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditing({ ...promo })}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => promo.id && handleDelete(promo.id)}
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
