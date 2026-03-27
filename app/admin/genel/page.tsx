"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin, hasPermission } from "@/lib/supabase/use-admin";

const SECTIONS = [
  {
    title: "Site Bilgileri",
    fields: [
      { key: "site_name", label: "Site Adı", placeholder: "X Travel" },
      { key: "site_description", label: "Site Açıklaması", placeholder: "Seyahat ve turizm platformu", multiline: true },
    ],
  },
  {
    title: "İletişim Bilgileri",
    fields: [
      { key: "contact_email", label: "E-posta", placeholder: "info@xtravel.com" },
      { key: "contact_phone", label: "Telefon", placeholder: "+90 212 000 00 00" },
      { key: "whatsapp_number", label: "WhatsApp", placeholder: "+90 500 000 00 00" },
      { key: "contact_address", label: "Adres", placeholder: "İstanbul, Türkiye", multiline: true },
    ],
  },
  {
    title: "Sosyal Medya",
    fields: [
      { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
      { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
      { key: "social_twitter", label: "X (Twitter) URL", placeholder: "https://x.com/..." },
      { key: "social_youtube", label: "YouTube URL", placeholder: "https://youtube.com/..." },
    ],
  },
  {
    title: "SEO & Meta",
    fields: [
      { key: "meta_title", label: "Meta Başlık", placeholder: "X Travel - Seyahat Platformu" },
      { key: "meta_description", label: "Meta Açıklama", placeholder: "Uçak bileti, otel, transfer ve tur...", multiline: true },
    ],
  },
  {
    title: "Firma Bilgileri",
    fields: [
      { key: "company_name", label: "Firma Adı", placeholder: "ŞİMŞEK VİA TRAVEL TURİZM" },
      { key: "tursab_no", label: "TURSAB Belge No", placeholder: "A 11452" },
      { key: "copyright_text", label: "Telif Hakkı Metni", placeholder: "© 2025 ŞİMŞEK VİA TRAVEL TURİZM - Tüm hakları saklıdır." },
    ],
  },
];

export default function AdminGenel() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { isAdmin, isLoggedIn, loading: authLoading, permissions } = useAdmin();

  useEffect(() => {
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
      const keys = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));
      const filtered: Record<string, string> = {};
      for (const key of keys) {
        if (settings[key] !== undefined) filtered[key] = settings[key];
      }
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: filtered }),
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

  if (!hasPermission(permissions, "genel")) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">Bu modüle erişim yetkiniz bulunmamaktadır.</p>
            <a href="/admin" className="text-brand-red font-semibold hover:underline">Admin Paneli</a>
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
              <h1 className="text-2xl font-bold text-gray-900">Genel Ayarlar</h1>
              <p className="text-sm text-gray-500 mt-1">Site bilgileri, iletişim ve sosyal medya</p>
            </div>
            <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {SECTIONS.map((section) => (
                <div key={section.title} className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                  <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
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
                </div>
              ))}

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
