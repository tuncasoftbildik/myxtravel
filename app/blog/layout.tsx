import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | X Travel",
  description:
    "Seyahat ipuclari, gezi rehberleri ve kampanya haberleri. X Travel blog yazilarini kesfedin.",
  alternates: { canonical: "https://xturizm.com/blog" },
  openGraph: {
    title: "Blog | X Travel",
    description:
      "Seyahat ipuclari, gezi rehberleri ve kampanya haberleri.",
    url: "https://xturizm.com/blog",
    siteName: "X Travel",
    locale: "tr_TR",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
