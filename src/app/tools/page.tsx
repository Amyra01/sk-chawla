"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, Clock, FileCheck, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function FreeTaxToolsPage() {
  // 1. GST Calculator
  const [gstAmount, setGstAmount] = useState(10000);
  const [gstRate, setGstRate] = useState(18);
  const [gstMode, setGstMode] = useState<"exclusive" | "inclusive">("exclusive");

  const gstTax =
    gstMode === "exclusive"
      ? (gstAmount * gstRate) / 100
      : gstAmount - gstAmount / (1 + gstRate / 100);
  const gstTotal =
    gstMode === "exclusive" ? gstAmount + gstTax : gstAmount;

  // 2. Late Fee & Interest Estimator
  const [daysLate, setDaysLate] = useState(10);
  const [taxDue, setTaxDue] = useState(25000);
  const [isNil, setIsNil] = useState(false);
  const lateFee = Math.min(5000, daysLate * (isNil ? 20 : 50));
  const interestEst = Math.round((taxDue * 0.18 * daysLate) / 365);

  // 3. Old vs New Regime Comparison
  const [income, setIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(200000);
  const calcNewRegime = (inc: number) => {
    const taxable = Math.max(0, inc - 75000);
    if (taxable <= 700000) return 0;
    let tax = 0;
    if (taxable > 300000) tax += Math.min(400000, taxable - 300000) * 0.05;
    if (taxable > 700000) tax += Math.min(300000, taxable - 700000) * 0.1;
    if (taxable > 1000000) tax += Math.min(200000, taxable - 1000000) * 0.15;
    if (taxable > 1200000) tax += Math.min(300000, taxable - 1200000) * 0.2;
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.3;
    return Math.round(tax * 1.04);
  };
  const calcOldRegime = (inc: number, ded: number) => {
    const taxable = Math.max(0, inc - 50000 - ded);
    if (taxable <= 500000) return 0;
    let tax = 0;
    if (taxable > 250000) tax += Math.min(250000, taxable - 250000) * 0.05;
    if (taxable > 500000) tax += Math.min(500000, taxable - 500000) * 0.2;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.3;
    return Math.round(tax * 1.04);
  };
  const newTax = calcNewRegime(income);
  const oldTax = calcOldRegime(income, deductions);

  // 4. Appeal & Reply Time-Limit Calculator
  const [noticeType, setNoticeType] = useState("gst-drc-01-73");
  const [commDate, setCommDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const ruleDays =
    noticeType === "gst-appeal-sec-107" ? 90 : 30;
  const lastDate = new Date(
    new Date(commDate).getTime() + ruleDays * 86400000
  )
    .toISOString()
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Calculators &amp; Smart Guides
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          Free Tax &amp; Compliance Tools
        </h1>
        <p className="text-xs text-mutedText mt-2">
          All calculators provide indicative estimates only — confirm final
          computations and statutory dates with your advisor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GST Calculator */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-4 h-4" /> GST Calculator (Inclusive / Exclusive)
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <input
              type="number"
              value={gstAmount}
              onChange={(e) => setGstAmount(Number(e.target.value))}
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
            />
            <select
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value))}
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
            >
              {[5, 12, 18, 28].map((r) => (
                <option key={r} value={r}>
                  {r}% GST
                </option>
              ))}
            </select>
            <select
              value={gstMode}
              onChange={(e) =>
                setGstMode(e.target.value as "exclusive" | "inclusive")
              }
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </div>
          <div className="p-4 rounded-xl bg-obsidian/70 border border-white/10 flex justify-between text-sm">
            <span>GST Amount: <strong className="text-gold">{formatINR(Math.round(gstTax))}</strong></span>
            <span>Total: <strong className="text-white">{formatINR(Math.round(gstTotal))}</strong></span>
          </div>
        </div>

        {/* Late Fee & Interest Estimator */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gold text-xs font-semibold uppercase tracking-wider">
              GSTR-3B / 1 Late Fee &amp; Interest
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
              Estimate Only
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-mutedText">Days Late</span>
              <input
                type="number"
                min={0}
                value={daysLate}
                onChange={(e) => setDaysLate(Number(e.target.value))}
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-mutedText">Tax Payable (₹)</span>
              <input
                type="number"
                min={0}
                value={taxDue}
                onChange={(e) => setTaxDue(Number(e.target.value))}
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
              />
            </label>
            <label className="flex items-center gap-2 pt-5 text-white">
              <input
                type="checkbox"
                checked={isNil}
                onChange={(e) => setIsNil(e.target.checked)}
                className="accent-sapphire"
              />
              Nil Return
            </label>
          </div>
          <div className="p-4 rounded-xl bg-obsidian/70 border border-white/10 flex justify-between text-sm">
            <span>Late Fee: <strong className="text-gold">{formatINR(lateFee)}</strong></span>
            <span>Interest (18% p.a.): <strong className="text-white">{formatINR(interestEst)}</strong></span>
          </div>
        </div>

        {/* Old vs New Regime */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="text-gold text-xs font-semibold uppercase tracking-wider">
            Income Tax Regime Comparison (Old vs New)
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-mutedText">Gross Annual Income (₹)</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-mutedText">Chapter VI-A / HRA Deductions (₹)</span>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
              />
            </label>
          </div>
          <div className="p-4 rounded-xl bg-obsidian/70 border border-white/10 flex justify-between text-sm">
            <span>New Regime: <strong className="text-gold">{formatINR(newTax)}</strong></span>
            <span>Old Regime: <strong className="text-white">{formatINR(oldTax)}</strong></span>
          </div>
        </div>

        {/* Appeal & Reply Time-Limit Calculator */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Appeal &amp; Reply Time-Limit Calculator
            </span>
            <span className="text-[10px] text-amber-300">
              Estimate only, confirm with advisor
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <select
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
            >
              <option value="gst-asmt-10">ASMT-10 Scrutiny (30 days)</option>
              <option value="gst-drc-01-73">DRC-01 Notice Sec 73 (30 days)</option>
              <option value="gst-appeal-sec-107">GST Appeal Sec 107 (90 days)</option>
              <option value="it-appeal-cit">Income Tax Appeal CIT(A) (30 days)</option>
            </select>
            <input
              type="date"
              value={commDate}
              onChange={(e) => setCommDate(e.target.value)}
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-white"
            />
          </div>
          <div className="p-4 rounded-xl bg-obsidian/70 border border-white/10 flex items-center justify-between text-sm">
            <span>Indicative Last Date: <strong className="text-gold font-mono">{lastDate}</strong></span>
            <Link href="/book" className="text-xs text-white hover:text-gold inline-flex items-center gap-1">
              Book Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Which GST Return Guide & Checklist CTA */}
      <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileCheck className="w-6 h-6 text-gold shrink-0 mt-0.5" />
          <div>
            <h2 className="font-serif text-xl text-white font-bold">
              Need a Personalised Document Checklist?
            </h2>
            <p className="text-xs text-mutedText mt-1">
              View exact document requirements on every service page or book a
              consultation for tailored structuring.
            </p>
          </div>
        </div>
        <Link
          href="/services"
          className="px-5 py-2.5 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold shrink-0"
        >
          Browse Service Checklists
        </Link>
      </div>
    </div>
  );
}
