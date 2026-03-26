"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author: string;
  category: string;
  published_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data) => {
        if (data.posts) setPosts(data.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Tümü", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered = selectedCategory === "Tümü" ? posts : posts.filter((p) => p.category === selectedCategory);

  return (
    <>
      <Header variant="solid" />
      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-brand-dark via-[#2d1b69] to-[#0f172a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-[20%] w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[10%] w-48 h-48 bg-fuchsia-500/8 rounded-full blur-[80px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-20 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">Blog</h1>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto">
              Seyahat ipuçları, rehberler ve en güncel haberler
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Category filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition ${
                    selectedCategory === cat
                      ? "bg-brand-red text-white border-brand-red"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-red/30 hover:text-brand-red"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-400 text-lg">Henüz blog yazısı yayınlanmamış.</p>
              <p className="text-gray-300 text-sm mt-1">Yakında yeni içeriklerle burada olacağız!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Cover image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-dark/5 to-brand-red/5">
                        <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-brand-red rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-brand-red transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{post.author}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
