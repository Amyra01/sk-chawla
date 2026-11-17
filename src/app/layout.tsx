import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/providers/AppProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/Preloader";
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import CartDrawer from "@/components/store/CartDrawer";
import CommandPalette from "@/components/ui/CommandPalette";
import AiAssistantWidget from "@/components/ui/AiAssistantWidget";
import SiteTour from "@/components/ui/SiteTour";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "sk chawla",
    template: "%s | sk chawla",
  },
  description:
    "22+ years of experience in GST, Income Tax, VAT, and tax litigation in Ludhiana, Punjab. Book consultations, submit queries, decode tax notices, and manage compliance.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Sunil Chawla & Associates | Advocate, Tax Advisor & Tax Consultant",
    description:
      "Where Legal Precision Meets Tax Mastery. 22 years of protecting dealers, companies and firms.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Attorney", "LocalBusiness"],
    name: "Sunil Chawla & Associates — Advocate & Tax Consultant",
    description:
      "Advocate, Tax Advisor and Tax Consultant (B.A. LL.B. Hons, DAVV Indore) with 22+ years of experience in GST, Income Tax, VAT and tax litigation.",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "42, Street No. 1B7, Santokh Nagar, Shiv Puri, near Masjid, Vishnupuri, New Shiv Puri",
      addressLocality: "Ludhiana",
      addressRegion: "Punjab",
      postalCode: "141008",
      addressCountry: "IN",
    },
    telephone: "+91-9872355007",
    email: "sunilkumarchawla@gmail.com",
    openingHours: "Mo-Su 08:30-22:30",
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} dark`}>
      <body className="font-sans bg-obsidian text-mutedText film-grain min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProvider>
          <Preloader />
          <CustomCursor />
          <ScrollProgressBar />
          <Navbar />
          <main className="flex-1 pt-24">{children}</main>
          <Footer />
          <CartDrawer />
          <CommandPalette />
          <AiAssistantWidget />
          <SiteTour />
        </AppProvider>
      </body>
    </html>
  );
}
