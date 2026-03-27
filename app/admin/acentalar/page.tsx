"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin, hasPermission } from "@/lib/supabase/use-admin";

interface Agency {
  id?: string;
  name: string;
  slug: string;
  domain: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  commission_rate: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  tax_number: string;
  tursab_no: string;
  is_active: boolean;
  created_at?: string;
}

const EMPTY: Agency = {
  name: "",
  slug: "",
  domain: "",
  logo_url: "",
  favicon_url: "",
  primary_color: "#C41E3A",
  secondary_color: "#1a0a2e",
  commission_rate: 10,
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  tax_number: "",
  tursab_no: "",
  is_active: true,
};

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminAcentalar() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [editing, setEditing] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"info" | "branding" | "commission" | "users">("info");
  const [agencyUsers, setAgencyUsers] = useState<{ id: string; user_id: string; role: string; created_at: string }[]>([]);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] = useState("owner");
  const [assigning, setAssigning] = useState(false);
  const [domainStatus, setDomainStatus] = useState<string | null>(null);
  const [domainError, setDomainError] = useState("");
  const [userMode, setUserMode] = useState<"assign" | "create">("create");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("owner");
  const [creating, setCreating] = useState(false);
  const { isAdmin, isLoggedIn, loading: authLoading, permissions } = useAdmin();

  useEffect(() => {
    fetchAgencies();
  }, []);

  async function fetchAgencies() {
    setLoading(true);
    try {
      const res = await fetch("/api/agencies?all=true");
      const data = await res.json();
      if (data.agencies) setAgencies(data.agencies);
    } catch {}
    setLoading(false);
  }

  async function addDomainToVercel(domain: string) {
    try {
      const res = await fetch("/api/agency/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data.success) {
        setDomainStatus(data.status === "already_added" ? "already" : "added");
      } else {
        setDomainStatus("error");
        setDomainError(data.error || "Vercel'e domain eklenemedi");
      }
    } catch {
      setDomainStatus("error");
      setDomainError("Vercel API baglantisi kurulamadi");
    }
  }

  async function handleSave() {
    if (!editing || !editing.name) return;
    setSaving(true);
    setDomainStatus(null);
    setDomainError("");
    try {
      const payload = { ...editing };
      if (!payload.slug) payload.slug = generateSlug(payload.name);
      const res = await fetch("/api/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Auto-add domain to Vercel if domain is set
      if (payload.domain) {
        await addDomainToVercel(payload.domain);
      }

      setEditing(null);
      setTab("info");
      fetchAgencies();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata olustu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(agency: Agency) {
    if (!confirm("Bu acentayi ve tum satis verilerini silmek istediginize emin misiniz?")) return;
    try {
      // Remove domain from Vercel if exists
      if (agency.domain) {
        await fetch("/api/agency/domain", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: agency.domain }),
        }).catch(() => {});
      }
      await fetch("/api/agencies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agency.id }),
      });
      fetchAgencies();
    } catch {
      alert("Silinemedi");
    }
  }

  async function fetchAgencyUsers(agencyId: string) {
    try {
      const res = await fetch(`/api/agency/users?agency_id=${agencyId}`);
      const data = await res.json();
      if (data.users) setAgencyUsers(data.users);
    } catch {}
  }

  async function handleAssignUser() {
    if (!editing?.id || !assignEmail) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/agency/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agency_id: editing.id, email: assignEmail, role: assignRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAssignEmail("");
      fetchAgencyUsers(editing.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata olustu");
    }
    setAssigning(false);
  }

  async function handleRemoveUser(id: string) {
    if (!confirm("Bu kullaniciyi acentadan kaldirmak istediginize emin misiniz?")) return;
    try {
      await fetch("/api/agency/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (editing?.id) fetchAgencyUsers(editing.id);
    } catch {}
  }

  async function handleCreateUser() {
    if (!editing?.id || !newEmail || !newPassword) return;
    setCreating(true);
    try {
      const res = await fetch("/api/agency/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agency_id: editing.id, email: newEmail, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewEmail("");
      setNewPassword("");
      alert(`Hesap olusturuldu: ${data.user.email}`);
      fetchAgencyUsers(editing.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata olustu");
    }
    setCreating(false);
  }

  async function handleToggle(agency: Agency) {
    try {
      await fetch("/api/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agency.id, is_active: !agency.is_active }),
      });
      fetchAgencies();
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
          </div>
        </main>
      </>
    );
  }

  if (!hasPermission(permissions, "acentalar")) {
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Acenta Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-1">{agencies.filter((a) => a.is_active).length} aktif acenta</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/raporlar" className="text-sm text-brand-red hover:underline">Raporlar &rarr;</Link>
              <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
              <button
                onClick={() => { setEditing({ ...EMPTY }); setTab("info"); }}
                className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
              >
                + Yeni Acenta
              </button>
            </div>
          </div>

          {/* Edit/Create modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {editing.id ? "Acenta Düzenle" : "Yeni Acenta Ekle"}
                </h2>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
                  {([
                    { key: "info" as const, label: "Bilgiler" },
                    { key: "branding" as const, label: "Marka & Domain" },
                    { key: "commission" as const, label: "Komisyon" },
                    ...(editing.id ? [{ key: "users" as const, label: "Kullanicilar" }] : []),
                  ]).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {tab === "info" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Acenta Adı *</label>
                      <input
                        value={editing.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setEditing({ ...editing, name, slug: editing.id ? editing.slug : generateSlug(name) });
                        }}
                        placeholder="Örnek Turizm"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                      <input
                        value={editing.slug}
                        onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                        placeholder="ornek-turizm"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Yetkili Kişi</label>
                        <input
                          value={editing.contact_name}
                          onChange={(e) => setEditing({ ...editing, contact_name: e.target.value })}
                          placeholder="Ad Soyad"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
                        <input
                          value={editing.contact_email}
                          onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })}
                          placeholder="info@ornek.com"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
                        <input
                          value={editing.contact_phone}
                          onChange={(e) => setEditing({ ...editing, contact_phone: e.target.value })}
                          placeholder="+90 500 000 00 00"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Vergi No</label>
                        <input
                          value={editing.tax_number}
                          onChange={(e) => setEditing({ ...editing, tax_number: e.target.value })}
                          placeholder="1234567890"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Adres</label>
                      <textarea
                        value={editing.address}
                        onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                        placeholder="Acenta adresi"
                        rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">TURSAB Belge No</label>
                      <input
                        value={editing.tursab_no}
                        onChange={(e) => setEditing({ ...editing, tursab_no: e.target.value })}
                        placeholder="A 12345"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>
                )}

                {tab === "branding" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Domain *</label>
                      <input
                        value={editing.domain}
                        onChange={(e) => setEditing({ ...editing, domain: e.target.value })}
                        placeholder="www.ornekturizm.com"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />

                      {/* Domain status feedback */}
                      {domainStatus === "added" && (
                        <p className="text-xs text-emerald-600 mt-1.5 font-medium">Vercel&apos;e otomatik eklendi!</p>
                      )}
                      {domainStatus === "already" && (
                        <p className="text-xs text-blue-600 mt-1.5 font-medium">Domain zaten Vercel&apos;e ekli.</p>
                      )}
                      {domainStatus === "error" && (
                        <p className="text-xs text-red-500 mt-1.5 font-medium">{domainError}</p>
                      )}

                      {/* DNS Checklist */}
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-xs font-bold text-blue-800 mb-2">Domain Kurulum Adimlari</p>
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 text-xs mt-0.5">1.</span>
                            <p className="text-[11px] text-blue-700">
                              <strong>Kaydet</strong> butonuna basin — domain otomatik olarak Vercel&apos;e eklenecek.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 text-xs mt-0.5">2.</span>
                            <div className="text-[11px] text-blue-700">
                              <strong>DNS ayarlari</strong> (acenta domain saglayicisinda):
                              <div className="mt-1 bg-white/60 rounded-lg p-2 font-mono text-[10px] space-y-1">
                                <div><span className="text-blue-500">A</span> kaydi → <span className="font-bold">76.76.21.21</span></div>
                                <div><span className="text-blue-500">CNAME</span> (www) → <span className="font-bold">cname.vercel-dns.com</span></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-blue-500 text-xs mt-0.5">3.</span>
                            <p className="text-[11px] text-blue-700">
                              DNS yayilimi <strong>5-30 dakika</strong> surebilir. SSL sertifikasi Vercel tarafindan otomatik olusturulur.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Logo URL</label>
                      <input
                        value={editing.logo_url}
                        onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })}
                        placeholder="https://... veya /agencies/logo.png"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Favicon URL</label>
                      <input
                        value={editing.favicon_url}
                        onChange={(e) => setEditing({ ...editing, favicon_url: e.target.value })}
                        placeholder="https://... veya /agencies/favicon.ico"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Ana Renk</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editing.primary_color}
                            onChange={(e) => setEditing({ ...editing, primary_color: e.target.value })}
                            className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                          />
                          <input
                            value={editing.primary_color}
                            onChange={(e) => setEditing({ ...editing, primary_color: e.target.value })}
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Koyu Renk</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editing.secondary_color}
                            onChange={(e) => setEditing({ ...editing, secondary_color: e.target.value })}
                            className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                          />
                          <input
                            value={editing.secondary_color}
                            onChange={(e) => setEditing({ ...editing, secondary_color: e.target.value })}
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Branding preview */}
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                      <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-wider">Önizleme</p>
                      <div className="p-4 rounded-lg" style={{ backgroundColor: editing.secondary_color }}>
                        <div className="flex items-center gap-3">
                          {editing.logo_url ? (
                            <img src={editing.logo_url} alt="" className="h-8 w-auto" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/20" />
                          )}
                          <span className="text-white font-bold text-sm">{editing.name || "Acenta Adı"}</span>
                        </div>
                        <button className="mt-3 px-4 py-2 text-xs font-semibold text-white rounded-lg" style={{ backgroundColor: editing.primary_color }}>
                          Örnek Buton
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "commission" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Komisyon Oranı (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={editing.commission_rate}
                        onChange={(e) => setEditing({ ...editing, commission_rate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">API fiyati uzerine bu oranda platform komisyonu eklenir. Acenta kendi kar marjini ayrica belirler.</p>
                    </div>

                    {/* Commission calculator */}
                    <div className="p-5 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-wider">Fiyat Hesaplama Ornegi (Platform Komisyonu)</p>
                      <div className="space-y-2">
                        {[1000, 2500, 5000, 10000].map((base) => {
                          const comm = base * editing.commission_rate / 100;
                          return (
                            <div key={base} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">API: <span className="font-mono">{base.toLocaleString("tr-TR")} TL</span></span>
                              <span className="text-gray-400">+%{editing.commission_rate} = <span className="font-mono">{comm.toLocaleString("tr-TR")} TL</span></span>
                              <span className="font-bold text-gray-900">Acenta Maliyeti: <span className="font-mono">{(base + comm).toLocaleString("tr-TR")} TL</span></span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-3">Acenta bu maliyet uzerine kendi kar marjini ekleyerek satis fiyatini belirler.</p>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editing.is_active}
                          onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <span className="text-sm text-gray-700 font-medium">Aktif</span>
                      </label>
                      {!editing.is_active && (
                        <span className="text-xs text-red-500 font-medium">Acenta sitesi devre dışı olacak</span>
                      )}
                    </div>
                  </div>
                )}

                {tab === "users" && editing.id && (
                  <div className="space-y-4">
                    {/* Toggle: Create vs Assign */}
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setUserMode("create")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${userMode === "create" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                      >
                        Yeni Hesap Olustur
                      </button>
                      <button
                        onClick={() => setUserMode("assign")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${userMode === "assign" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                      >
                        Mevcut Kullanici Ata
                      </button>
                    </div>

                    {userMode === "create" ? (
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-400">Acenta icin yeni bir giris hesabi olusturun. Hesap otomatik olarak bu acentaya atanir.</p>
                        <input
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="acenta@email.com"
                          type="email"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                        />
                        <input
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Sifre (min 6 karakter)"
                          type="text"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                        />
                        <div className="flex gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                          >
                            <option value="owner">Sahip (fiyat belirleyebilir)</option>
                            <option value="staff">Personel (sadece goruntuleme)</option>
                          </select>
                          <button
                            onClick={handleCreateUser}
                            disabled={creating || !newEmail || !newPassword}
                            className="flex-1 px-4 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {creating ? "Olusturuluyor..." : "Hesap Olustur"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-400">Sistemde kayitli bir kullaniciyi bu acentaya atayin.</p>
                        <div className="flex gap-2">
                          <input
                            value={assignEmail}
                            onChange={(e) => setAssignEmail(e.target.value)}
                            placeholder="kullanici@email.com"
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                          />
                          <select
                            value={assignRole}
                            onChange={(e) => setAssignRole(e.target.value)}
                            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                          >
                            <option value="owner">Sahip</option>
                            <option value="staff">Personel</option>
                          </select>
                          <button
                            onClick={handleAssignUser}
                            disabled={assigning || !assignEmail}
                            className="px-4 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {assigning ? "..." : "Ata"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Existing users list */}
                    {agencyUsers.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-700 mb-2">Atanmis Kullanicilar</p>
                        <div className="space-y-2">
                          {agencyUsers.map((au) => (
                            <div key={au.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div>
                                <p className="text-xs font-mono text-gray-600">{au.user_id}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {au.role === "owner" ? "Sahip" : "Personel"} · {new Date(au.created_at).toLocaleDateString("tr-TR")}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveUser(au.id)}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Kaldir
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setEditing(null); setTab("info"); setAgencyUsers([]); }}
                    className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Iptal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editing.name}
                    className="flex-1 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Agency list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : agencies.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-400 mb-2">Henüz acenta eklenmemiş.</p>
              <p className="text-xs text-gray-300">
                Supabase dashboard&apos;dan <code>supabase/migrations/006_agencies.sql</code> dosyasını çalıştırın.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {agencies.map((agency) => (
                <div key={agency.id} className={`bg-white rounded-xl shadow-sm p-5 ${!agency.is_active ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-4">
                    {/* Logo / Color badge */}
                    <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: agency.secondary_color }}>
                      {agency.logo_url ? (
                        <img src={agency.logo_url} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-white font-bold text-lg">{agency.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{agency.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${agency.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                          {agency.is_active ? "Aktif" : "Pasif"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          %{agency.commission_rate} komisyon
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {agency.domain || "Domain atanmamış"} · {agency.contact_email} · {agency.contact_phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/raporlar?agency=${agency.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                      >
                        Rapor
                      </Link>
                      <button
                        onClick={() => handleToggle(agency)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                          agency.is_active ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        {agency.is_active ? "Durdur" : "Aktifle"}
                      </button>
                      <button
                        onClick={() => { setEditing({ ...agency }); setTab("info"); if (agency.id) fetchAgencyUsers(agency.id); }}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        Duzenle
                      </button>
                      <button
                        onClick={() => agency.id && handleDelete(agency)}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                      >
                        Sil
                      </button>
                    </div>
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
