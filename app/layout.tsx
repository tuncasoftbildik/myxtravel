import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AgencyProvider } from "@/lib/agency-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X Travel — Live Your Dream",
  description: "Uçak bileti, otel, transfer ve tur rezervasyonu",
  openGraph: {
    title: "X Travel — Live Your Dream",
    description: "Uçak bileti, otel, transfer ve tur rezervasyonu",
    url: "https://myxtravel.com.tr",
    siteName: "X Travel",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "X Travel",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "X Travel — Live Your Dream",
    description: "Uçak bileti, otel, transfer ve tur rezervasyonu",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AgencyProvider>{children}</AgencyProvider>
      </body>
    </html>
  );
}
