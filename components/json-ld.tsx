type BreadcrumbItem = { name: string; url: string };

interface TouristTripProps {
  name: string;
  description: string;
  url: string;
  image: string;
  nights: number;
  price: number | null;
  currency: string;
  departureCity: string;
  departureDate: string | null;
}

interface FAQItem {
  question: string;
  answer: string;
}


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
      "https://www.linkedin.com/company/x-turizm",
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

export function TouristTripJsonLd({
  name,
  description,
  url,
  image,
  nights,
  price,
  currency,
  departureCity,
  departureDate,
}: TouristTripProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description,
    url,
    image,
    touristType: "Seyahat Turu",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: nights + 1,
      description: `${nights} gece ${nights + 1} gun`,
    },
    provider: {
      "@type": "TravelAgency",
      name: "X Travel",
      url: "https://xturizm.com",
    },
    tripOrigin: {
      "@type": "Place",
      name: departureCity,
    },
  };

  if (price) {
    data.offers = {
      "@type": "Offer",
      price: String(price),
      priceCurrency: currency === "TL" ? "TRY" : currency,
      availability: "https://schema.org/InStock",
      seller: { "@type": "TravelAgency", name: "X Travel" },
    };
  }

  if (departureDate) {
    data.departureTime = departureDate;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
