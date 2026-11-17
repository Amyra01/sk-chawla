"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { FALLBACK_CONSULTATION_TYPES } from "@/lib/seed-fallback";
import { formatINR, isValidGSTIN } from "@/lib/utils";
import { useApp } from "@/components/providers/AppProvider";
import { emitSceneEvent } from "@/components/scene/StageCanvas";

interface SlotOption {
  time: string;
  isoStart: string;
  available: boolean;
}

export default function BookPage() {
  const { t } = useApp();
  const [step, setStep] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState(
    FALLBACK_CONSULTATION_TYPES[1].slug
  );
  const [mode, setMode] = useState<"google_meet" | "phone" | "in_office">(
    "google_meet"
  );
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().slice(0, 10);
  });
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotIso, setSelectedSlotIso] = useState("");
  const [isFull, setIsFull] = useState(false);

  // Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [topic, setTopic] = useState("GST / Tax Consultation");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    bookingRef: string;
    status: string;
    meetLink?: string;
    amountInr: number;
  } | null>(null);

  const consult =
    FALLBACK_CONSULTATION_TYPES.find((c) => c.slug === selectedSlug) ||
    FALLBACK_CONSULTATION_TYPES[1];

  useEffect(() => {
    const loadSlots = async () => {
      setSlotsLoading(true);
      setSelectedSlotIso("");
      try {
        const res = await fetch(`/api/bookings/availability?date=${dateStr}`);
        const data = await res.json();
        setSlots(data.slots || []);
        setIsFull(Boolean(data.isFull));
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    void loadSlots();
  }, [dateStr]);

  const handleConfirm = async () => {
    setError("");
    if (!consent) {
      setError("Please accept the DPDP privacy consent.");
      emitSceneEvent({ type: "fail" });
      return;
    }
    if (gstin.trim() && !isValidGSTIN(gstin)) {
      setError("Invalid GSTIN format (15 characters expected).");
      emitSceneEvent({ type: "fail" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationSlug: selectedSlug,
          mode,
          slotStartIso: selectedSlotIso,
          clientName: name,
          clientEmail: email,
          clientPhone: phone,
          gstin: gstin || undefined,
          topic,
          description,
          dpdpConsent: consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking failed.");
        emitSceneEvent({ type: "fail" });
      } else {
        setResult(data);
        setStep(5);
        emitSceneEvent({ type: "pulse" });
      }
    } catch {
      setError("Network error while creating booking.");
      emitSceneEvent({ type: "fail" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Consultation Booking
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          Schedule a Session with Mr. Sunil Chawla
        </h1>
        <p className="text-xs text-mutedText">
          All times are shown in <strong className="text-white">IST (Asia/Kolkata)</strong>.
          NRI clients: please verify IST conversion before confirming.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {["1. Type & Mode", "2. Date & Slot", "3. Details", "4. Review & Pay", "5. Confirmed"].map(
          (label, idx) => {
            const num = idx + 1;
            const active = step === num;
            const done = step > num;
            return (
              <div
                key={label}
                className={`px-3.5 py-2 rounded-xl border shrink-0 font-medium ${
                  active
                    ? "bg-gold-gradient text-obsidian border-gold"
                    : done
                      ? "bg-sapphire/20 text-gold border-sapphire/40"
                      : "bg-charcoal/70 text-mutedText border-white/10"
                }`}
              >
                {label}
              </div>
            );
          }
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-white font-bold">
              Choose Consultation Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FALLBACK_CONSULTATION_TYPES.map((ct) => (
                <button
                  key={ct.slug}
                  type="button"
                  onClick={() => setSelectedSlug(ct.slug)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedSlug === ct.slug
                      ? "bg-sapphire/15 border-gold shadow-gold-glow"
                      : "bg-obsidian/60 border-white/10 hover:border-sapphire/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white text-sm">
                      {ct.title}
                    </span>
                    <span className="text-xs font-mono text-gold">
                      {ct.isPaid ? formatINR(ct.priceInr) : "Free"}
                    </span>
                  </div>
                  <p className="text-xs text-mutedText mt-1.5">
                    {ct.description}
                  </p>
                  <p className="text-[11px] font-mono text-sapphire mt-2">
                    {ct.durationMinutes} minutes
                  </p>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-white">
                Preferred Mode
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "google_meet", label: "Google Meet Video", icon: Video },
                  { id: "phone", label: "Phone Call", icon: Phone },
                  { id: "in_office", label: "In-Office (Ludhiana)", icon: Building2 },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setMode(m.id as "google_meet" | "phone" | "in_office")
                      }
                      className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                        mode === m.id
                          ? "bg-sapphire/20 border-gold text-white"
                          : "bg-obsidian/60 border-white/10 text-mutedText"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gold" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold"
              >
                Next: Pick Date &amp; Time <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-serif text-2xl text-white font-bold">
                Select Date &amp; IST Time Slot
              </h2>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" />
                <input
                  type="date"
                  value={dateStr}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="rounded-lg bg-obsidian border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {slotsLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 rounded-xl bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : isFull || slots.length === 0 ? (
              <div className="p-5 rounded-xl bg-obsidian/80 border border-amber-500/30 space-y-2">
                <p className="text-sm text-white font-semibold">
                  No open slots on {dateStr}
                </p>
                <p className="text-xs text-mutedText">
                  Please pick another date or submit an urgent query via Ask a
                  Query to join the priority waitlist.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlotIso(s.isoStart)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                      selectedSlotIso === s.isoStart
                        ? "bg-gold-gradient text-obsidian border-gold shadow-gold-glow"
                        : s.available
                          ? "bg-obsidian/70 text-white border-white/15 hover:border-gold"
                          : "bg-obsidian/30 text-white/25 border-white/5 line-through cursor-not-allowed"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {s.time}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian border border-white/15 text-xs text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={!selectedSlotIso}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold disabled:opacity-40"
              >
                Next: Your Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-white font-bold">
              Your Contact &amp; Matter Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name *"
                className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
              />
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number (for OTP/WhatsApp) *"
                className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address *"
                className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
              />
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="GSTIN (Optional, 15 chars)"
                className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white font-mono"
              />
            </div>
            <input
              required
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic / Category *"
              className="w-full rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
            />
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of your requirement or notice details..."
              className="w-full rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
            />

            <label className="flex items-start gap-2.5 text-xs text-mutedText cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-sapphire"
              />
              <span>
                {t.dpdpConsent} {t.bciNotice}
              </span>
            </label>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian border border-white/15 text-xs text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={!name || !email || !phone || !topic}
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold disabled:opacity-40"
              >
                Review Summary <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl text-white font-bold">
              Confirm Booking
            </h2>
            <div className="p-4 rounded-xl bg-obsidian/80 border border-white/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-mutedText">Consultation</span>
                <span className="text-white font-semibold">{consult.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Mode</span>
                <span className="text-white capitalize">{mode.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Slot (IST)</span>
                <span className="text-gold font-mono">
                  {new Date(selectedSlotIso).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-mutedText">Fee</span>
                <span className="text-white font-bold">
                  {consult.isPaid ? formatINR(consult.priceInr) : "Free"}
                </span>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian border border-white/15 text-xs text-white"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold shadow-gold-glow"
              >
                {submitting
                  ? "Confirming..."
                  : consult.isPaid
                    ? `Reserve Slot & Pay ${formatINR(consult.priceInr)}`
                    : "Confirm Free Call"}
              </button>
            </div>
          </div>
        )}

        {step === 5 && result && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-sapphire/20 border border-gold flex items-center justify-center text-gold shadow-sapphire-glow">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold">
              <Sparkles className="w-3.5 h-3.5" /> Booking Recorded
            </p>
            <h2 className="font-serif text-3xl text-white font-bold">
              Reference: {result.bookingRef}
            </h2>
            <p className="text-sm text-mutedText max-w-md mx-auto">
              Confirmation details and calendar invite (.ics) have been queued
              for your email and WhatsApp.
            </p>
            {result.meetLink && (
              <a
                href={result.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-gold underline"
              >
                Google Meet Room: {result.meetLink}
              </a>
            )}
            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/portal"
                className="px-5 py-2.5 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold"
              >
                Go to Client Portal
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-obsidian border border-white/15 text-white text-xs"
              >
                Back Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
