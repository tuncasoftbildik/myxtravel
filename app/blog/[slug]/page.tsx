"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  category: string;
  published_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.post) {
          setPost(data.post);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header variant="solid" />
        <main className="flex-1 bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-64 bg-gray-200 rounded-2xl mt-6" />
              <div className="space-y-3 mt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Header variant="solid" />
        <main className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Yazı Bulunamadı</h1>
            <p className="text-gray-500 mb-6">Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.</p>
            <Link href="/blog" className="px-6 py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition">
              Tüm Yazılar
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 text-[10px] font-semibold bg-white/10 text-white/70 rounded-full">
                {post.category}
              </span>
              <span className="text-xs text-white/40">
                {new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">{post.title}</h1>
            <p className="text-sm text-white/50 mt-3">Yazar: {post.author}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Cover image */}
          {post.cover_image && (
            <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8 -mt-8 shadow-lg">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Article body */}
          <article
            className="prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back to blog */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-red-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tüm Yazılar
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
