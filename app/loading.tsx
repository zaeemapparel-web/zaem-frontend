"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingActions from "@/components/FloatingActions";
import AIChatbot from "@/components/AIChatbot";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [shopAIOpen, setShopAIOpen] = useState(false);
  const [supportAIOpen, setSupportAIOpen] = useState(false);

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body className="bg-ivory text-ink font-body antialiased overflow-x-hidden">
        <Navbar />
        {children}
        <Footer />
        <CartDrawer />
        <FloatingActions
          onOpenShopAI={() => setShopAIOpen(true)}
          onOpenSupportAI={() => setSupportAIOpen(true)}
        />
        <AIChatbot
          isOpen={shopAIOpen}
          mode="shop"
          onClose={() => setShopAIOpen(false)}
        />
        <AIChatbot
          isOpen={supportAIOpen}
          mode="support"
          onClose={() => setSupportAIOpen(false)}
        />
      </body>
    </html>
  );
}