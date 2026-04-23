"use client";

import { useEffect, useState } from "react";
import { AgencyProductCard } from "@/components/agency-product-card";

type Product = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  cover_photo: string;
  photos: string[];
  price: number;
  currency: string;
  price_note: string;
};

type Props = { serviceType: "transfer" | "tour"; title: string };

export function AgencyFeaturedSection({ serviceType, title }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/public/agency-products?service_type=${serviceType}`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoaded(true));
  }, [serviceType]);

  if (!loaded) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-10 bg-[#f5f0e8]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-bold mb-5">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => <AgencyProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
