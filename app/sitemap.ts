import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { a2tour } from "@/lib/acente2";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://xturizm.com", changeFrequency: "daily", priority: 1.0 },
    { url: "https://xturizm.com/otel", changeFrequency: "daily", priority: 0.9 },
    { url: "https://xturizm.com/tur", changeFrequency: "daily", priority: 0.9 },
    { url: "https://xturizm.com/ucus", changeFrequency: "daily", priority: 0.9 },
    { url: "https://xturizm.com/transfer", changeFrequency: "daily", priority: 0.8 },
    { url: "https://xturizm.com/arac-kiralama", changeFrequency: "daily", priority: 0.8 },
    { url: "https://xturizm.com/otobus", changeFrequency: "daily", priority: 0.8 },
    { url: "https://xturizm.com/kampanyalar", changeFrequency: "weekly", priority: 0.8 },
    { url: "https://xturizm.com/blog", changeFrequency: "daily", priority: 0.8 },
    { url: "https://xturizm.com/hakkimizda", changeFrequency: "monthly", priority: 0.5 },
    { url: "https://xturizm.com/iletisim", changeFrequency: "monthly", priority: 0.5 },
    { url: "https://xturizm.com/kariyer", changeFrequency: "monthly", priority: 0.5 },
    { url: "https://xturizm.com/gizlilik", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://xturizm.com/kvkk", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://xturizm.com/cerez", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://xturizm.com/kullanim-kosullari", changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const supabase = await createClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `https://xturizm.com/blog/${post.slug}`,
      lastModified: post.published_at || undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Tur detay sayfalarini ekle
    let tourPages: MetadataRoute.Sitemap = [];
    try {
      const tourList = await a2tour.getTourList();
      const tours = tourList?.result || [];
      tourPages = tours.map((t) => ({
        url: `https://xturizm.com/tur/${t.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    } catch {
      // tur API erisilemezse atla
    }

    return [...staticPages, ...blogPages, ...tourPages];
  } catch {
    return staticPages;
  }
}
