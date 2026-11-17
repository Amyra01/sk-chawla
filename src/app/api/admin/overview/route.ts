import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      configured: false,
      counts: { bookings: 0, urgentQueries: 0, pendingOrders: 0, openCases: 0 },
      recentBookings: [],
      recentQueries: [],
      leads: [],
      featureFlags: {},
    });
  }

  const admin = createAdminSupabaseClient();

  const [
    bookingsRes,
    queriesRes,
    ordersRes,
    casesRes,
    leadsRes,
    settingsRes,
  ] = await Promise.all([
    admin
      .from("bookings")
      .select("id, booking_ref, client_name, client_phone, mode, slot_start, status, topic")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("queries")
      .select("id, ticket_id, name, phone, category, urgency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("orders")
      .select("id, order_number, customer_name, total_inr, status")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("cases")
      .select("id, case_number, title, stage")
      .neq("stage", "Completed"),
    admin
      .from("leads")
      .select("id, name, email, phone, source, stage, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("site_settings")
      .select("value")
      .eq("key", "feature_flags")
      .maybeSingle(),
  ]);

  const urgentQueries =
    queriesRes.data?.filter((q) => q.urgency === "Urgent" && q.status !== "Closed")
      .length ?? 0;
  const pendingOrders =
    ordersRes.data?.filter((o) => o.status === "pending").length ?? 0;

  return NextResponse.json({
    configured: true,
    counts: {
      bookings: bookingsRes.data?.length ?? 0,
      urgentQueries,
      pendingOrders,
      openCases: casesRes.data?.length ?? 0,
    },
    recentBookings: bookingsRes.data ?? [],
    recentQueries: queriesRes.data ?? [],
    leads: leadsRes.data ?? [],
    featureFlags: settingsRes.data?.value ?? {},
  });
}

export async function PATCH(req: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
  }
  const body = await req.json();
  const admin = createAdminSupabaseClient();
  await admin
    .from("site_settings")
    .upsert({ key: "feature_flags", value: body.featureFlags });
  return NextResponse.json({ ok: true });
}
