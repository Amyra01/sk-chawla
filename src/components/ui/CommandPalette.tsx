"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, MessageSquare, FileWarning, Calculator, X } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { FALLBACK_SERVICES, FALLBACK_FAQS } from "@/lib/seed-fallback";

const QUICK_ACTIONS = [
  { label: "Book a Consultation", href: "/book", icon: Calendar, group: "Quick Actions" },
  { label: "Ask a Query (Ticket)", href: "/ask-query", icon: MessageSquare, group: "Quick Actions" },
  { label: "Check My Notice (AI OCR)", href: "/notice-decoder", icon: FileWarning, group: "Quick Actions" },
  { label: "Compliance Health Check", href: "/health-check", icon: Calculator, group: "Quick Actions" },
  { label: "Free Tax Calculators", href: "/tools", icon: Calculator, group: "Tools" },
  { label: "Compliance Calendar", href: "/compliance-calendar", icon: Calendar, group: "Tools" },
  { label: "Industry Solutions", href: "/industries", icon: Search, group: "Pages" },
  { label: "Trust Centre", href: "/trust-centre", icon: Search, group: "Pages" },
  { label: "Digital Visiting Card", href: "/card", icon: Search, group: "Pages" },
  { label: "Client Portal", href: "/portal", icon: Search, group: "Pages" },
];

export default function CommandPalette() {
  const { cmdOpen, setCmdOpen } = useApp();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const serviceHits = FALLBACK_SERVICES.map((s) => ({
      label: s.title,
      sub: s.categoryName,
      href: `/services/${s.slug}`,
      group: "Services",
    }));
    const faqHits = FALLBACK_FAQS.map((f) => ({
      label: f.question,
      sub: f.category,
      href: "/#faq",
      group: "FAQs",
    }));
    const all = [
      ...QUICK_ACTIONS.map((a) => ({ label: a.label, sub: a.group, href: a.href, group: a.group })),
      ...serviceHits,
      ...faqHits,
    ];
    if (!q) return all.slice(0, 10);
    return all
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.sub.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query]);

  if (!cmdOpen) return null;

  const navigate = (href: string) => {
    setCmdOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Global command search"
      onClick={() => setCmdOpen(false)}
    >
      <div
        className="w-full max-w-xl glass-card rounded-2xl overflow-hidden border-sapphire/40 shadow-gold-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-4 h-4 text-gold" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, tools, notices, FAQs..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-mutedText focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setCmdOpen(false)}
            aria-label="Close search"
            className="p-1 text-mutedText hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <p className="text-xs text-mutedText text-center py-8">
              No matching pages or services found.
            </p>
          ) : (
            results.map((item, idx) => (
              <button
                key={`${item.href}-${idx}`}
                type="button"
                onClick={() => navigate(item.href)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sapphire/15 flex items-center justify-between gap-3 transition-colors"
              >
                <span className="text-sm text-white line-clamp-1">
                  {item.label}
                </span>
                <span className="text-[11px] text-gold shrink-0">
                  {item.sub}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
