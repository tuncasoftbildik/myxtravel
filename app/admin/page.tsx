"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { useAdmin } from "@/lib/supabase/use-admin";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const PANELS = [
  {
    title: "Genel Ayarlar",
    description: "Site bilgileri, iletişim, sosyal medya, SEO",
    href: "/admin/genel",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    color: "bg-blue-500",
  },
  {
    title: "Ana Sayfa İçerik",
    description: "Hero, özellikler ve e-bülten yazıları",
    href: "/admin/icerik",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    color: "bg-brand-red",
  },
  {
    title: "Kampanya Yönetimi",
    description: "Kampanya ekle, düzenle veya kaldır",
    href: "/admin/kampanyalar",
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
    color: "bg-orange-500",
  },
  {
    title: "Logo Yönetimi",
    description: "Havayolu logolarını yönet",
    href: "/admin/logolar",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "bg-purple-500",
  },
  {
    title: "Footer Ayarları",
    description: "Alt bilgi metinleri ve linkleri",
    href: "/admin/footer",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    color: "bg-gray-700",
  },
  {
    title: "Sayfa İçerikleri",
    description: "Otobüs ve araç kiralama sayfa içerikleri",
    href: "/admin/sayfalar",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
    color: "bg-emerald-500",
  },
  {
    title: "E-Bülten Aboneleri",
    description: "Abone listesi, dışa aktarma",
    href: "/admin/aboneler",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "bg-pink-500",
  },
];

export default function AdminDashboard() {
  const { isAdmin, isLoggedIn, loading, role } = useAdmin();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
              <p className="text-sm text-gray-500 mt-1">
                Rol: <span className="font-medium text-brand-red">{role === "super_admin" ? "Super Admin" : "Admin"}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">Siteye Git</Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                Çıkış Yap
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PANELS.map((panel) => (
              <Link
                key={panel.href}
                href={panel.href}
                className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${panel.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={panel.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{panel.title}</h3>
                <p className="text-sm text-gray-500">{panel.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
