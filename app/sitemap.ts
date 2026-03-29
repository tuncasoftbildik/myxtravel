import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

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

    return [...staticPages, ...blogPages];
  } catch {
    return staticPages;
  }
}
