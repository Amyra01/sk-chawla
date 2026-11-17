import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeText } from "@/lib/utils";
import { sendOfficeNotification } from "@/lib/notifications";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

const CallbackSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  topic: z.string().optional(),
  dpdpConsent: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CallbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Office hours: 8:30 AM – 10:30 PM IST
    const istParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const istHour = Number(istParts.find((p) => p.type === "hour")?.value ?? 0);
    const istMinute = Number(
      istParts.find((p) => p.type === "minute")?.value ?? 0
    );
    const istMinutes = istHour * 60 + istMinute;
    const withinBusinessHours =
      istMinutes >= 8 * 60 + 30 && istMinutes < 22 * 60 + 30;

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      await admin.from("callback_requests").insert({
        name: sanitizeText(parsed.data.name),
        phone: sanitizeText(parsed.data.phone),
        topic: parsed.data.topic || null,
        within_business_hours: withinBusinessHours,
        dpdp_consent: true,
      });

      await admin.from("leads").insert({
        name: sanitizeText(parsed.data.name),
        phone: sanitizeText(parsed.data.phone),
        source: "callback",
        stage: "New",
        dpdp_consent: true,
      });
    }

    await sendOfficeNotification({
      subject: `10-Minute Callback Request — ${sanitizeText(parsed.data.name)}`,
      html: `<p><strong>Name:</strong> ${sanitizeText(parsed.data.name)}</p><p><strong>Phone:</strong> ${sanitizeText(parsed.data.phone)}</p><p><strong>Within Business Hours:</strong> ${withinBusinessHours ? "Yes" : "No"}</p>`,
    });

    return NextResponse.json({ ok: true, withinBusinessHours });
  } catch {
    return NextResponse.json(
      { error: "Unable to save callback request" },
      { status: 500 }
    );
  }
}
