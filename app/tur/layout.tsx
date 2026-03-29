import type { Metadata } from "next";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Turlar 2026 — Yurt Ici ve Yurt Disi Tur Paketleri | X Travel",
  description:
    "En uygun tur paketleri: yurt disi turlari, yurt ici turlari, cruise gemi turlari, vizesiz turlar. Istanbul, Ankara cikisli kulturel ve tatil turlari. X Travel ile hayalinizdeki turu kesfet.",
  keywords: [
    "tur",
    "turlar",
    "tur paketleri",
    "yurt disi turlari",
    "yurt ici turlari",
    "vizesiz turlar",
    "cruise turlari",
    "gemi turlari",
    "kulturel turlar",
    "tatil turlari",
    "ucakli turlar",
    "istanbul cikisli turlar",
    "kapadokya turu",
    "avrupa turlari",
    "balkan turlari",
  ],
  alternates: { canonical: "https://xturizm.com/tur" },
  openGraph: {
    title: "Turlar 2026 — Yurt Ici ve Yurt Disi Tur Paketleri",
    description:
      "En uygun fiyatli tur paketleri. Vizesiz turlar, cruise turlari, kulturel geziler. 50+ ulke, 500+ tur secenegi.",
    url: "https://xturizm.com/tur",
    siteName: "X Travel",
    images: [
      {
        url: "https://xturizm.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "X Travel Turlar",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turlar 2026 — Yurt Ici ve Yurt Disi Tur Paketleri | X Travel",
    description:
      "En uygun tur paketleri. Vizesiz turlar, cruise turlari, kulturel geziler.",
  },
};

const FAQ_ITEMS = [
  {
    question: "Tur ucretine neler dahildir?",
    answer:
      "Ucak veya otobus bileti, otel konaklamasi, transferler ve profesyonel rehberlik hizmeti standart olarak dahildir. Detaylar tur sayfasinda belirtilir.",
  },
  {
    question: "Yurt disi turlari icin vize gerekli mi?",
    answer:
      "Destinasyona gore degisir. Vizesiz gidebileceginiz ulkeler icin 'Vizesiz Turlar' filtresini kullanabilirsiniz. Vize gerektiren turlarda gerekli belgeler tur detayinda belirtilir.",
  },
  {
    question: "Tur rezervasyonumu nasil iptal edebilirim?",
    answer:
      "Iptal kosullari her tur icin farklidir ve tur detay sayfasinda belirtilir. Genel olarak hareket tarihine 7 gunden fazla sure varsa ucretsiz iptal mumkundur.",
  },
  {
    question: "Taksitli odeme secenegi var mi?",
    answer:
      "Evet, kredi karti ile taksitli odeme secenegi sunuyoruz. Taksit secenekleri bankaniza gore degisiklik gosterebilir.",
  },
  {
    question: "Cocuklar icin indirim var mi?",
    answer:
      "Evet, 0-6 yas arasi cocuklar icin ozel indirimler mevcuttur. Cocuk fiyatlari tur detay sayfasinda belirtilir.",
  },
];

export default function TurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", url: "https://xturizm.com" },
          { name: "Turlar", url: "https://xturizm.com/tur" },
        ]}
      />
      <FAQJsonLd items={FAQ_ITEMS} />
      {children}
    </>
  );
}
