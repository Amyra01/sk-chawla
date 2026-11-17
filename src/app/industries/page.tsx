import Link from "next/link";
import { Building2, CheckCircle2, ArrowRight } from "lucide-react";

const INDUSTRIES = [
  {
    slug: "jewellery-and-bullion",
    title: "Jewellery & Bullion",
    subtitle: "3% GST valuation, old-gold exchange, TCS/SFT & VAT legacy compliance.",
    painPoints: [
      "Making charges vs bullion valuation",
      "High-value cash & SFT reporting limits",
      "Old-gold exchange documentation",
    ],
    docs: ["Stock & Melting Registers", "Old-Gold Purchase Vouchers", "GSTR-1 & 3B"],
  },
  {
    slug: "textiles-and-fabrics",
    title: "Textiles & Fabrics",
    subtitle: "Inverted duty structure, job-work ITC-04 & e-way bill compliance.",
    painPoints: [
      "Inverted duty ITC refund tracking",
      "Job-work challan & ITC-04 compliance",
      "E-way bill transit detention defence",
    ],
    docs: ["Job-work Challans", "E-way Bills", "ITC-04 Statements"],
  },
  {
    slug: "manufacturers-industrial",
    title: "Manufacturers & Industrial Suppliers",
    subtitle: "Capital goods ITC, Rule 42/43 reversals & GSTR-2B reconciliations.",
    painPoints: [
      "Capital goods ITC & Rule 42/43 reversals",
      "GSTR-2B vs books mismatch notices",
      "HSN classification disputes",
    ],
    docs: ["Fixed Asset Register", "Bill of Materials", "GSTR-2B Reconciliation"],
  },
  {
    slug: "traders-and-wholesalers",
    title: "Traders & Wholesalers",
    subtitle: "High-volume e-invoicing, supplier compliance & credit-note timing.",
    painPoints: [
      "E-invoicing & QR code applicability",
      "Supplier non-filing blocking buyer ITC (Sec 16(2)(aa))",
      "Advance tax & working-capital planning",
    ],
    docs: ["Sales & Purchase Registers", "Tally Backup", "Bank Statements"],
  },
  {
    slug: "exporters-and-importers",
    title: "Exporters & Importers",
    subtitle: "LUT filings, zero-rated supply refunds & ICEGATE-GSTR-1 matching.",
    painPoints: [
      "LUT renewal & zero-rated export documentation",
      "ICEGATE vs GSTR-1 shipping bill mismatches",
      "IGST refund holds & deficiency memos",
    ],
    docs: ["Shipping Bills", "FIRC / e-BRC Copies", "Import Bills of Entry"],
  },
  {
    slug: "partnership-firms-startups",
    title: "Partnership Firms & Startups",
    subtitle: "Entity structuring, MCA SPICe+ incorporation & partner taxation.",
    painPoints: [
      "Proprietorship vs Partnership vs Pvt Ltd structuring",
      "Partner remuneration & interest u/s 40(b)",
      "MCA annual filings & DIR-3 KYC",
    ],
    docs: ["Partnership Deed / MOA & AOA", "Promoter KYC", "Registered Office Proof"],
  },
];

export default function IndustriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Sector-Specific Guidance
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          Industry Solutions
        </h1>
        <p className="text-sm text-mutedText mt-2 max-w-2xl">
          Informational overview of typical tax pain points, documentation, and
          relevant services across six core business sectors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INDUSTRIES.map((ind) => (
          <div
            key={ind.slug}
            className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <Building2 className="w-6 h-6 text-gold" />
              <h2 className="font-serif text-2xl font-bold text-white">
                {ind.title}
              </h2>
              <p className="text-xs text-mutedText">{ind.subtitle}</p>
              <div className="pt-2 space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-gold font-semibold">
                  Typical Pain Points
                </p>
                {ind.painPoints.map((p) => (
                  <p key={p} className="text-xs text-white/85 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sapphire shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </p>
                ))}
              </div>
              <div className="pt-2">
                <p className="text-[11px] uppercase tracking-wider text-mutedText font-semibold">
                  Key Documents
                </p>
                <p className="text-xs text-mutedText mt-1">{ind.docs.join(" • ")}</p>
              </div>
            </div>

            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline pt-3 border-t border-white/10"
            >
              Discuss Sector Compliance <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
