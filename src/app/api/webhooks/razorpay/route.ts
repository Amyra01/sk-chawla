import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { generateRef } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (secret && !secret.includes("your-razorpay")) {
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id: string;
            order_id?: string;
            amount: number;
            status: string;
          };
        };
      };
    };

    const payment = event.payload?.payment?.entity;
    if (!payment || !isSupabaseAdminConfigured()) {
      return NextResponse.json({ received: true });
    }

    const admin = createAdminSupabaseClient();

    // Idempotent check
    const { data: existing } = await admin
      .from("payments")
      .select("id")
      .eq("razorpay_payment_id", payment.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const status =
      event.event === "payment.captured"
        ? "captured"
        : event.event === "payment.failed"
          ? "failed"
          : event.event === "refund.created"
            ? "refunded"
            : "authorized";

    const { data: order } = payment.order_id
      ? await admin
          .from("orders")
          .select("id, user_id, customer_name")
          .eq("razorpay_order_id", payment.order_id)
          .maybeSingle()
      : { data: null };

    await admin.from("payments").insert({
      order_id: order?.id ?? null,
      razorpay_order_id: payment.order_id ?? null,
      razorpay_payment_id: payment.id,
      amount_inr: payment.amount / 100,
      status,
      webhook_payload: event,
    });

    if (order && status === "captured") {
      await admin
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id);

      // Auto-create Case/Engagement if user_id exists
      if (order.user_id) {
        await admin.from("cases").insert({
          case_number: generateRef("CASE"),
          user_id: order.user_id,
          order_id: order.id,
          title: `Service Engagement — ${order.customer_name}`,
          category: "Tax & Compliance",
          stage: "Documents Requested",
        });
      }
    } else if (order && status === "failed") {
      await admin
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id);
    } else if (order && status === "refunded") {
      await admin
        .from("orders")
        .update({ status: "refunded" })
        .eq("id", order.id);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
