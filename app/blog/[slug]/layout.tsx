import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = await createClient();
    const { data: post } = await supabase
      .from("blog_posts")
      .select("title, excerpt, cover_image, author, category, published_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (!post) {
      return { title: "Yazi Bulunamadi | X Travel" };
    }

    const title = `${post.title} | X Travel Blog`;
    const description = post.excerpt || `${post.title} - X Travel Blog`;
    const images = post.cover_image
      ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }]
      : [{ url: "/og-image.png", width: 1200, height: 630, alt: "X Travel" }];

    return {
      title,
      description,
      openGraph: {
        title: post.title,
        description,
        url: `https://xturizm.com/blog/${slug}`,
        siteName: "X Travel",
        images,
        locale: "tr_TR",
        type: "article",
        publishedTime: post.published_at || undefined,
        authors: [post.author],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: post.cover_image ? [post.cover_image] : ["/og-image.png"],
      },
    };
  } catch {
    return { title: "Blog | X Travel" };
  }
}

export default function BlogPostLayout({ children }: Props) {
  return children;
}
