"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin, hasPermission } from "@/lib/supabase/use-admin";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at?: string;
}

const EMPTY: BlogPost = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  author: "Admin",
  category: "Genel",
  is_published: false,
  published_at: null,
};

const CATEGORIES = ["Genel", "Seyahat", "Oteller", "Uçak", "Transfer", "Tur", "Kampanya", "Rehber"];

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const { isAdmin, isLoggedIn, loading: authLoading, permissions } = useAdmin();

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/blog?all=true");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch {}
    setLoading(false);
  }

  async function handleSave() {
    if (!editing || !editing.title) return;
    setSaving(true);
    try {
      const payload = { ...editing };
      if (!payload.slug) payload.slug = generateSlug(payload.title);
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditing(null);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    try {
      await fetch("/api/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchPosts();
    } catch {
      alert("Silinemedi");
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    try {
      await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : post.published_at,
        }),
      });
      fetchPosts();
    } catch {
      alert("Güncellenemedi");
    }
  }

  const filtered = posts.filter((p) => {
    if (filter === "published") return p.is_published;
    if (filter === "draft") return !p.is_published;
    return true;
  });

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

  if (!hasPermission(permissions, "blog")) {
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
              <h1 className="text-2xl font-bold text-gray-900">Blog Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-1">{posts.length} yazı ({posts.filter((p) => p.is_published).length} yayında)</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-sm text-brand-red hover:underline">&larr; Panel</Link>
              <button
                onClick={() => setEditing({ ...EMPTY })}
                className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
              >
                + Yeni Yazı
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
            {([
              { key: "all", label: "Tümü" },
              { key: "published", label: "Yayında" },
              { key: "draft", label: "Taslak" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${filter === t.key ? "bg-brand-red text-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Edit/Create modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {editing.id ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Başlık *</label>
                    <input
                      value={editing.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditing({
                          ...editing,
                          title,
                          slug: editing.id ? editing.slug : generateSlug(title),
                        });
                      }}
                      placeholder="Blog yazısı başlığı"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">/blog/</span>
                      <input
                        value={editing.slug}
                        onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                        placeholder="otomatik-olusturulur"
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                      <select
                        value={editing.category}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Yazar</label>
                      <input
                        value={editing.author}
                        onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                        placeholder="Admin"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kapak Görseli URL</label>
                    <input
                      value={editing.cover_image}
                      onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
                      placeholder="https://... veya /images/blog/gorsel.jpg"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Özet</label>
                    <textarea
                      value={editing.excerpt}
                      onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                      placeholder="Kısa bir özet (liste sayfasında görünür)"
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">İçerik</label>
                    <textarea
                      value={editing.content}
                      onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                      placeholder="Blog yazısının tam içeriği... (HTML desteklenir)"
                      rows={12}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none resize-y"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">HTML etiketleri kullanabilirsiniz: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt; vb.</p>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.is_published}
                        onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                      />
                      <span className="text-sm text-gray-700 font-medium">Yayınla</span>
                    </label>
                    {editing.is_published && (
                      <span className="text-xs text-emerald-600 font-medium">Kaydedildiğinde yayınlanacak</span>
                    )}
                  </div>
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
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-gray-400 mb-2">
                {filter === "all" ? "Henüz blog yazısı eklenmemiş." : filter === "published" ? "Yayında yazı yok." : "Taslak yazı yok."}
              </p>
              <p className="text-xs text-gray-300">
                Supabase dashboard&apos;dan <code>supabase/migrations/005_blog_posts.sql</code> dosyasını çalıştırdığınızdan emin olun.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((post) => (
                <div key={post.id} className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 ${!post.is_published ? "opacity-70" : ""}`}>
                  {/* Cover thumbnail */}
                  {post.cover_image ? (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                      <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{post.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium text-gray-500 border-gray-200">
                        {post.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${post.is_published ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                        {post.is_published ? "Yayında" : "Taslak"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{post.excerpt || "Özet yok"}</p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      {post.author} · {post.created_at ? new Date(post.created_at).toLocaleDateString("tr-TR") : "—"}
                      {post.slug && <span> · /blog/{post.slug}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                        post.is_published
                          ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                          : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {post.is_published ? "Geri Çek" : "Yayınla"}
                    </button>
                    <button
                      onClick={() => setEditing({ ...post })}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => post.id && handleDelete(post.id)}
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
