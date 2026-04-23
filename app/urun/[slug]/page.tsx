import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { AgencyBookingForm } from "@/components/agency-booking-form";

type PageProps = { params: Promise<{ slug: string }> };

type ProductResponse = {
  product: {
    id: string;
    service_type: string;
    title: string;
    short_description: string;
    description: string;
    photos: string[];
    cover_photo: string;
    price: number;
    currency: string;
    price_note: string;
    details: Record<string, unknown>;
  };
  agency: {
    id: string;
    name: string;
    contact_email: string;
    contact_phone: string;
  };
};

async function getProduct(slug: string): Promise<ProductResponse | null> {
  const h = await headers();
  const domain = h.get("x-agency-domain") || "";
  if (!domain) return null;

  const host = h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/public/agency-products/${slug}`, {
    headers: { "x-agency-domain": domain },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function UrunDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();
  const { product, agency } = data;

  const details = (product.details || {}) as Record<string, unknown>;
  const photos: string[] = product.photos?.length ? product.photos : product.cover_photo ? [product.cover_photo] : [];

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8] py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {photos.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[0]} alt={product.title} className="w-full aspect-video object-cover" />
                {photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {photos.slice(1, 5).map((src: string) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="aspect-square object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6">
              <span className="text-xs uppercase font-semibold text-gray-500">
                {product.service_type === "transfer" ? "Transfer" : "Tur"}
              </span>
              <h1 className="text-2xl font-bold mt-1">{product.title}</h1>
              {product.short_description && <p className="text-gray-600 mt-2">{product.short_description}</p>}
              {product.description && (
                <p className="mt-4 text-gray-700 whitespace-pre-wrap">{product.description}</p>
              )}

              {product.service_type === "transfer" && (
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Nereden" value={details.from_location} />
                  <Info label="Nereye" value={details.to_location} />
                  <Info label="Araç" value={details.vehicle_type} />
                  <Info label="Max yolcu" value={details.max_passengers} />
                  {typeof details.duration_minutes === "number" && (
                    <Info label="Süre" value={`${details.duration_minutes} dk`} />
                  )}
                  {details.round_trip ? <Info label="" value="Gidiş-dönüş" /> : null}
                </dl>
              )}
              {product.service_type === "tour" && (
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Info
                    label="Süre"
                    value={`${details.duration_days ?? "-"} gün / ${details.duration_nights ?? "-"} gece`}
                  />
                  {details.departure_point ? <Info label="Kalkış" value={details.departure_point} /> : null}
                  {details.meeting_point ? <Info label="Buluşma" value={details.meeting_point} /> : null}
                </dl>
              )}

              <Bullets title="Öne çıkanlar" items={asList(details.highlights)} />
              <Bullets title="Dahil olanlar" items={asList(details.includes)} />
              <Bullets title="Dahil olmayanlar" items={asList(details.excludes)} />
              <Bullets title="Diller" items={asList(details.languages)} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-2xl font-bold text-brand-red">
                {Number(product.price).toLocaleString("tr-TR")} {product.currency}
              </p>
              {product.price_note && <p className="text-xs text-gray-500">{product.price_note}</p>}
              <hr className="my-4" />
              <AgencyBookingForm
                productId={product.id}
                agencyContact={{ email: agency?.contact_email, phone: agency?.contact_phone }}
              />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  if (value == null || value === "") return null;
  return (
    <div>
      {label && <dt className="text-gray-500">{label}</dt>}
      <dd className="font-medium text-gray-900">{String(value)}</dd>
    </div>
  );
}

function asList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length > 0);
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <ul className="mt-2 list-disc list-inside text-gray-700 text-sm space-y-1">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}
