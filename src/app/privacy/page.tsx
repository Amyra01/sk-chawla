export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
        Privacy Policy (DPDP Act 2023)
      </h1>
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 text-sm text-mutedText leading-relaxed">
        <p>
          This Privacy Policy explains how the practice of Mr. Sunil Chawla
          collects, encrypts, stores, and processes personal data in compliance
          with India&apos;s Digital Personal Data Protection (DPDP) Act, 2023.
        </p>
        <h2 className="font-serif text-xl text-white font-bold pt-2">
          1. Data Collected &amp; Purpose
        </h2>
        <p>
          We collect contact details, tax identifiers (PAN/GSTIN), and uploaded
          notices or financial records solely to provide requested
          consultations, compliance services, and client portal access.
        </p>
        <h2 className="font-serif text-xl text-white font-bold pt-2">
          2. Security &amp; Retention
        </h2>
        <p>
          Sensitive fields are encrypted at rest and files are served via
          expiring signed URLs with Row Level Security. You may request data
          export or deletion at any time by writing to{" "}
          <span className="text-white font-mono">sunilkumarchawla@gmail.com</span>.
        </p>
      </div>
    </div>
  );
}
