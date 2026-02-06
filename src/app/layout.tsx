import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Script from "next/script";
import { ShopProvider } from "@/context/ShopContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X-treme Shoot Billiard & Cafe | Premium Menu",
  description: "Explore our delicious menu at X-treme Shoot Billiard & Cafe. Premium billiard tables, great food, and refreshing drinks in Purwokerto.",
  keywords: ["X-treme Shoot Billiard", "Billiard Purwokerto", "Cafe Purwokerto", "Tempat Nongkrong Purwokerto", "Menu Makanan", "Billiard & Cafe", "Kuliner Purwokerto"],
  openGraph: {
    title: "X-treme Shoot Billiard & Cafe | Premium Menu",
    description: "Premium Billiard Experience & Delicious Eats. Check out our digital menu.",
    url: "https://xtreme-menu.vercel.app",
    siteName: "X-treme Shoot Billiard & Cafe",
    images: [
      {
        url: "/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "X-treme Shoot Billiard & Cafe",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "X-treme Shoot Billiard & Cafe | Premium Menu",
    description: "Premium Billiard Experience & Delicious Eats in Purwokerto.",
    images: ["/hero-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Cafe",
    name: "X-treme Shoot Billiard & Cafe",
    image: "https://xtreme-menu.vercel.app/hero-bg.png",
    url: "https://xtreme-menu.vercel.app",
    menu: "https://xtreme-menu.vercel.app",
    servesCuisine: "Indonesian, Western, Snacks",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Profesor DR. HR Boenyamin",
      addressLocality: "Purwokerto Utara",
      addressRegion: "Jawa Tengah",
      postalCode: "53122",
      addressCountry: "ID"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -7.403963, 
      longitude: 109.244437
    },
    description: "Premium Billiard Experience & Delicious Eats in Purwokerto. Enjoy our wide range of food and beverages while playing.",
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        <ShopProvider>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
