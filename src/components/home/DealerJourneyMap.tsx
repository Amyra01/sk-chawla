"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    id: "registration",
    title: "Registration",
    happens: "GSTIN, PAN/TAN, MCA incorporation and statutory threshold assessment.",
    mistakes: "Incorrect HSN/SAC mapping or mismatched address proof causing ARN delays.",
    limit: "Within 30 days of crossing threshold (GST)",
    serviceSlug: "new-gst-registration",
  },
  {
    id: "monthly-returns",
    title: "Monthly Returns",
    happens: "GSTR-1 outward supply reporting, GSTR-2B reconciliation, and GSTR-3B tax payment.",
    mistakes: "Claiming ITC not reflected in GSTR-2B or missing credit-note adjustments.",
    limit: "11th (GSTR-1) & 20th (GSTR-3B) of next month",
    serviceSlug: "gst-return-filing",
  },
  {
    id: "annual-return",
    title: "Annual Return",
    happens: "GSTR-9 / 9C annual reconciliation and Income Tax Return + Audit alignment.",
    mistakes: "Unreconciled turnover differences between Books, GSTR-1, and Form 26AS/AIS.",
    limit: "31st December (GSTR-9) / 31st October (Tax Audit)",
    serviceSlug: "itr-filing-advisory",
  },
  {
    id: "audit-assessment",
    title: "Audit / Assessment",
    happens: "Departmental scrutiny (ASMT-10), GST audit (ADT-01), or Income Tax scrutiny.",
    mistakes: "Submitting incomplete ledgers without invoice-level reconciliation.",
    limit: "Typically 15–30 days from notice",
    serviceSlug: "gst-return-filing",
  },
  {
    id: "notice",
    title: "Notice",
    happens: "Issuance of Show Cause Notice (DRC-01 under Sec 73/74) or reassessment notice.",
    mistakes: "Ignoring portal notifications or missing the reply window.",
    limit: "30 days (or date specified in notice)",
    serviceSlug: "notice-reply-drafting",
  },
  {
    id: "reply",
    title: "Reply",
    happens: "Drafting factual & statutory written submissions with documentary evidence.",
    mistakes: "Generic replies without supporting circulars, e-way bills, or payment proofs.",
    limit: "Before personal hearing / due date",
    serviceSlug: "notice-reply-drafting",
  },
  {
    id: "appeal",
    title: "Appeal",
    happens: "Filing APL-01 before Appellate Authority or Form 35 before CIT(A).",
    mistakes: "Missing the 3-month statutory limitation or pre-deposit computation.",
    limit: "3 months (GST Sec 107) / 30 days (IT Sec 249)",
    serviceSlug: "tax-litigation-revenue-court",
  },
  {
    id: "resolution",
    title: "Resolution",
    happens: "Appellate order, rectification, stay vacation, or final compliance closure.",
    mistakes: "Failing to follow up on consequential refund or demand drop on portal.",
    limit: "Ongoing compliance monitoring",
    serviceSlug: "tax-litigation-revenue-court",
  },
];

export default function DealerJourneyMap() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-3">
        {STAGES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(idx)}
            className={cn(
              "shrink-0 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2",
              idx === active
                ? "bg-gold-gradient text-obsidian border-gold shadow-gold-glow"
                : "bg-charcoal/80 text-mutedText border-white/10 hover:border-sapphire/40 hover:text-white"
            )}
          >
            <span className="font-mono text-[10px] opacity-75">
              0{idx + 1}
            </span>
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-sapphire/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wider font-semibold">
            <CheckCircle2 className="w-4 h-4" /> What Happens
          </div>
          <p className="text-sm text-white leading-relaxed">{stage.happens}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider font-semibold">
            <AlertTriangle className="w-4 h-4" /> Common Mistakes
          </div>
          <p className="text-sm text-mutedText leading-relaxed">
            {stage.mistakes}
          </p>
        </div>
        <div className="space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sapphire text-xs uppercase tracking-wider font-semibold">
              <Clock className="w-4 h-4" /> Typical Time Limit
            </div>
            <p className="text-sm text-white font-mono">{stage.limit}</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/services/${stage.serviceSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
            >
              View Relevant Service <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sapphire/20 border border-sapphire/40 px-3 py-1.5 rounded-lg hover:bg-sapphire/30"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
