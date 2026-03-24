"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/client";

const FIELDS = [
  { key: "hero_badge", label: "Üst Rozet", placeholder: "Yeni sezon kampanyaları başladı" },
  { key: "hero_title_1", label: "Başlık Satır 1", placeholder: "Seyahatini" },
  { key: "hero_title_2", label: "Başlık Satır 2 (Renkli)", placeholder: "Yeniden Keşfet" },
  { key: "hero_description", label: "Açıklama", placeholder: "Uçak, otel, transfer ve tur — tek platformda...", multiline: true },
  { key: "hero_stat_1_value", label: "İstatistik 1 Değer", placeholder: "500+" },
  { key: "hero_stat_1_label", label: "İstatistik 1 Etiket", placeholder: "Havayolu" },
  { key: "hero_stat_2_value", label: "İstatistik 2 Değer", placeholder: "50K+" },
  { key: "hero_stat_2_label", label: "İstatistik 2 Etiket", placeholder: "Otel" },
  { key: "hero_stat_3_value", label: "İstatistik 3 Değer", placeholder: "1M+" },
  { key: "hero_stat_3_label", label: "İstatistik 3 Etiket", placeholder: "Mutlu Yolcu" },
];

export default function AdminIcerik() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(!!data.user));

    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa İçerik</h1>
              <p className="text-sm text-gray-500 mt-1">Hero bölümündeki yazıları düzenleyin</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/admin/logolar" className="text-sm text-brand-red hover:underline">Logolar &rarr;</a>
              <a href="/admin/kampanyalar" className="text-sm text-brand-red hover:underline">Kampanyalar &rarr;</a>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="space-y-5">
                {FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                    {field.multiline ? (
                      <textarea
                        value={settings[field.key] || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition resize-none"
                      />
                    ) : (
                      <input
                        value={settings[field.key] || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-6 p-5 bg-brand-dark rounded-xl">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Önizleme</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-[10px] font-medium mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {settings.hero_badge || "Rozet"}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {settings.hero_title_1 || "Başlık 1"}
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
                    {settings.hero_title_2 || "Başlık 2"}
                  </span>
                </h2>
                <p className="text-white/50 text-xs mt-2 max-w-xs">{settings.hero_description || "Açıklama"}</p>
                <div className="flex gap-4 mt-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="text-sm font-bold text-white">{settings[`hero_stat_${i}_value`] || "—"}</div>
                      <div className="text-[10px] text-white/40">{settings[`hero_stat_${i}_label`] || "Etiket"}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-5 py-3 bg-brand-red text-white text-sm font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : saved ? (
                  "Kaydedildi!"
                ) : (
                  "Kaydet"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
