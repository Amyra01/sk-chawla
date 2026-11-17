"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { emitSceneEvent } from "@/components/scene/StageCanvas";

export default function HealthCheckPage() {
  const { t } = useApp();
  const [registrationStatus, setRegistrationStatus] = useState<
    "registered" | "pending" | "unsure"
  >("registered");
  const [filingRegularity, setFilingRegularity] = useState<
    "always_on_time" | "occasional_delay" | "pending"
  >("always_on_time");
  const [gstr2bReconciled, setGstr2bReconciled] = useState<
    "monthly" | "rarely" | "never"
  >("monthly");
  const [pendingNotices, setPendingNotices] = useState<
    "none" | "one" | "multiple"
  >("none");
  const [turnoverBracket, setTurnoverBracket] = useState("₹40L – ₹1.5 Cr");
  const [gstinCount, setGstinCount] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    riskAreas: Array<{ area: string; level: "low" | "medium" | "high" }>;
    actionList: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      emitSceneEvent({ type: "fail" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          answers: {
            registrationStatus,
            filingRegularity,
            gstr2bReconciled,
            pendingNotices,
            turnoverBracket,
            gstinCount,
          },
          dpdpConsent: consent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        emitSceneEvent({ type: "pulse" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          2-Minute Assessment
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          Business Compliance Health Check
        </h1>
      </div>

      {result ? (
        <div className="glass-card rounded-2xl p-8 space-y-6 border-gold/40">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={result.score >= 75 ? "#34D399" : result.score >= 50 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={
                    2 * Math.PI * 52 * (1 - result.score / 100)
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-serif text-3xl font-bold text-white">
                  {result.score}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-mutedText">
                  / 100
                </p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <h2 className="font-serif text-2xl font-bold text-white">
                Compliance Health Score
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.riskAreas.map((r) => (
                  <span
                    key={r.area}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      r.level === "low"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : r.level === "medium"
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                          : "bg-red-500/15 border-red-500/40 text-red-300"
                    }`}
                  >
                    {r.area}: {r.level.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white">
              Recommended Action Checklist
            </h3>
            <ul className="space-y-2 text-xs text-mutedText">
              {result.actionList.map((a) => (
                <li key={a} className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4">
            <Link
              href="/book"
              className="px-5 py-2.5 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold inline-flex items-center gap-1.5"
            >
              Book Consultation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="px-5 py-2.5 rounded-xl bg-obsidian border border-white/15 text-xs text-white"
            >
              Retake Check
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <label className="space-y-1.5">
              <span className="text-white font-medium">GST Registration Status</span>
              <select
                value={registrationStatus}
                onChange={(e) =>
                  setRegistrationStatus(
                    e.target.value as "registered" | "pending" | "unsure"
                  )
                }
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-white"
              >
                <option value="registered">Active &amp; Registered</option>
                <option value="pending">Application Pending</option>
                <option value="unsure">Unsure of Threshold</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-white font-medium">Filing Regularity</span>
              <select
                value={filingRegularity}
                onChange={(e) =>
                  setFilingRegularity(
                    e.target.value as "always_on_time" | "occasional_delay" | "pending"
                  )
                }
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-white"
              >
                <option value="always_on_time">Always On Time</option>
                <option value="occasional_delay">Occasional Delays</option>
                <option value="pending">Pending Returns</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-white font-medium">GSTR-2B vs Books Reconciliation</span>
              <select
                value={gstr2bReconciled}
                onChange={(e) =>
                  setGstr2bReconciled(
                    e.target.value as "monthly" | "rarely" | "never"
                  )
                }
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-white"
              >
                <option value="monthly">Reconciled Monthly</option>
                <option value="rarely">Quarterly / Rarely</option>
                <option value="never">Never Reconciled</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-white font-medium">Pending Tax Notices</span>
              <select
                value={pendingNotices}
                onChange={(e) =>
                  setPendingNotices(
                    e.target.value as "none" | "one" | "multiple"
                  )
                }
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-white"
              >
                <option value="none">None</option>
                <option value="one">1 Open Notice</option>
                <option value="multiple">Multiple Notices</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-white font-medium">Annual Turnover Bracket</span>
              <select
                value={turnoverBracket}
                onChange={(e) => setTurnoverBracket(e.target.value)}
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-white"
              >
                <option>Up to ₹40 Lakhs</option>
                <option>₹40L – ₹1.5 Cr</option>
                <option>₹1.5 Cr – ₹5 Cr</option>
                <option>Above ₹5 Cr</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-white font-medium">Number of GSTINs</span>
              <input
                type="number"
                min={0}
                max={100}
                value={gstinCount}
                onChange={(e) => setGstinCount(Number(e.target.value))}
                className="w-full rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-white"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name *"
              className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for Action Report *"
              className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-mutedText cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-sapphire"
            />
            <span>{t.dpdpConsent}</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold shadow-gold-glow"
          >
            {loading ? "Calculating Score..." : "Calculate Compliance Health Score"}
          </button>
        </form>
      )}
    </div>
  );
}
