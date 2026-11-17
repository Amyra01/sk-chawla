import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { generateRef, sanitizeText } from "@/lib/utils";
import { checkRateLimit } from "@/lib/security";
import { buildGstInvoiceHtml, sendEmail } from "@/lib/notifications";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

const CheckoutSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8).max(20),
  items: z
    .array(
      z.object({
        serviceId: z.string(),
        slug: z.string(),
        title: z.string(),
        priceInr: z.number().nonnegative(),
        sacCode: z.string().default("998213"),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1),
  addons: z.array(z.string()).default([]),
  couponCode: z.string().optional(),
  dpdpConsent: z.literal(true),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = await checkRateLimit(`checkout:${ip}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout data.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const itemsSubtotal = d.items.reduce(
      (s, i) => s + i.priceInr * i.quantity,
      0
    );
    const addonCost =
      (d.addons.includes("urgent") ? 750 : 0) +
      (d.addons.includes("followup") ? 500 : 0);

    let discount = 0;
    if (d.couponCode?.trim().toUpperCase() === "WELCOME10") {
      discount = Math.round(itemsSubtotal * 0.1);
    }

    const subtotal = Math.max(0, itemsSubtotal + addonCost - discount);
    const gstAmount = Math.round(subtotal * 0.18);
    const totalInr = subtotal + gstAmount;

    const orderNumber = generateRef("SCO");
    const invoiceNumber = generateRef("INV");
    let razorpayOrderId: string | null = null;

    const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    if (rzpKey && rzpSecret && !rzpKey.includes("xxxx")) {
      const rzp = new Razorpay({ key_id: rzpKey, key_secret: rzpSecret });
      const rzpOrder = await rzp.orders.create({
        amount: Math.round(totalInr * 100),
        currency: "INR",
        receipt: orderNumber,
      });
      razorpayOrderId = rzpOrder.id;
    }

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      const { data: orderRow } = await admin
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: sanitizeText(d.customerName),
          customer_email: d.customerEmail,
          customer_phone: sanitizeText(d.customerPhone),
          subtotal_inr: subtotal,
          discount_inr: discount,
          gst_inr: gstAmount,
          total_inr: totalInr,
          coupon_code: d.couponCode || null,
          addons: d.addons,
          status: "pending",
          razorpay_order_id: razorpayOrderId,
          dpdp_consent: true,
        })
        .select("id")
        .single();

      if (orderRow) {
        await admin.from("order_items").insert(
          d.items.map((i) => ({
            order_id: orderRow.id,
            title: i.title,
            sac_code: i.sacCode,
            quantity: i.quantity,
            unit_price_inr: i.priceInr,
            total_price_inr: i.priceInr * i.quantity,
          }))
        );

        await admin.from("invoices").insert({
          invoice_number: invoiceNumber,
          order_id: orderRow.id,
          subtotal_inr: subtotal,
          cgst_inr: gstAmount / 2,
          sgst_inr: gstAmount / 2,
          total_inr: totalInr,
        });
      }
    }

    const invoiceHtml = buildGstInvoiceHtml({
      invoiceNumber,
      issuedAt: new Date().toLocaleDateString("en-IN"),
      customerName: sanitizeText(d.customerName),
      customerEmail: d.customerEmail,
      items: d.items.map((i) => ({
        title: i.title,
        sac: i.sacCode,
        amount: i.priceInr * i.quantity,
      })),
      subtotal,
      gstAmount,
      total: totalInr,
    });

    await sendEmail({
      to: d.customerEmail,
      subject: `Service Order & Proforma GST Invoice — ${orderNumber}`,
      html: invoiceHtml,
    });

    return NextResponse.json({
      orderNumber,
      invoiceNumber,
      razorpayOrderId,
      razorpayKeyId: rzpKey && !rzpKey.includes("xxxx") ? rzpKey : null,
      subtotalInr: subtotal,
      gstInr: gstAmount,
      totalInr,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create service order." },
      { status: 500 }
    );
  }
}
