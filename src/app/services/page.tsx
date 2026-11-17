"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Calculator } from "lucide-react";
import { FALLBACK_SERVICES } from "@/lib/seed-fallback";
import { useApp } from "@/components/providers/AppProvider";
import { formatINR } from "@/lib/utils";
import TiltCard from "@/components/ui/TiltCard";

export default function ServicesStorePage() {
  const { addToCart } = useApp();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [estGstins, setEstGstins] = useState(1);
  const [estFreq, setEstFreq] = useState<"monthly" | "quarterly">("monthly");

  const filtered =
    categoryFilter === "all"
      ? FALLBACK_SERVICES
      : FALLBACK_SERVICES.filter((s) => s.categorySlug === categoryFilter);

  const indicativeMin = estGstins * (estFreq === "monthly" ? 1500 : 1000);
  const indicativeMax = Math.round(indicativeMin * 1.6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Services Store
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
            Tax, Compliance &amp; Litigation Services
          </h1>
          <p className="text-sm text-mutedText mt-2 max-w-2xl">
            Transparent checklists, turnaround times, and GST-compliant
            invoicing. Informational overview — formal engagement begins upon
            confirmation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Services" },
            { id: "gst-indirect-tax", label: "GST & Indirect" },
            { id: "income-tax-direct-tax", label: "Income Tax" },
            { id: "litigation-corporate", label: "Litigation & MCA" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                categoryFilter === tab.id
                  ? "bg-gold-gradient text-obsidian border-gold"
                  : "bg-charcoal text-mutedText border-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* "What will this cost?" Quick Estimator */}
      <div className="glass-card rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-sapphire/30">
        <div className="md:col-span-2 space-y-1">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wider font-semibold">
            <Calculator className="w-4 h-4" /> &ldquo;What will this cost?&rdquo; Estimator
          </div>
          <p className="text-xs text-mutedText">
            Estimate indicative monthly compliance range by number of GSTINs and
            filing frequency.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-white">
            GSTINs:
            <input
              type="number"
              min={1}
              max={25}
              value={estGstins}
              onChange={(e) => setEstGstins(Math.max(1, Number(e.target.value)))}
              className="ml-2 w-16 rounded-lg bg-obsidian border border-white/15 px-2 py-1 text-xs text-white"
            />
          </label>
          <select
            value={estFreq}
            onChange={(e) =>
              setEstFreq(e.target.value as "monthly" | "quarterly")
            }
            className="rounded-lg bg-obsidian border border-white/15 px-2.5 py-1.5 text-xs text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-mutedText">Indicative Range</p>
          <p className="font-serif text-xl font-bold text-gold">
            {formatINR(indicativeMin)} – {formatINR(indicativeMax)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((srv) => (
          <TiltCard key={srv.slug} className="p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                {srv.categoryName}
              </span>
              <h2 className="font-serif text-2xl font-bold text-white">
                {srv.title}
              </h2>
              <p className="text-xs text-mutedText leading-relaxed">
                {srv.shortDescription}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-mutedText">
                  Turnaround: <strong className="text-white">{srv.turnaroundTime}</strong>
                </span>
                <span className="font-mono text-gold">
                  {srv.priceDisplay} ({formatINR(srv.priceInr)})
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <Link
                href={`/services/${srv.slug}`}
                className="text-xs font-semibold text-white hover:text-gold inline-flex items-center gap-1"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    serviceId: srv.id,
                    slug: srv.slug,
                    title: srv.title,
                    priceInr: srv.priceInr,
                    sacCode: srv.sacCode,
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </button>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}
