import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ZAEM — Style. Redefined.",
    template: "%s | ZAEM",
  },
  description:
    "Premium clothing, perfumes, and bags — considered design, crafted for the discerning. Pakistan's quiet luxury.",
  keywords: [
    "ZAEM",
    "premium clothing",
    "luxury perfume",
    "designer bags",
    "Pakistan fashion",
    "quiet luxury",
    "editorial fashion",
    "unstiched",
    "pret",
    "winter collection",
  ],
  authors: [{ name: "ZAEM" }],
  creator: "ZAEM",
  publisher: "ZAEM",
  metadataBase: new URL("https://zaemstore.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zaemstore.com",
    siteName: "ZAEM",
    title: "ZAEM — Style. Redefined.",
    description:
      "Premium clothing, perfumes, and bags — considered design, crafted for the discerning.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZAEM — Style. Redefined.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAEM — Style. Redefined.",
    description:
      "Premium clothing, perfumes, and bags — considered design, crafted for the discerning.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
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
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="bg-ivory text-ink font-body antialiased overflow-x-hidden">
        <Navbar />
        {children}
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
      </body>
    </html>
  );
}