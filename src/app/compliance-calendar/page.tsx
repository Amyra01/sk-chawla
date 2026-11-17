"use client";

import { useState } from "react";
import { CalendarClock, BellRing } from "lucide-react";
import { FALLBACK_COMPLIANCE_DATES } from "@/lib/seed-fallback";
import { useApp } from "@/components/providers/AppProvider";
import { emitSceneEvent } from "@/components/scene/StageCanvas";

export default function ComplianceCalendarPage() {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      emitSceneEvent({ type: "fail" });
      return;
    }
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, dpdpConsent: consent }),
    });
    if (res.ok) {
      setSubscribed(true);
      emitSceneEvent({ type: "pulse" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Statutory Due Dates
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          Compliance Calendar &amp; Reminders
        </h1>
        <p className="text-sm text-mutedText mt-2">
          Admin-managed GST, Income Tax, and VAT due dates. Subscribe for email
          or WhatsApp reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FALLBACK_COMPLIANCE_DATES.map((d) => (
          <div
            key={d.id}
            className="glass-card rounded-2xl p-5 flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                {d.category} • {d.form_code}
              </span>
              <h2 className="font-serif text-xl font-bold text-white">
                {d.title}
              </h2>
              <p className="text-xs text-mutedText">{d.description}</p>
              <p className="text-[11px] text-white/70">
                Applicable: {d.applicable_to}
              </p>
            </div>
            <div className="text-right shrink-0">
              <CalendarClock className="w-5 h-5 text-sapphire ml-auto mb-1" />
              <p className="font-mono text-xs text-gold">{d.due_date}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubscribe}
        className="glass-card rounded-2xl p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center gap-2 text-white font-serif text-2xl font-bold">
          <BellRing className="w-5 h-5 text-gold" />
          <span>Remind Me Before Due Dates</span>
        </div>
        {subscribed ? (
          <p className="text-sm text-emerald-400">
            Reminder subscription saved. You will receive alerts ahead of
            statutory deadlines.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp Number"
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
              className="px-6 py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold"
            >
              Activate Reminders
            </button>
          </>
        )}
      </form>
    </div>
  );
}
