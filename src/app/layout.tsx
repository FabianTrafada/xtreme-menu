import type { Metadata } from "next";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Script from "next/script";
import { ShopProvider } from "@/context/ShopContext";
import { MenuProvider } from "@/context/MenuContext";
import { Toaster } from "react-hot-toast";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "X-treme Shoot Billiard & Cafe | Premium Menu",
  description: "Experience the premium taste of victory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <div className="fixed inset-0 z-[-1] bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        <div className="fixed inset-0 z-[-2] bg-gradient-to-br from-background via-[#0a0a0a] to-[#050505]"></div>
        
        <MenuProvider>
          <ShopProvider>
            {children}
            <Toaster position="bottom-center" />
          </ShopProvider>
        </MenuProvider>

        <Script
          src={
            process.env.MIDTRANS_IS_PRODUCTION === "true"
              ? "https://app.midtrans.com/snap/snap.js"
              : "https://app.sandbox.midtrans.com/snap/snap.js"
          }
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
