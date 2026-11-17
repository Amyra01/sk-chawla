"use client";

import { useState } from "react";
import { Search, Clock, BookOpen } from "lucide-react";

const ARTICLES = [
  {
    slug: "understanding-gst-drc-01-notices",
    title: "Understanding GST DRC-01 Show Cause Notices: A Practical Checklist",
    category: "GST Updates",
    readingTime: "5 min read",
    excerpt:
      "A calm, step-by-step guide to reading a DRC-01 notice, checking limitation periods and preparing your documentary reply.",
  },
  {
    slug: "income-tax-regime-comparison-fy",
    title: "Old vs New Income Tax Regime: Choosing Structurally",
    category: "Tax Planning",
    readingTime: "4 min read",
    excerpt:
      "Key factors salaried individuals, professionals and business owners should weigh before filing their Income Tax Return.",
  },
  {
    slug: "gstr-2b-reconciliation-discipline",
    title: "Why Monthly GSTR-2B Reconciliation Prevents Year-End Notices",
    category: "Compliance",
    readingTime: "4 min read",
    excerpt:
      "How matching supplier invoices every month safeguards Input Tax Credit under Section 16(2)(aa).",
  },
];

export default function InsightsPage() {
  const [query, setQuery] = useState("");
  const filtered = ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Knowledge Hub
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
            Tax &amp; Legal Insights
          </h1>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gold absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full rounded-xl bg-charcoal border border-white/15 pl-9 pr-3 py-2 text-xs text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((art) => (
          <article
            key={art.slug}
            className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gold font-semibold uppercase tracking-wider">
                  {art.category}
                </span>
                <span className="text-mutedText inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {art.readingTime}
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold text-white">
                {art.title}
              </h2>
              <p className="text-xs text-mutedText leading-relaxed">
                {art.excerpt}
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>General informational article</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
