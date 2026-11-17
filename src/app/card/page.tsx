"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Download, Phone, Mail, MapPin, Share2, Printer } from "lucide-react";

export default function DigitalCardPage() {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : "https://sunilchawla.in/card";
    QRCode.toDataURL(url, {
      width: 220,
      margin: 1,
      color: { dark: "#0A0F1C", light: "#F7F2E8" },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, []);

  const downloadVCard = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Chawla;Sunil;;Mr.;",
      "FN:Sunil Chawla (Sunil Chawla & Associates)",
      "ORG:Sunil Chawla & Associates",
      "TITLE:Advocate, Tax Advisor & Tax Consultant",
      "TEL;TYPE=WORK,VOICE:+919872355007",
      "EMAIL;TYPE=WORK:sunilkumarchawla@gmail.com",
      "ADR;TYPE=WORK:;;42, Street No. 1B7, Santokh Nagar, Shiv Puri, near Masjid, Vishnupuri, New Shiv Puri;Ludhiana;Punjab;141008;India",
      "END:VCARD",
    ].join("\r\n");

    const blob = new Blob([vcard], { type: "text/vcard" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Sunil-Chawla-Advocate.vcf";
    a.click();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="glass-card rounded-3xl p-8 text-center space-y-6 border-sapphire/40 shadow-gold-glow">
        <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-gold/50">
          <Image
            src="/images/hero-advocate.jpg"
            alt="Sunil Chawla"
            fill
            sizes="80px"
            className="object-cover object-top"
          />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Sunil Chawla
          </h1>
          <p className="text-xs font-semibold text-white/90 mt-0.5">
            SUNIL CHAWLA &amp; ASSOCIATES
          </p>
          <p className="text-xs text-gold uppercase tracking-widest mt-1">
            Advocate • Tax Advisor • Tax Consultant
          </p>
          <p className="text-xs text-mutedText mt-1">
            B.A. LL.B. (Hons), DAVV Indore • 22+ Years
          </p>
        </div>

        {qrDataUrl && (
          <div className="inline-block p-3 rounded-2xl bg-obsidian border border-sapphire/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Digital Card QR Code" className="w-40 h-40" />
          </div>
        )}

        <div className="space-y-2.5 text-xs text-left bg-obsidian/70 p-4 rounded-2xl border border-white/10">
          <a href="tel:+919872355007" className="flex items-center gap-3 text-white hover:text-gold">
            <Phone className="w-4 h-4 text-gold shrink-0" />
            <span className="font-mono">9872355007</span>
          </a>
          <a href="mailto:sunilkumarchawla@gmail.com" className="flex items-center gap-3 text-white hover:text-gold">
            <Mail className="w-4 h-4 text-gold shrink-0" />
            <span className="font-mono">sunilkumarchawla@gmail.com</span>
          </a>
          <div className="flex items-start gap-3 text-white">
            <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span>
              42, Street No. 1B7, Santokh Nagar, Shiv Puri, near Masjid,
              Vishnupuri, New Shiv Puri, Ludhiana, Punjab 141008, India
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={downloadVCard}
            className="py-3 px-4 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Save Contact
          </button>
          <a
            href="https://wa.me/919872355007?text=Hello%20Sunil%20Chawla%20%26%20Associates"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl bg-obsidian border border-sapphire/40 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-gold" /> WhatsApp Share
          </a>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="text-xs text-mutedText hover:text-white inline-flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" /> Print Desk QR Card
        </button>
      </div>
    </div>
  );
}
