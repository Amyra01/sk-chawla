"use client";

import { useState } from "react";
import { Mic, MicOff, Send, Search, CheckCircle2 } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { emitSceneEvent } from "@/components/scene/StageCanvas";

export default function AskQueryPage() {
  const { t, locale } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("GST");
  const [urgency, setUrgency] = useState<"Normal" | "Urgent">("Normal");
  const [question, setQuestion] = useState("");
  const [publicConsent, setPublicConsent] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [listening, setListening] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Ticket tracker
  const [lookupId, setLookupId] = useState("");
  const [ticketData, setTicketData] = useState<{
    ticket_id?: string;
    ticketId?: string;
    status: string;
    category: string;
    urgency: string;
  } | null>(null);

  const startVoiceToQuery = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onend: () => void;
        start: () => void;
      };
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setError("Voice-to-Query is not supported in this browser.");
      return;
    }
    const rec = new SpeechRec();
    rec.lang = locale === "hi" ? "hi-IN" : "en-IN";
    setListening(true);
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript || "";
      setQuestion((prev) => (prev ? `${prev} ${text}` : text));
    };
    rec.onend = () => setListening(false);
    rec.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!dpdpConsent) {
      setError("Please accept the DPDP privacy consent.");
      emitSceneEvent({ type: "fail" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          category,
          urgency,
          question,
          publicQaConsent: publicConsent,
          dpdpConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit query.");
        emitSceneEvent({ type: "fail" });
      } else {
        setCreatedTicket(data.ticketId);
        emitSceneEvent({ type: "pulse" });
      }
    } catch {
      setError("Network error.");
      emitSceneEvent({ type: "fail" });
    } finally {
      setSubmitting(false);
    }
  };

  const trackTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    const res = await fetch(
      `/api/queries?ticketId=${encodeURIComponent(lookupId.trim())}`
    );
    if (res.ok) {
      setTicketData(await res.json());
    } else {
      setTicketData(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Query &amp; Ticket Desk
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          Ask a Query
        </h1>
        <p className="text-sm text-mutedText mt-2 max-w-2xl">
          Submit your GST, Income Tax, VAT, litigation, or company setup
          question. Every query receives a unique ticket ID (e.g. SC-2026-00123).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8">
          {createdTicket ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-gold mx-auto" />
              <h2 className="font-serif text-2xl text-white font-bold">
                Ticket Created: {createdTicket}
              </h2>
              <p className="text-xs text-mutedText">
                Status: <strong className="text-gold">Received</strong>.
                Confirmation sent via email &amp; WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => {
                  setLookupId(createdTicket);
                  setCreatedTicket(null);
                }}
                className="text-xs text-gold underline"
              >
                Track this ticket →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Phone Number *"
                  className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
                />
              </div>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address *"
                className="w-full rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
                >
                  {["GST", "ITR", "VAT", "Litigation", "Company Setup", "Other"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
                <select
                  value={urgency}
                  onChange={(e) =>
                    setUrgency(e.target.value as "Normal" | "Urgent")
                  }
                  className="rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
                >
                  <option value="Normal">Urgency: Normal</option>
                  <option value="Urgent">Urgency: Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-mutedText">
                    Your Question * (type or speak in English / Hindi)
                  </label>
                  <button
                    type="button"
                    onClick={startVoiceToQuery}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border ${
                      listening
                        ? "bg-red-500/20 border-red-400 text-red-300"
                        : "bg-sapphire/15 border-sapphire/40 text-gold"
                    }`}
                  >
                    {listening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" /> Listening...
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" /> Voice-to-Query
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  required
                  rows={5}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Describe your query clearly..."
                  className="w-full rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-mutedText cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicConsent}
                  onChange={(e) => setPublicConsent(e.target.checked)}
                  className="mt-0.5 accent-sapphire"
                />
                <span>
                  Optional: Allow anonymised Q&amp;A publication (personal
                  details removed) to help other taxpayers.
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-mutedText cursor-pointer">
                <input
                  type="checkbox"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="mt-0.5 accent-sapphire"
                />
                <span>
                  {t.dpdpConsent} {t.bciNotice}
                </span>
              </label>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-gold-glow"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Query & Generate Ticket"}
              </button>
            </form>
          )}
        </div>

        {/* Ticket Tracker */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-5 h-fit">
          <h2 className="font-serif text-2xl text-white font-bold">
            Track Ticket Status
          </h2>
          <form onSubmit={trackTicket} className="flex gap-2">
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="e.g. SC-2026-12345"
              className="flex-1 rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-xs text-white font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-sapphire/20 border border-sapphire/50 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Check
            </button>
          </form>

          {ticketData && (
            <div className="p-4 rounded-xl bg-obsidian/80 border border-sapphire/30 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-mutedText">Ticket ID</span>
                <span className="text-white font-mono">
                  {ticketData.ticket_id || ticketData.ticketId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Category / Urgency</span>
                <span className="text-white">
                  {ticketData.category} • {ticketData.urgency}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-mutedText mb-2">Progress</p>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  {["Received", "Under Review", "Answered", "Closed"].map(
                    (st) => (
                      <span
                        key={st}
                        className={
                          ticketData.status === st
                            ? "text-gold font-bold"
                            : "text-mutedText/50"
                        }
                      >
                        {st}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
