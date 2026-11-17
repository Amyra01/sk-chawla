import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

const ReminderSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  complianceDateId: z.string().optional(),
  newsletter: z.boolean().optional(),
  dpdpConsent: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReminderSchema.safeParse(body);
    if (!parsed.success || (!parsed.data.email && !parsed.data.phone)) {
      return NextResponse.json(
        { error: "Provide an email or phone number and accept consent." },
        { status: 400 }
      );
    }

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      if (parsed.data.newsletter && parsed.data.email) {
        await admin.from("newsletter_subscribers").upsert(
          {
            email: parsed.data.email,
            list_type: "gst_updates",
            dpdp_consent: true,
          },
          { onConflict: "email" }
        );
      } else {
        await admin.from("reminder_subscriptions").insert({
          email: parsed.data.email || null,
          phone: parsed.data.phone || null,
          channel: parsed.data.phone && parsed.data.email ? "both" : parsed.data.phone ? "whatsapp" : "email",
          dpdp_consent: true,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to subscribe." },
      { status: 500 }
    );
  }
}
