type BreadcrumbItem = { name: string; url: string };

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency"],
    name: "X Travel",
    url: "https://xturizm.com",
    logo: "https://xturizm.com/logo.png",
    description:
      "Ucak bileti, otel, transfer, tur ve otobus bileti rezervasyonu. Turkiye'nin yeni nesil online seyahat platformu.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
      addressLocality: "Istanbul",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Turkish",
    },
    sameAs: [
      "https://www.instagram.com/xturizm",
      "https://www.facebook.com/xturizm",
      "https://twitter.com/xturizm",
      "https://www.youtube.com/@xturizm",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "X Travel",
    url: "https://xturizm.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://xturizm.com/otel?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  author,
  datePublished,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  author: string;
  datePublished: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image,
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: "X Travel",
      logo: { "@type": "ImageObject", url: "https://xturizm.com/logo.png" },
    },
    datePublished,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
