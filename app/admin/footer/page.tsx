"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin } from "@/lib/supabase/use-admin";

interface FooterLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS = {
  services: [
    { label: "Uçak Bileti", href: "/ucus" },
    { label: "Otel Rezervasyonu", href: "/otel" },
    { label: "Transfer", href: "/transfer" },
    { label: "Tur Paketleri", href: "/tur" },
  ],
  corporate: [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Kariyer", href: "/kariyer" },
    { label: "Blog", href: "/blog" },
    { label: "İletişim", href: "/iletisim" },
  ],
  legal: [
    { label: "Gizlilik Politikası", href: "/gizlilik" },
    { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
    { label: "KVKK", href: "/kvkk" },
    { label: "Çerez Politikası", href: "/cerez" },
  ],
};

export default function AdminFooter() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [servicesLinks, setServicesLinks] = useState<FooterLink[]>(DEFAULT_LINKS.services);
  const [corporateLinks, setCorporateLinks] = useState<FooterLink[]>(DEFAULT_LINKS.corporate);
  const [legalLinks, setLegalLinks] = useState<FooterLink[]>(DEFAULT_LINKS.legal);
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
          if (data.settings.footer_links_services) {
            try { setServicesLinks(JSON.parse(data.settings.footer_links_services)); } catch {}
          }
          if (data.settings.footer_links_corporate) {
            try { setCorporateLinks(JSON.parse(data.settings.footer_links_corporate)); } catch {}
          }
          if (data.settings.footer_links_legal) {
            try { setLegalLinks(JSON.parse(data.settings.footer_links_legal)); } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateLink(list: FooterLink[], setList: (v: FooterLink[]) => void, idx: number, field: "label" | "href", value: string) {
    const copy = [...list];
    copy[idx] = { ...copy[idx], [field]: value };
    setList(copy);
  }

  function addLink(list: FooterLink[], setList: (v: FooterLink[]) => void) {
    setList([...list, { label: "", href: "/" }]);
  }

  function removeLink(list: FooterLink[], setList: (v: FooterLink[]) => void, idx: number) {
    setList(list.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, string> = {
        ...Object.fromEntries(
          ["footer_about_text", "footer_copyright", "footer_tursab", "footer_ssl_text"].map((k) => [k, settings[k] || ""])
        ),
        footer_links_services: JSON.stringify(servicesLinks),
        footer_links_corporate: JSON.stringify(corporateLinks),
        footer_links_legal: JSON.stringify(legalLinks),
      };
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

  function renderLinkEditor(title: string, list: FooterLink[], setList: (v: FooterLink[]) => void) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            {title}
          </h2>
          <button
            onClick={() => addLink(list, setList)}
            className="text-xs font-semibold text-brand-red hover:underline"
          >
            + Link Ekle
          </button>
        </div>
        <div className="space-y-3">
          {list.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={link.label}
                onChange={(e) => updateLink(list, setList, idx, "label", e.target.value)}
                placeholder="Etiket"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
              />
              <input
                value={link.href}
                onChange={(e) => updateLink(list, setList, idx, "href", e.target.value)}
                placeholder="/sayfa-adi"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
              />
              <button
                onClick={() => removeLink(list, setList, idx)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
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
              <h1 className="text-2xl font-bold text-gray-900">Footer Ayarları</h1>
              <p className="text-sm text-gray-500 mt-1">Alt bilgi metinleri ve linkleri</p>
            </div>
            <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Text fields */}
              <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                  Metinler
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Hakkında Metni</label>
                    <textarea
                      value={settings.footer_about_text || ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, footer_about_text: e.target.value }))}
                      placeholder="Uçak bileti, otel, transfer ve tur hizmetleri..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Telif Hakkı</label>
                    <input
                      value={settings.footer_copyright || ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, footer_copyright: e.target.value }))}
                      placeholder="© 2025 ŞİMŞEK VİA TRAVEL TURİZM - Tüm hakları saklıdır."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">TURSAB Bilgisi</label>
                    <input
                      value={settings.footer_tursab || ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, footer_tursab: e.target.value }))}
                      placeholder="TURSAB Belge No: A 11452"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">SSL Güvenlik Metni</label>
                    <input
                      value={settings.footer_ssl_text || ""}
                      onChange={(e) => setSettings((prev) => ({ ...prev, footer_ssl_text: e.target.value }))}
                      placeholder="Güvenli Ödeme / Secure Payment"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Link editors */}
              {renderLinkEditor("Hizmetler Linkleri", servicesLinks, setServicesLinks)}
              {renderLinkEditor("Kurumsal Linkler", corporateLinks, setCorporateLinks)}
              {renderLinkEditor("Yasal Linkler", legalLinks, setLegalLinks)}

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
