"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, AlertTriangle, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { emitSceneEvent } from "@/components/scene/StageCanvas";

interface DecodedNotice {
  noticeType: string;
  section: string;
  dateIssued: string;
  replyDeadline: string;
  authority: string;
  whatThisMeans: string;
  whatHappensNext: string;
  documentsLikelyNeeded: string[];
  urgentTicketId?: string | null;
  disclaimer: string;
}

export default function NoticeDecoderPage() {
  const { t } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [noticeText, setNoticeText] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [createTicket, setCreateTicket] = useState(true);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DecodedNotice | null>(null);

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Please accept the DPDP privacy & confidentiality consent.");
      emitSceneEvent({ type: "fail" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.append("file", file);
      fd.append("noticeText", noticeText);
      fd.append("email", email);
      fd.append("phone", phone);
      fd.append("createTicket", String(createTicket));
      fd.append("dpdpConsent", String(consent));

      const res = await fetch("/api/notice-decoder", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to decode notice.");
        emitSceneEvent({ type: "fail" });
      } else {
        setResult(data);
        emitSceneEvent({ type: "pulse" });
      }
    } catch {
      setError("Network error while analysing notice.");
      emitSceneEvent({ type: "fail" });
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = result
    ? Math.max(
        0,
        Math.ceil(
          (new Date(result.replyDeadline).getTime() - Date.now()) / 86400000
        )
      )
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Notice Review Desk • AI OCR
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          GST &amp; Income Tax Notice Decoder
        </h1>
        <p className="text-sm text-mutedText mt-2 max-w-2xl">
          Upload your GST or Income Tax notice (PDF/Image) or paste its text to
          extract key dates, sections, and a plain-English overview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form
          onSubmit={handleDecode}
          className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-4"
        >
          <label className="block border-2 border-dashed border-sapphire/40 rounded-2xl p-6 text-center cursor-pointer hover:border-gold transition-colors">
            <Upload className="w-7 h-7 text-gold mx-auto mb-2" />
            <p className="text-sm text-white font-medium">
              {file ? file.name : "Upload Notice (PDF, JPG, PNG — max 8 MB)"}
            </p>
            <p className="text-xs text-mutedText mt-1">
              {t.confidentialityNotice}
            </p>
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          <textarea
            rows={4}
            value={noticeText}
            onChange={(e) => setNoticeText(e.target.value)}
            placeholder="Or paste key text from your notice (e.g. DRC-01, ASMT-10, Section 148A)..."
            className="w-full rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-xs text-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (for Urgent Ticket)"
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-xs text-white"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2.5 text-xs text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input
              type="checkbox"
              checked={createTicket}
              onChange={(e) => setCreateTicket(e.target.checked)}
              className="accent-sapphire"
            />
            <span>Create an Urgent Notice ticket on consent</span>
          </label>

          <label className="flex items-start gap-2 text-[11px] text-mutedText cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-sapphire"
            />
            <span>{t.dpdpConsent}</span>
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold shadow-gold-glow"
          >
            {loading ? "Analysing Notice..." : "Decode Notice"}
          </button>
        </form>

        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="glass-card rounded-2xl p-6 space-y-5 border-gold/40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                  {result.disclaimer}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gold">
                  <Clock className="w-3.5 h-3.5" /> {daysRemaining} days left
                </span>
              </div>

              <div>
                <h2 className="font-serif text-2xl text-white font-bold">
                  {result.noticeType}
                </h2>
                <p className="text-xs text-mutedText mt-1">
                  Section: <strong className="text-white">{result.section}</strong> •
                  Authority: <strong className="text-white">{result.authority}</strong>
                </p>
                <p className="text-xs font-mono text-gold mt-1">
                  Issued: {result.dateIssued} • Reply Deadline: {result.replyDeadline}
                </p>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3.5 rounded-xl bg-obsidian/70 border border-white/10">
                  <p className="text-gold font-semibold mb-1">
                    What this notice means
                  </p>
                  <p className="text-white/90">{result.whatThisMeans}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-obsidian/70 border border-white/10">
                  <p className="text-gold font-semibold mb-1">
                    What usually happens next
                  </p>
                  <p className="text-mutedText">{result.whatHappensNext}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-obsidian/70 border border-white/10">
                  <p className="text-gold font-semibold mb-1">
                    Documents you&apos;ll likely need
                  </p>
                  <ul className="list-disc pl-4 text-mutedText space-y-1">
                    {result.documentsLikelyNeeded.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.urgentTicketId && (
                <div className="p-3 rounded-xl bg-sapphire/15 border border-sapphire/40 text-xs text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  Urgent Ticket Created:{" "}
                  <strong className="font-mono">{result.urgentTicketId}</strong>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/book"
                  className="px-4 py-2.5 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  Book a Notice Strategy Session <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/services/notice-reply-drafting"
                  className="px-4 py-2.5 rounded-xl bg-obsidian border border-sapphire/40 text-white text-xs font-semibold"
                >
                  Notice Reply Drafting Service
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-sapphire mx-auto" />
              <h2 className="font-serif text-xl text-white font-bold">
                Structured Notice Summary Appears Here
              </h2>
              <p className="text-xs text-mutedText max-w-sm mx-auto">
                Upload a notice on the left to view extracted deadlines,
                applicable section overview, and required documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
