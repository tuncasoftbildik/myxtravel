import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

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

export default async function BlogPostLayout({ children, params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image, author, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return (
    <>
      {post && (
        <>
          <ArticleJsonLd
            title={post.title}
            description={post.excerpt || post.title}
            url={`https://xturizm.com/blog/${slug}`}
            image={post.cover_image || "https://xturizm.com/og-image.png"}
            author={post.author}
            datePublished={post.published_at || ""}
          />
          <BreadcrumbJsonLd
            items={[
              { name: "Ana Sayfa", url: "https://xturizm.com" },
              { name: "Blog", url: "https://xturizm.com/blog" },
              { name: post.title, url: `https://xturizm.com/blog/${slug}` },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
