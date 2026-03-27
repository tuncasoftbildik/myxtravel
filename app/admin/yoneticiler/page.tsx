"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin } from "@/lib/supabase/use-admin";

interface AdminUser {
  user_id: string;
  role: string;
  email: string;
  full_name: string;
  permissions: string[];
}

const MODULES: { key: string; label: string; description: string }[] = [
  { key: "genel", label: "Genel Ayarlar", description: "Site bilgileri, iletisim, sosyal medya, SEO" },
  { key: "icerik", label: "Ana Sayfa Icerik", description: "Hero, ozellikler ve e-bulten yazilari" },
  { key: "kampanyalar", label: "Kampanya Yonetimi", description: "Kampanya ekle, duzenle veya kaldir" },
  { key: "logolar", label: "Logo Yonetimi", description: "Havayolu logolarini yonet" },
  { key: "footer", label: "Footer Ayarlari", description: "Alt bilgi metinleri ve linkleri" },
  { key: "sayfalar", label: "Sayfa Icerikleri", description: "Otobus ve arac kiralama sayfa icerikleri" },
  { key: "blog", label: "Blog Yonetimi", description: "Blog yazilari ekle, duzenle, yayinla" },
  { key: "aboneler", label: "E-Bulten Aboneleri", description: "Abone listesi, disa aktarma" },
  { key: "acentalar", label: "Acenta Yonetimi", description: "Acenta ekle, komisyon belirle, domain ata" },
  { key: "raporlar", label: "Satis Raporlari", description: "Acenta bazli satis ve komisyon takibi" },
];

export default function YoneticilerPage() {
  const { isAdmin, isLoggedIn, loading: authLoading, role } = useAdmin();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  // Edit mode
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const isSuperAdmin = role === "super_admin";

  useEffect(() => {
    if (isSuperAdmin) fetchAdmins();
  }, [isSuperAdmin]);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.admins) setAdmins(data.admins);
    } catch {}
    setLoading(false);
  }

  function flash(msg: string, type: "success" | "error") {
    if (type === "success") { setSuccess(msg); setError(""); }
    else { setError(msg); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  }

  async function handleAdd() {
    if (!newEmail) { flash("Email gerekli", "error"); return; }
    if (newPermissions.length === 0) { flash("En az bir yetki secmelisiniz", "error"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword || undefined,
          full_name: newName || undefined,
          permissions: newPermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      flash(`${newEmail} admin olarak eklendi`, "success");
      setShowAdd(false);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewPermissions([]);
      fetchAdmins();
    } catch (e: any) {
      flash(e.message || "Hata olustu", "error");
    }
    setSaving(false);
  }

  async function handleUpdatePermissions(userId: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, permissions: editPermissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      flash("Yetkiler guncellendi", "success");
      setEditingUserId(null);
      fetchAdmins();
    } catch (e: any) {
      flash(e.message || "Hata olustu", "error");
    }
    setSaving(false);
  }

  async function handleRemoveAdmin(userId: string, email: string) {
    if (!confirm(`${email} kullanicisinin admin yetkisini kaldirmak istediginize emin misiniz?`)) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users?user_id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      flash(`${email} admin yetkisi kaldirildi`, "success");
      fetchAdmins();
    } catch (e: any) {
      flash(e.message || "Hata olustu", "error");
    }
    setSaving(false);
  }

  function togglePermission(perm: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(perm) ? list.filter((p) => p !== perm) : [...list, perm]);
  }

  function toggleAllPermissions(list: string[], setList: (v: string[]) => void) {
    if (list.length === MODULES.length) setList([]);
    else setList(MODULES.map((m) => m.key));
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

  if (!isLoggedIn || !isAdmin || !isSuperAdmin) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
            <p className="text-gray-600 mb-4">Bu sayfaya sadece Super Admin erisebilir.</p>
            <Link href="/admin" className="text-brand-red font-semibold hover:underline">Admin Paneli</Link>
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

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yonetici Yonetimi</h1>
              <p className="text-sm text-gray-500 mt-1">Admin ekle, yetkileri duzenle veya kaldir</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowAdd(!showAdd); setEditingUserId(null); }}
                className="px-4 py-2 text-sm font-medium bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors"
              >
                {showAdd ? "Iptal" : "+ Admin Ekle"}
              </button>
              <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>
          )}

          {/* Add form */}
          {showAdd && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Yeni Admin Ekle</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@ornek.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Opsiyonel"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sifre (yeni kullanici icin)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Yetkiler *</label>
                  <button
                    onClick={() => toggleAllPermissions(newPermissions, setNewPermissions)}
                    className="text-[10px] text-brand-red hover:underline"
                  >
                    {newPermissions.length === MODULES.length ? "Hepsini Kaldir" : "Hepsini Sec"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MODULES.map((m) => (
                    <label
                      key={m.key}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        newPermissions.includes(m.key)
                          ? "border-brand-red/30 bg-brand-red/5"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newPermissions.includes(m.key)}
                        onChange={() => togglePermission(m.key, newPermissions, setNewPermissions)}
                        className="mt-0.5 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.label}</p>
                        <p className="text-xs text-gray-400">{m.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium bg-brand-red text-white rounded-lg hover:bg-brand-red/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Ekleniyor..." : "Admin Olarak Ekle"}
              </button>
            </div>
          )}

          {/* Admin list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-400">Henuz admin eklenmemis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => {
                const isSuper = admin.role === "super_admin";
                const isEditing = editingUserId === admin.user_id;

                return (
                  <div key={admin.user_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* User row */}
                    <div className="flex items-center gap-4 p-5">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-gray-500">
                          {(admin.full_name || admin.email).slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{admin.full_name || admin.email.split("@")[0]}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isSuper ? "bg-brand-red/10 text-brand-red" : "bg-blue-50 text-blue-600"
                          }`}>
                            {isSuper ? "Super Admin" : "Admin"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                        {!isSuper && !isEditing && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {admin.permissions.length === 0 ? (
                              <span className="text-[10px] text-red-400">Yetki atanmamis</span>
                            ) : (
                              admin.permissions.map((p) => {
                                const mod = MODULES.find((m) => m.key === p);
                                return (
                                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {mod?.label || p}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        )}
                        {isSuper && (
                          <p className="text-[10px] text-gray-400 mt-1">Tam yetki (tum modullere erisim)</p>
                        )}
                      </div>
                      {!isSuper && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              if (isEditing) {
                                setEditingUserId(null);
                              } else {
                                setEditingUserId(admin.user_id);
                                setEditPermissions([...admin.permissions]);
                                setShowAdd(false);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                          >
                            {isEditing ? "Iptal" : "Duzenle"}
                          </button>
                          <button
                            onClick={() => handleRemoveAdmin(admin.user_id, admin.email)}
                            disabled={saving}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                          >
                            Kaldir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Edit permissions panel */}
                    {isEditing && (
                      <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-medium text-gray-600">Yetkiler</label>
                          <button
                            onClick={() => toggleAllPermissions(editPermissions, setEditPermissions)}
                            className="text-[10px] text-brand-red hover:underline"
                          >
                            {editPermissions.length === MODULES.length ? "Hepsini Kaldir" : "Hepsini Sec"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                          {MODULES.map((m) => (
                            <label
                              key={m.key}
                              className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                editPermissions.includes(m.key)
                                  ? "border-brand-red/30 bg-white"
                                  : "border-gray-200 bg-white/60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={editPermissions.includes(m.key)}
                                onChange={() => togglePermission(m.key, editPermissions, setEditPermissions)}
                                className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
                              />
                              <span className="text-sm text-gray-700">{m.label}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => handleUpdatePermissions(admin.user_id)}
                          disabled={saving}
                          className="px-5 py-2 text-sm font-medium bg-brand-red text-white rounded-lg hover:bg-brand-red/90 disabled:opacity-50 transition-colors"
                        >
                          {saving ? "Kaydediliyor..." : "Yetkileri Kaydet"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
