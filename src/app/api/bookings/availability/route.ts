import { NextRequest, NextResponse } from "next/server";
import { getGoogleBusyIntervals } from "@/lib/google-calendar";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

const DEFAULT_SLOTS = [
  "10:30",
  "11:15",
  "12:00",
  "12:45",
  "14:30",
  "15:15",
  "16:00",
  "16:45",
  "17:30",
];

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json(
      { error: "Valid YYYY-MM-DD date parameter is required." },
      { status: 400 }
    );
  }

  const dayStart = new Date(`${dateStr}T00:00:00+05:30`);
  const dayEnd = new Date(`${dateStr}T23:59:59+05:30`);
  const dayOfWeek = dayStart.getDay();

  // Sunday closed by default
  if (dayOfWeek === 0) {
    return NextResponse.json({
      date: dateStr,
      timezone: "Asia/Kolkata (IST)",
      slots: [],
      isFull: true,
      reason: "Closed on Sundays",
    });
  }

  const busyIntervals: Array<{ start: string; end: string }> =
    await getGoogleBusyIntervals(dayStart.toISOString(), dayEnd.toISOString());

  if (isSupabaseAdminConfigured()) {
    const admin = createAdminSupabaseClient();
    const { data: blackout } = await admin
      .from("blackout_dates")
      .select("id, reason")
      .eq("blackout_date", dateStr)
      .maybeSingle();

    if (blackout) {
      return NextResponse.json({
        date: dateStr,
        timezone: "Asia/Kolkata (IST)",
        slots: [],
        isFull: true,
        reason: blackout.reason || "Unavailable on this date",
      });
    }

    const { data: existingBookings } = await admin
      .from("bookings")
      .select("slot_start, slot_end")
      .gte("slot_start", dayStart.toISOString())
      .lte("slot_start", dayEnd.toISOString())
      .in("status", ["confirmed", "rescheduled", "pending_payment"]);

    existingBookings?.forEach((b) =>
      busyIntervals.push({ start: b.slot_start, end: b.slot_end })
    );

    const { data: activeHolds } = await admin
      .from("slot_holds")
      .select("slot_start, slot_end")
      .eq("released", false)
      .gt("expires_at", new Date().toISOString())
      .gte("slot_start", dayStart.toISOString())
      .lte("slot_start", dayEnd.toISOString());

    activeHolds?.forEach((h) =>
      busyIntervals.push({ start: h.slot_start, end: h.slot_end })
    );
  }

  const slots = DEFAULT_SLOTS.map((time) => {
    const slotStart = new Date(`${dateStr}T${time}:00+05:30`);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
    const isPast = slotStart.getTime() < Date.now() + 2 * 60 * 60 * 1000;
    const overlaps = busyIntervals.some((b) => {
      const bs = new Date(b.start).getTime();
      const be = new Date(b.end).getTime();
      return slotStart.getTime() < be && slotEnd.getTime() > bs;
    });
    return {
      time,
      isoStart: slotStart.toISOString(),
      available: !isPast && !overlaps,
    };
  });

  const availableCount = slots.filter((s) => s.available).length;
  return NextResponse.json({
    date: dateStr,
    timezone: "Asia/Kolkata (IST)",
    slots,
    isFull: availableCount === 0,
  });
}
