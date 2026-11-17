"use client";

import { useState } from "react";
import {
  Lock,
  FolderLock,
  Calendar,
  Building,
  MessageSquare,
  CheckCircle2,
  Video,
  Share2,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ClientPortalPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"overview" | "gstins" | "vault" | "messages">(
    "overview"
  );
  const [activeEntity, setActiveEntity] = useState("Main Branch (23XXXXX1234A1Z5)");
  const [statusMsg, setStatusMsg] = useState("");

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setStatusMsg(
        "Supabase Auth is not configured yet — opening preview workspace."
      );
      setAuthenticated(true);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatusMsg(error.message);
    } else {
      setOtpSent(true);
      setStatusMsg("Magic link / OTP sent to your email.");
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="glass-card rounded-2xl p-8 space-y-6 border-sapphire/40">
          <div className="w-12 h-12 rounded-xl bg-sapphire/15 border border-sapphire/40 flex items-center justify-center text-gold">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">
              Client Portal
            </h1>
            <p className="text-xs text-mutedText mt-1">
              Sign in with passwordless Email OTP to access your cases,
              encrypted document vault, GST invoices and meeting room.
            </p>
          </div>

          <form onSubmit={handleOtpLogin} className="space-y-4">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter registered email"
              className="w-full rounded-xl bg-obsidian border border-white/15 px-4 py-3 text-sm text-white"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold shadow-gold-glow"
            >
              {otpSent ? "Resend Login Link" : "Send Passwordless OTP / Link"}
            </button>
          </form>

          {statusMsg && <p className="text-xs text-gold">{statusMsg}</p>}

          <div className="pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => setAuthenticated(true)}
              className="text-xs text-mutedText hover:text-white underline"
            >
              Preview Portal Interface (Local Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Encrypted Client Workspace
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
            Welcome to Your Portal
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Cases & Meeting Room", icon: Calendar },
            { id: "gstins", label: "Multi-GSTIN Grid", icon: Building },
            { id: "vault", label: "Document Vault", icon: FolderLock },
            { id: "messages", label: "Messages & Referral", icon: MessageSquare },
          ].map((tItem) => {
            const Icon = tItem.icon;
            return (
              <button
                key={tItem.id}
                type="button"
                onClick={() =>
                  setTab(
                    tItem.id as "overview" | "gstins" | "vault" | "messages"
                  )
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 ${
                  tab === tItem.id
                    ? "bg-gold-gradient text-obsidian border-gold"
                    : "bg-charcoal text-mutedText border-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tItem.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-serif text-2xl font-bold text-white">
              Active Engagement Progress
            </h2>
            <div className="p-4 rounded-xl bg-obsidian/70 border border-white/10 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-gold">CASE-2026-00412</span>
                <span className="text-emerald-400 font-semibold">In Progress</span>
              </div>
              <p className="text-sm font-semibold text-white">
                DRC-01 Reply &amp; GSTR-2B Reconciliation
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-2 text-[10px] text-center">
                {[
                  "Initiated",
                  "Docs Requested",
                  "In Progress",
                  "Filed / Replied",
                  "Hearing",
                  "Completed",
                ].map((stage, i) => (
                  <div
                    key={stage}
                    className={`py-1.5 px-1 rounded border ${
                      i <= 2
                        ? "bg-sapphire/20 border-gold/50 text-white"
                        : "bg-obsidian/40 border-white/10 text-mutedText"
                    }`}
                  >
                    {stage}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secure Client Meeting Room */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 space-y-4 border-gold/30">
            <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wider font-semibold">
              <Video className="w-4 h-4" /> Secure Client Meeting Room
            </div>
            <h3 className="font-serif text-xl font-bold text-white">
              Pre-Meeting Ready Checklist
            </h3>
            <ul className="space-y-2 text-xs text-mutedText">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Agenda:
                Review Notice &amp; GSTR-2B Mismatch
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Keep
                supporting invoices &amp; e-way bills handy
              </li>
            </ul>
            <a
              href="https://meet.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-xl bg-gold-gradient text-obsidian text-xs font-semibold"
            >
              Join Google Meet Session
            </a>
          </div>
        </div>
      )}

      {tab === "gstins" && (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold text-white">
              Multi-GSTIN Group Filing Grid
            </h2>
            <select
              value={activeEntity}
              onChange={(e) => setActiveEntity(e.target.value)}
              className="rounded-xl bg-obsidian border border-white/15 px-3 py-2 text-xs text-white font-mono"
            >
              <option>Main Branch (23XXXXX1234A1Z5)</option>
              <option>Warehouse Unit (27XXXXX1234A1Z2)</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-mutedText">
                  <th className="py-2.5">Period</th>
                  <th className="py-2.5">GSTR-1</th>
                  <th className="py-2.5">GSTR-3B</th>
                  <th className="py-2.5">GSTR-9</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { p: "Oct 2026", r1: "Filed", r3: "Filed", r9: "N/A" },
                  { p: "Nov 2026", r1: "Filed", r3: "Pending", r9: "N/A" },
                  { p: "FY 2025-26", r1: "Filed", r3: "Filed", r9: "In Review" },
                ].map((row) => (
                  <tr key={row.p}>
                    <td className="py-3 text-white font-medium">{row.p}</td>
                    <td className="py-3 text-emerald-400">{row.r1}</td>
                    <td
                      className={`py-3 ${
                        row.r3 === "Filed"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {row.r3}
                    </td>
                    <td className="py-3 text-gold">{row.r9}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "vault" && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-white">
            Encrypted Document Vault
          </h2>
          <p className="text-xs text-mutedText">
            Files are stored in private Supabase Storage with Row Level Security
            and served via expiring signed URLs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {[
              { name: "GST Registration & Returns", status: "Verified" },
              { name: "Show Cause Notices & Replies", status: "Received" },
              { name: "Signed Vakalatnama / Authorisation", status: "Pending" },
            ].map((doc) => (
              <div
                key={doc.name}
                className="p-4 rounded-xl bg-obsidian/70 border border-white/10 space-y-2"
              >
                <p className="text-white font-medium">{doc.name}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                    doc.status === "Verified"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : doc.status === "Received"
                        ? "bg-sapphire/20 text-gold"
                        : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">
              Client–Advisor Secure Thread
            </h2>
            <p className="text-xs text-mutedText">
              Direct threaded messages with read receipts and file attachments
              are synced when Supabase Auth is active.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-gold text-xs font-semibold">
              <Share2 className="w-4 h-4" /> Client Referral Program
            </div>
            <p className="text-xs text-mutedText">
              Share your unique referral code for an admin-configurable fee
              credit on completed engagements.
            </p>
            <div className="p-3 rounded-xl bg-obsidian border border-white/10 font-mono text-xs text-white">
              REF-SC-2026-CLIENT
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
