"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";

export default function Footer() {
  const { t } = useApp();

  return (
    <footer
      id="footer"
      className="relative border-t border-sapphire/20 bg-obsidian/90 backdrop-blur-xl pt-16 pb-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sapphire/15 border border-sapphire/50 flex items-center justify-center font-serif font-bold text-white text-lg">
              SC
            </div>
            <div>
              <p className="font-serif text-lg text-white font-semibold">
                SUNIL CHAWLA &amp; ASSOCIATES
              </p>
              <p className="text-xs text-mutedText">
                Advocate, Tax Advisor &amp; Tax Consultant • B.A. LL.B. (Hons),
                DAVV Indore
              </p>
            </div>
          </div>
          <p className="text-sm text-mutedText max-w-md leading-relaxed">
            22+ years of dedicated practice across GST, Income Tax, VAT,
            revenue court litigation, and corporate compliance.
          </p>
          <p className="text-xs text-mutedText leading-relaxed">
            42, Street No. 1B7, Santokh Nagar, Shiv Puri, near Masjid,
            Vishnupuri, New Shiv Puri, Ludhiana, Punjab 141008, India
            <br />
            Phone: <a href="tel:+919872355007" className="text-white hover:text-gold">9872355007</a> • Email:{" "}
            <a href="mailto:sunilkumarchawla@gmail.com" className="text-white hover:text-gold">
              sunilkumarchawla@gmail.com
            </a>{" "}
            • Hours: 8:30 AM – 10:30 PM
          </p>
        </div>

        <div className="space-y-2.5 text-sm">
          <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
            Practice &amp; Tools
          </p>
          <Link href="/services" className="block text-mutedText hover:text-white">
            Services Store
          </Link>
          <Link href="/book" className="block text-mutedText hover:text-white">
            Book a Consultation
          </Link>
          <Link href="/notice-decoder" className="block text-mutedText hover:text-white">
            Notice Decoder (AI OCR)
          </Link>
          <Link href="/health-check" className="block text-mutedText hover:text-white">
            Compliance Health Check
          </Link>
          <Link href="/tools" className="block text-mutedText hover:text-white">
            Free Tax Calculators
          </Link>
          <Link href="/industries" className="block text-mutedText hover:text-white">
            Industry Solutions
          </Link>
        </div>

        <div className="space-y-2.5 text-sm">
          <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
            Trust &amp; Legal
          </p>
          <Link href="/trust-centre" className="block text-mutedText hover:text-white">
            Trust Centre
          </Link>
          <Link href="/card" className="block text-mutedText hover:text-white">
            Digital Visiting Card
          </Link>
          <Link href="/privacy" className="block text-mutedText hover:text-white">
            Privacy Policy (DPDP 2023)
          </Link>
          <Link href="/terms" className="block text-mutedText hover:text-white">
            Terms of Use
          </Link>
          <Link href="/refund-policy" className="block text-mutedText hover:text-white">
            Refund &amp; Cancellation Policy
          </Link>
          <Link href="/admin" className="block text-mutedText hover:text-gold">
            Admin Command Center
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-mutedText">
        <p>{t.disclaimer}</p>
        <p>© {new Date().getFullYear()} Sunil Chawla &amp; Associates • Ludhiana, Punjab</p>
      </div>
    </footer>
  );
}
