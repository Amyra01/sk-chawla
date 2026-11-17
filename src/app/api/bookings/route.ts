import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRef, isValidGSTIN, sanitizeText } from "@/lib/utils";
import { encryptSensitiveField } from "@/lib/crypto";
import { checkRateLimit, logAuditEvent } from "@/lib/security";
import { createGoogleMeetEvent } from "@/lib/google-calendar";
import {
  generateICS,
  sendEmail,
  sendOfficeNotification,
  sendWhatsAppTemplate,
} from "@/lib/notifications";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";
import { FALLBACK_CONSULTATION_TYPES } from "@/lib/seed-fallback";

const BookingSchema = z.object({
  consultationSlug: z.string().min(1),
  mode: z.enum(["google_meet", "phone", "in_office"]),
  slotStartIso: z.string().datetime(),
  clientName: z.string().min(2).max(120),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(8).max(20),
  gstin: z.string().optional(),
  topic: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  dpdpConsent: z.literal(true),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = await checkRateLimit(`booking:${ip}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking details.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (data.gstin && data.gstin.trim() !== "" && !isValidGSTIN(data.gstin)) {
      return NextResponse.json(
        { error: "Invalid GSTIN format. Expected 15-character GSTIN." },
        { status: 400 }
      );
    }

    const consultType =
      FALLBACK_CONSULTATION_TYPES.find(
        (c) => c.slug === data.consultationSlug
      ) || FALLBACK_CONSULTATION_TYPES[1];

    const slotStart = new Date(data.slotStartIso);
    const slotEnd = new Date(
      slotStart.getTime() + consultType.durationMinutes * 60 * 1000
    );
    const bookingRef = generateRef("SCB");

    const meetInfo = await createGoogleMeetEvent({
      summary: `${consultType.title} — ${sanitizeText(data.clientName)}`,
      description: `Topic: ${sanitizeText(data.topic)}\nMode: ${data.mode}`,
      startIso: slotStart.toISOString(),
      endIso: slotEnd.toISOString(),
      attendeeEmail: data.clientEmail,
      includeMeet: data.mode === "google_meet",
    });

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      const sessionToken = `hold_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      // Create 10-minute slot hold
      await admin.from("slot_holds").insert({
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd.toISOString(),
        session_token: sessionToken,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

      const { data: dbConsult } = await admin
        .from("consultation_types")
        .select("id")
        .eq("slug", consultType.slug)
        .maybeSingle();

      if (dbConsult) {
        await admin.from("bookings").insert({
          booking_ref: bookingRef,
          consultation_type_id: dbConsult.id,
          mode: data.mode,
          slot_start: slotStart.toISOString(),
          slot_end: slotEnd.toISOString(),
          client_name: sanitizeText(data.clientName),
          client_email: data.clientEmail,
          client_phone: sanitizeText(data.clientPhone),
          gstin_encrypted: data.gstin
            ? encryptSensitiveField(data.gstin.toUpperCase())
            : null,
          topic: sanitizeText(data.topic),
          description: data.description ? sanitizeText(data.description) : null,
          google_event_id: meetInfo.eventId ?? null,
          meet_link: meetInfo.meetLink ?? null,
          status: consultType.isPaid ? "pending_payment" : "confirmed",
          payment_status: consultType.isPaid ? "unpaid" : "free",
          amount_inr: consultType.priceInr,
          dpdp_consent: true,
        });
      }

      await admin.from("leads").insert({
        name: sanitizeText(data.clientName),
        email: data.clientEmail,
        phone: sanitizeText(data.clientPhone),
        source: "booking",
        stage: "Consulted",
        dpdp_consent: true,
        metadata: { bookingRef, consultation: consultType.title },
      });
    }

    const ics = generateICS({
      uid: bookingRef,
      title: `Consultation with Mr. Sunil Chawla (${consultType.title})`,
      description: `Ref: ${bookingRef}\nTopic: ${data.topic}`,
      startIso: slotStart.toISOString(),
      endIso: slotEnd.toISOString(),
      location:
        meetInfo.meetLink ||
        (data.mode === "in_office"
          ? "42, Street No. 1B7, Santokh Nagar, Shiv Puri, Ludhiana, Punjab 141008"
          : "Phone Call"),
    });

    await sendEmail({
      to: data.clientEmail,
      subject: `Consultation ${consultType.isPaid ? "Reserved" : "Confirmed"} — ${bookingRef}`,
      html: `<p>Dear ${sanitizeText(data.clientName)},</p><p>Your consultation reference is <strong>${bookingRef}</strong> (${consultType.title}).</p>${meetInfo.meetLink ? `<p>Google Meet Link: <a href="${meetInfo.meetLink}">${meetInfo.meetLink}</a></p>` : ""}<p>All timings are in IST (Asia/Kolkata).</p>`,
      icsContent: ics,
    });

    await sendOfficeNotification({
      subject: `New Booking ${bookingRef} — ${consultType.title}`,
      html: `<p><strong>Client:</strong> ${sanitizeText(data.clientName)} (${data.clientPhone}, ${data.clientEmail})</p><p><strong>Type:</strong> ${consultType.title} (${data.mode})</p><p><strong>Slot (IST):</strong> ${slotStart.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p><p><strong>Topic:</strong> ${sanitizeText(data.topic)}</p>`,
    });

    await sendWhatsAppTemplate({
      toPhone: data.clientPhone,
      message: `Sunil Chawla Office: Your consultation (${bookingRef}) for ${consultType.title} is recorded for ${slotStart.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST.`,
    });

    await logAuditEvent({
      action: "booking_created",
      entityType: "booking",
      entityId: bookingRef,
      ipAddress: ip,
    });

    return NextResponse.json({
      bookingRef,
      status: consultType.isPaid ? "pending_payment" : "confirmed",
      amountInr: consultType.priceInr,
      meetLink: meetInfo.meetLink,
      slotStartIso: slotStart.toISOString(),
      slotEndIso: slotEnd.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process booking." },
      { status: 500 }
    );
  }
}
