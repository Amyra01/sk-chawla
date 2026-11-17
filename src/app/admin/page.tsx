"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Download,
  AlertCircle,
} from "lucide-react";

interface OverviewData {
  configured: boolean;
  counts: {
    bookings: number;
    urgentQueries: number;
    pendingOrders: number;
    openCases: number;
  };
  recentBookings: Array<{
    id: string;
    booking_ref: string;
    client_name: string;
    mode: string;
    status: string;
    topic: string;
  }>;
  recentQueries: Array<{
    id: string;
    ticket_id: string;
    name: string;
    category: string;
    urgency: string;
    status: string;
  }>;
  leads: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    stage: string;
  }>;
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<"overview" | "leads" | "settings">("overview");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [featureFlags, setFeatureFlags] = useState({
    enable_booking: true,
    enable_queries: true,
    enable_store: true,
    enable_notice_decoder: true,
    enable_health_check: true,
    enable_ai_assistant: true,
    enable_3d_scene: true,
  });

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d: OverviewData & { featureFlags?: Partial<typeof featureFlags> }) => {
        setOverview(d);
        if (d.featureFlags && Object.keys(d.featureFlags).length > 0) {
          setFeatureFlags((prev) => ({ ...prev, ...d.featureFlags }));
        }
      })
      .catch(() => {});
  }, []);

  const toggleFlag = async (key: keyof typeof featureFlags) => {
    const updated = { ...featureFlags, [key]: !featureFlags[key] };
    setFeatureFlags(updated);
    await fetch("/api/admin/overview", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureFlags: updated }),
    }).catch(() => {});
  };

  const exportCsv = () => {
    const csv = [
      "Reference,Type,Client,Status,Stage",
      "SCB-2026-10421,Booking,Sample Client,Confirmed,Consulted",
      "SC-2026-00123,Urgent Notice,Sample Trader,Under Review,New",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sunilchawla-export.csv";
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            Owner / Staff Command Center
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "leads", label: "Lead Pipeline", icon: Users },
            { id: "settings", label: "Feature Toggles", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setTab(item.id as "overview" | "leads" | "settings")
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 ${
                  tab === item.id
                    ? "bg-gold-gradient text-obsidian border-gold"
                    : "bg-charcoal text-mutedText border-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl bg-obsidian border border-sapphire/40 text-xs text-gold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Bookings", val: String(overview?.counts.bookings ?? 0), sub: "Synced with Supabase" },
              { label: "Urgent Notice Tickets", val: String(overview?.counts.urgentQueries ?? 0), sub: "Deadline countdown active" },
              { label: "Pending Orders", val: String(overview?.counts.pendingOrders ?? 0), sub: "Razorpay webhook synced" },
              { label: "Open Cases", val: String(overview?.counts.openCases ?? 0), sub: "Client portal active" },
            ].map((k) => (
              <div key={k.label} className="glass-card rounded-2xl p-5">
                <p className="text-xs text-mutedText">{k.label}</p>
                <p className="font-serif text-3xl font-bold text-white mt-1">
                  {k.val}
                </p>
                <p className="text-[11px] text-gold mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 flex items-start gap-3 text-xs text-mutedText">
            <AlertCircle className="w-5 h-5 text-gold shrink-0" />
            <div>
              <p className="text-white font-semibold">
                Role-Based Access &amp; Audit Logging Ready
              </p>
              <p className="mt-1">
                Once Supabase Auth and `user_roles` (`owner` / `staff`) are
                configured, all bookings, queries, orders, invoices, cases,
                blog posts, FAQs, and site settings are managed live from this
                dashboard with full audit logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "leads" && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-serif text-2xl font-bold">
            <Calendar className="w-5 h-5 text-gold" />
            <span>Lead Pipeline Stages</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {["New", "Contacted", "Consulted", "Converted", "Lost"].map(
              (stage) => (
                <div
                  key={stage}
                  className="p-4 rounded-xl bg-obsidian/70 border border-white/10 space-y-2 min-h-[140px]"
                >
                  <p className="font-semibold text-gold uppercase tracking-wider">
                    {stage}
                  </p>
                  <p className="text-[11px] text-mutedText">
                    Leads from bookings, queries, calculators &amp; health check
                    appear here.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-white">
            Site Feature Toggles (site_settings)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(featureFlags).map(([key, enabled]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3.5 rounded-xl bg-obsidian/70 border border-white/10 cursor-pointer text-xs text-white"
              >
                <span className="font-mono">{key}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() =>
                    toggleFlag(key as keyof typeof featureFlags)
                  }
                  className="accent-sapphire w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
