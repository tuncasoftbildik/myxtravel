"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin } from "@/lib/supabase/use-admin";

type Tab = "hero" | "features" | "newsletter";

const HERO_FIELDS = [
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

interface FeatureItem {
  title: string;
  desc: string;
  color: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  { title: "Anlık Fiyat Karşılaştırma", desc: "Yüzlerce havayolu ve otelden gerçek zamanlı fiyat karşılaştırması yapın.", color: "red" },
  { title: "256-bit SSL Güvenlik", desc: "Tüm ödeme işlemleriniz bankacılık seviyesinde şifreleme ile korunur.", color: "blue" },
  { title: "7/24 Canlı Destek", desc: "Seyahat öncesi ve sonrası uzman ekibimiz her zaman yanınızda.", color: "emerald" },
  { title: "Ücretsiz İptal", desc: "Çoğu rezervasyonda son 24 saate kadar ücretsiz iptal imkanı.", color: "amber" },
];

const COLOR_OPTIONS = [
  { value: "red", label: "Kırmızı", bg: "bg-red-50", text: "text-brand-red" },
  { value: "blue", label: "Mavi", bg: "bg-blue-50", text: "text-blue-600" },
  { value: "emerald", label: "Yeşil", bg: "bg-emerald-50", text: "text-emerald-600" },
  { value: "amber", label: "Sarı", bg: "bg-amber-50", text: "text-amber-600" },
  { value: "purple", label: "Mor", bg: "bg-purple-50", text: "text-purple-600" },
  { value: "pink", label: "Pembe", bg: "bg-pink-50", text: "text-pink-600" },
];

export default function AdminIcerik() {
  const [tab, setTab] = useState<Tab>("hero");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [features, setFeatures] = useState<FeatureItem[]>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { isAdmin, isLoggedIn, loading: authLoading } = useAdmin();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
          if (data.settings.features_json) {
            try { setFeatures(JSON.parse(data.settings.features_json)); } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, string> = {};
      // Hero fields
      for (const f of HERO_FIELDS) {
        if (settings[f.key] !== undefined) payload[f.key] = settings[f.key];
      }
      // Features
      payload.features_json = JSON.stringify(features);
      // Newsletter
      payload.newsletter_title = settings.newsletter_title || "";
      payload.newsletter_desc = settings.newsletter_desc || "";
      payload.newsletter_button = settings.newsletter_button || "";
      // Features section title
      payload.features_section_badge = settings.features_section_badge || "";
      payload.features_section_title = settings.features_section_title || "";

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa İçerik</h1>
              <p className="text-sm text-gray-500 mt-1">Hero, özellikler ve bülten alanını düzenleyin</p>
            </div>
            <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
            {[
              { key: "hero" as Tab, label: "Hero" },
              { key: "features" as Tab, label: "Özellikler" },
              { key: "newsletter" as Tab, label: "E-Bülten" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${tab === t.key ? "bg-brand-red text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {tab === "hero" && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="space-y-5">
                      {HERO_FIELDS.map((field) => (
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
                  </div>
                </>
              )}

              {tab === "features" && (
                <>
                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                      Bölüm Başlığı
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Üst Etiket</label>
                        <input
                          value={settings.features_section_badge || ""}
                          onChange={(e) => setSettings((prev) => ({ ...prev, features_section_badge: e.target.value }))}
                          placeholder="Avantajlar"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Başlık</label>
                        <input
                          value={settings.features_section_title || ""}
                          onChange={(e) => setSettings((prev) => ({ ...prev, features_section_title: e.target.value }))}
                          placeholder="Neden X?"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        Özellik Kartları
                      </h2>
                      <button
                        onClick={() => setFeatures([...features, { title: "", desc: "", color: "red" }])}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        + Kart Ekle
                      </button>
                    </div>
                    <div className="space-y-4">
                      {features.map((feat, idx) => (
                        <div key={idx} className="p-4 border border-gray-100 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400">Kart {idx + 1}</span>
                            <button
                              onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              Sil
                            </button>
                          </div>
                          <input
                            value={feat.title}
                            onChange={(e) => { const c = [...features]; c[idx] = { ...c[idx], title: e.target.value }; setFeatures(c); }}
                            placeholder="Başlık"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <textarea
                            value={feat.desc}
                            onChange={(e) => { const c = [...features]; c[idx] = { ...c[idx], desc: e.target.value }; setFeatures(c); }}
                            placeholder="Açıklama"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none resize-none"
                          />
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Renk</label>
                            <div className="flex gap-2">
                              {COLOR_OPTIONS.map((c) => (
                                <button
                                  key={c.value}
                                  onClick={() => { const copy = [...features]; copy[idx] = { ...copy[idx], color: c.value }; setFeatures(copy); }}
                                  className={`px-3 py-1.5 text-xs rounded-lg border transition ${feat.color === c.value ? "border-brand-red bg-brand-red/5 text-brand-red font-semibold" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                                >
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === "newsletter" && (
                <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    E-Bülten CTA Alanı
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Başlık</label>
                      <input
                        value={settings.newsletter_title || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, newsletter_title: e.target.value }))}
                        placeholder="Fırsatları İlk Sen Yakala"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Açıklama</label>
                      <textarea
                        value={settings.newsletter_desc || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, newsletter_desc: e.target.value }))}
                        placeholder="E-bültenimize abone olun, özel indirimlerden anında haberdar olun."
                        rows={3}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Buton Metni</label>
                      <input
                        value={settings.newsletter_button || ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, newsletter_button: e.target.value }))}
                        placeholder="Abone Ol"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 p-5 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b69] to-[#0f172a] rounded-xl text-center">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Önizleme</p>
                    <h3 className="text-lg font-bold text-white mb-2">{settings.newsletter_title || "Fırsatları İlk Sen Yakala"}</h3>
                    <p className="text-white/50 text-xs mb-4">{settings.newsletter_desc || "E-bültenimize abone olun..."}</p>
                    <div className="inline-block px-6 py-2 bg-brand-red text-white text-sm font-semibold rounded-xl">
                      {settings.newsletter_button || "Abone Ol"}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-brand-red text-white text-sm font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : saved ? (
                  "Kaydedildi!"
                ) : (
                  "Tümünü Kaydet"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
