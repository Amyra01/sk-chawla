import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { sendEmail, sendWhatsAppTemplate } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ processed: 0, note: "Supabase not configured" });
  }

  const admin = createAdminSupabaseClient();
  const now = Date.now();
  const in24h = new Date(now + 24 * 3600 * 1000).toISOString();
  const in1h = new Date(now + 1 * 3600 * 1000).toISOString();

  let sentCount = 0;

  const { data: due24 } = await admin
    .from("bookings")
    .select("id, booking_ref, client_name, client_email, client_phone, slot_start, meet_link")
    .eq("status", "confirmed")
    .eq("reminder_24h_sent", false)
    .lte("slot_start", in24h)
    .gt("slot_start", in1h);

  for (const b of due24 ?? []) {
    await sendEmail({
      to: b.client_email,
      subject: `Reminder (24h): Consultation ${b.booking_ref}`,
      html: `<p>Dear ${b.client_name}, reminder for your consultation tomorrow (${b.booking_ref}). ${b.meet_link ? `Meet: ${b.meet_link}` : ""}</p>`,
    });
    await sendWhatsAppTemplate({
      toPhone: b.client_phone,
      message: `Reminder: Your consultation (${b.booking_ref}) with Mr. Sunil Chawla is within 24 hours.`,
    });
    await admin
      .from("bookings")
      .update({ reminder_24h_sent: true })
      .eq("id", b.id);
    sentCount++;
  }

  return NextResponse.json({ processed: sentCount });
}
