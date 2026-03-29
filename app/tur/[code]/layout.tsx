import type { Metadata } from "next";
import { a2tour } from "@/lib/acente2";
import { TouristTripJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

type Props = {
  params: Promise<{ code: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  try {
    const detail = await a2tour.getTourDetail(Number(code));
    const tour = detail?.result;

    if (!tour) {
      return { title: "Tur Bulunamadi | X Travel" };
    }

    const nights = tour.nights || 0;
    const title = `${tour.name} | ${nights}N/${nights + 1}G Tur | X Travel`;
    const description =
      tour.generalInfo
        ? tour.generalInfo.replace(/<[^>]*>/g, "").slice(0, 160)
        : `${tour.name} - ${nights} gece ${nights + 1} gun tur paketi. X Travel ile hemen rezervasyon yapin.`;
    const image = tour.images?.[0]?.url || "https://xturizm.com/og-image.png";

    return {
      title,
      description,
      alternates: { canonical: `https://xturizm.com/tur/${code}` },
      openGraph: {
        title: tour.name,
        description,
        url: `https://xturizm.com/tur/${code}`,
        siteName: "X Travel",
        images: [{ url: image, width: 1200, height: 630, alt: tour.name }],
        locale: "tr_TR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: tour.name,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "Tur | X Travel" };
  }
}

export default async function TurDetailLayout({ children, params }: Props) {
  const { code } = await params;

  let tourName = "";
  let tourDesc = "";
  let tourImage = "https://xturizm.com/og-image.png";
  let nights = 0;
  let departureCity = "";

  try {
    const detail = await a2tour.getTourDetail(Number(code));
    const tour = detail?.result;

    if (tour) {
      tourName = tour.name || "";
      tourDesc = tour.generalInfo
        ? tour.generalInfo.replace(/<[^>]*>/g, "").slice(0, 200)
        : tourName;
      tourImage = tour.images?.[0]?.url || tourImage;
      nights = tour.nights || 0;
      departureCity = tour.departureCity || "Istanbul";
    }
  } catch {
    // fallback to defaults
  }

  return (
    <>
      {tourName && (
        <>
          <TouristTripJsonLd
            name={tourName}
            description={tourDesc}
            url={`https://xturizm.com/tur/${code}`}
            image={tourImage}
            nights={nights}
            price={null}
            currency="TRY"
            departureCity={departureCity}
            departureDate={null}
          />
          <BreadcrumbJsonLd
            items={[
              { name: "Ana Sayfa", url: "https://xturizm.com" },
              { name: "Turlar", url: "https://xturizm.com/tur" },
              { name: tourName, url: `https://xturizm.com/tur/${code}` },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
