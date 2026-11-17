import { ShieldCheck, Lock, Scale, FileCheck } from "lucide-react";

export default function TrustCentrePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          Credentials &amp; Governance
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2">
          Trust Centre
        </h1>
        <p className="text-sm text-mutedText mt-2 max-w-2xl">
          Calm, factual overview of Mr. Sunil Chawla&apos;s credentials,
          confidentiality standards, and how client data is protected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <Scale className="w-6 h-6 text-gold" />
          <h2 className="font-serif text-2xl font-bold text-white">
            Academic &amp; Bar Credentials
          </h2>
          <ul className="text-xs text-mutedText space-y-2 leading-relaxed">
            <li>• Graduation (Correspondence): 1998 – 2000</li>
            <li>• B.A. LL.B. (Honours): 2001 – 2003, DAVV Indore</li>
            <li>• Practice Commenced: 2004 (22+ years experience)</li>
            <li>• Firm: Sunil Chawla &amp; Associates, Ludhiana, Punjab</li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <Lock className="w-6 h-6 text-gold" />
          <h2 className="font-serif text-2xl font-bold text-white">
            Encryption &amp; DPDP Act 2023
          </h2>
          <ul className="text-xs text-mutedText space-y-2 leading-relaxed">
            <li>
              • PAN, GSTIN, and sensitive identifiers are encrypted at rest
              using AES-256-GCM.
            </li>
            <li>
              • Documents are stored in private buckets with Row Level Security
              (RLS) and short-lived signed URLs.
            </li>
            <li>
              • Explicit consent checkboxes, data export, and deletion requests
              are supported under India&apos;s DPDP Act 2023.
            </li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-2xl font-bold text-white">
              How an Engagement Works Step by Step
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 text-xs text-mutedText">
            <div className="p-3.5 rounded-xl bg-obsidian/70 border border-white/10">
              <strong className="text-white block mb-1">1. Initial Review</strong>
              Booking or query submission is informational and does not create an
              advocate-client relationship.
            </div>
            <div className="p-3.5 rounded-xl bg-obsidian/70 border border-white/10">
              <strong className="text-white block mb-1">2. Scope &amp; Consent</strong>
              Scope, fee, and engagement letter / authorisation are confirmed in
              writing.
            </div>
            <div className="p-3.5 rounded-xl bg-obsidian/70 border border-white/10">
              <strong className="text-white block mb-1">3. Secure Vault</strong>
              Documents are exchanged inside your encrypted Client Portal with
              checklists.
            </div>
            <div className="p-3.5 rounded-xl bg-obsidian/70 border border-white/10">
              <strong className="text-white block mb-1">4. Execution &amp; Log</strong>
              Every filing, reply, and hearing update is recorded on your case
              timeline.
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-charcoal border border-sapphire/25 flex items-center gap-3 text-xs text-mutedText">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
        <span>
          In accordance with Bar Council of India rules, all content on this
          website is strictly informational and does not constitute solicitation
          or advertisement.
        </span>
      </div>
    </div>
  );
}
