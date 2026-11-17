"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { formatINR } from "@/lib/utils";
import { emitSceneEvent } from "@/components/scene/StageCanvas";

const ADDONS = [
  { id: "urgent", label: "Urgent Priority Processing", price: 750 },
  { id: "followup", label: "Include 1 Follow-up Call (15 min)", price: 500 },
];

export default function CartDrawer() {
  const { cart, removeFromCart, clearCart, cartOpen, setCartOpen, t } =
    useApp();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  if (!cartOpen) return null;

  const itemsTotal = cart.reduce((s, i) => s + i.priceInr * i.quantity, 0);
  const addonsTotal = ADDONS.filter((a) => selectedAddons.includes(a.id)).reduce(
    (s, a) => s + a.price,
    0
  );
  const subtotal = Math.max(0, itemsTotal + addonsTotal - discount);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "WELCOME10") {
      setDiscount(Math.round(itemsTotal * 0.1));
    } else {
      setDiscount(0);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Please accept the DPDP privacy consent.");
      emitSceneEvent({ type: "fail" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          items: cart,
          addons: selectedAddons,
          couponCode: coupon || undefined,
          dpdpConsent: consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        emitSceneEvent({ type: "fail" });
      } else {
        setOrderResult({
          orderNumber: data.orderNumber,
          total: data.totalInr,
        });
        emitSceneEvent({ type: "pulse" });
        clearCart();
      }
    } catch {
      setError("Network error during checkout.");
      emitSceneEvent({ type: "fail" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Service cart"
    >
      <div className="w-full max-w-md bg-charcoal border-l border-sapphire/30 h-full overflow-y-auto p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-serif text-xl text-white">Service Cart</h2>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              className="p-2 rounded-lg text-mutedText hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {orderResult ? (
            <div className="mt-6 glass-card p-5 rounded-xl space-y-3 border-gold/50">
              <p className="text-gold text-xs uppercase tracking-widest font-semibold">
                Order Created
              </p>
              <h3 className="font-serif text-2xl text-white">
                {orderResult.orderNumber}
              </h3>
              <p className="text-sm text-mutedText">
                Total payable (incl. 18% GST):{" "}
                <strong className="text-white">
                  {formatINR(orderResult.total)}
                </strong>
                . A confirmation &amp; engagement record has been initiated.
              </p>
              <Link
                href="/portal"
                onClick={() => setCartOpen(false)}
                className="inline-flex items-center gap-2 text-sm text-gold hover:underline"
              >
                Open Client Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-mutedText text-sm">
                Your service cart is empty.
              </p>
              <Link
                href="/services"
                onClick={() => setCartOpen(false)}
                className="inline-block text-xs text-gold hover:underline"
              >
                Browse Services Store →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="mt-5 space-y-5">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-obsidian/70 border border-white/10"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">
                        {item.title}
                      </p>
                      <p className="text-xs text-mutedText">
                        SAC {item.sacCode} • Qty {item.quantity} •{" "}
                        {formatINR(item.priceInr)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.slug)}
                      aria-label={`Remove ${item.title}`}
                      className="text-mutedText hover:text-red-400 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-mutedText">
                  Optional Add-ons
                </p>
                {ADDONS.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian/50 border border-white/10 cursor-pointer text-xs text-white"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(a.id)}
                        onChange={() => toggleAddon(a.id)}
                        className="accent-sapphire"
                      />
                      {a.label}
                    </span>
                    <span className="text-gold">+{formatINR(a.price)}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 rounded-lg bg-obsidian border border-white/15 px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-3 py-2 rounded-lg bg-sapphire/20 border border-sapphire/40 text-xs text-white hover:bg-sapphire/30"
                >
                  Apply
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-obsidian/80 border border-sapphire/20 space-y-1.5 text-xs">
                <div className="flex justify-between text-mutedText">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-mutedText">
                  <span>GST (18%)</span>
                  <span>{formatINR(gst)}</span>
                </div>
                <div className="flex justify-between text-white font-semibold text-sm pt-1.5 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="text-gold">{formatINR(total)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-lg bg-obsidian border border-white/15 px-3 py-2 text-xs text-white"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-lg bg-obsidian border border-white/15 px-3 py-2 text-xs text-white"
                />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full rounded-lg bg-obsidian border border-white/15 px-3 py-2 text-xs text-white"
                />
                <label className="flex items-start gap-2 text-[11px] text-mutedText cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 accent-sapphire"
                  />
                  <span>
                    {t.dpdpConsent}{" "}
                    <Link href="/refund-policy" className="text-gold underline">
                      Refund Policy
                    </Link>
                  </span>
                </label>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gold-gradient text-obsidian text-sm font-semibold shadow-gold-glow hover:shadow-sapphire-glow transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : `Proceed to Pay ${formatINR(total)}`}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-mutedText">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                Razorpay Secured • GST Tax Invoice Auto-Generated
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
