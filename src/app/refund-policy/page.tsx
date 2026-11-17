export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
        Refund &amp; Cancellation Policy
      </h1>
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 text-sm text-mutedText leading-relaxed">
        <p>
          Consultation bookings may be rescheduled or cancelled up to 12 hours
          before the scheduled IST slot using your booking management link.
        </p>
        <p>
          For service engagements, if work has not yet commenced (prior to
          document verification or portal filing), a full or partial refund may
          be requested via{" "}
          <span className="text-white font-mono">sunilkumarchawla@gmail.com</span>.
          Approved refunds are processed to the original payment method within
          5–7 working days via Razorpay.
        </p>
      </div>
    </div>
  );
}
