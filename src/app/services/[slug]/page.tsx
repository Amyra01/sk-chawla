"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, FileCheck, ShoppingBag, ArrowLeft } from "lucide-react";
import { FALLBACK_SERVICES } from "@/lib/seed-fallback";
import { useApp } from "@/components/providers/AppProvider";
import { formatINR } from "@/lib/utils";

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { addToCart } = useApp();
  const service = FALLBACK_SERVICES.find((s) => s.slug === params.slug);
  if (!service) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Services Store
      </Link>

      <div className="glass-card rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-gold font-semibold">
              {service.categoryName}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              {service.title}
            </h1>
            <p className="text-sm text-mutedText leading-relaxed">
              {service.fullDescription}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-obsidian/80 border border-sapphire/30 min-w-[240px] space-y-3">
            <p className="text-xs text-mutedText">Indicative Fee</p>
            <p className="font-serif text-3xl font-bold text-white">
              {formatINR(service.priceInr)}
            </p>
            <p className="text-[11px] font-mono text-gold">
              {service.priceDisplay} • SAC {service.sacCode}
            </p>
            <p className="text-xs text-mutedText">
              Turnaround: <strong className="text-white">{service.turnaroundTime}</strong>
            </p>
            <button
              type="button"
              onClick={() =>
                addToCart({
                  serviceId: service.id,
                  slug: service.slug,
                  title: service.title,
                  priceInr: service.priceInr,
                  sacCode: service.sacCode,
                })
              }
              className="w-full py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-gold-glow"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-white font-bold">
              What&apos;s Included
            </h2>
            <ul className="space-y-2.5 text-sm text-mutedText">
              {service.whatsIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-white font-bold">
              Documents Required Checklist
            </h2>
            <ul className="space-y-2.5 text-sm text-mutedText">
              {service.documentsRequired.map((doc) => (
                <li key={doc} className="flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-sapphire shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
