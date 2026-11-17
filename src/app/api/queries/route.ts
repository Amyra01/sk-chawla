import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRef, sanitizeText } from "@/lib/utils";
import { checkRateLimit } from "@/lib/security";
import {
  sendEmail,
  sendOfficeNotification,
  sendWhatsAppTemplate,
} from "@/lib/notifications";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

const QuerySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  category: z.enum([
    "GST",
    "ITR",
    "VAT",
    "Litigation",
    "Company Setup",
    "Other",
  ]),
  urgency: z.enum(["Normal", "Urgent"]).default("Normal"),
  question: z.string().min(10).max(4000),
  isPaidOpinion: z.boolean().optional(),
  publicQaConsent: z.boolean().optional(),
  noticeDeadline: z.string().optional(),
  dpdpConsent: z.literal(true),
});

export async function GET(req: NextRequest) {
  const ticketId = req.nextUrl.searchParams.get("ticketId");
  if (!ticketId) {
    return NextResponse.json(
      { error: "ticketId is required" },
      { status: 400 }
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      ticketId,
      status: "Received",
      category: "GST",
      urgency: "Normal",
      createdAt: new Date().toISOString(),
      messages: [
        {
          sender_role: "client",
          message: "Initial query submitted.",
          created_at: new Date().toISOString(),
        },
      ],
    });
  }

  const admin = createAdminSupabaseClient();
  const { data: query } = await admin
    .from("queries")
    .select(
      "id, ticket_id, category, urgency, status, created_at, query_messages(sender_role, message, created_at)"
    )
    .eq("ticket_id", ticketId.trim().toUpperCase())
    .maybeSingle();

  if (!query) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  return NextResponse.json(query);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = await checkRateLimit(`query:${ip}`, 15, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = QuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query payload.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const ticketId = generateRef("SC");

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      const { data: inserted } = await admin
        .from("queries")
        .insert({
          ticket_id: ticketId,
          name: sanitizeText(d.name),
          email: d.email,
          phone: sanitizeText(d.phone),
          category: d.category,
          urgency: d.urgency,
          question: sanitizeText(d.question),
          is_paid_opinion: Boolean(d.isPaidOpinion),
          public_qa_consent: Boolean(d.publicQaConsent),
          notice_deadline: d.noticeDeadline || null,
          dpdp_consent: true,
        })
        .select("id")
        .single();

      if (inserted) {
        await admin.from("query_messages").insert({
          query_id: inserted.id,
          sender_role: "client",
          message: sanitizeText(d.question),
        });
      }

      await admin.from("leads").insert({
        name: sanitizeText(d.name),
        email: d.email,
        phone: sanitizeText(d.phone),
        source: "query",
        stage: "New",
        dpdp_consent: true,
        metadata: { ticketId, category: d.category, urgency: d.urgency },
      });
    }

    await sendEmail({
      to: d.email,
      subject: `Query Received — Ticket ${ticketId}`,
      html: `<p>Dear ${sanitizeText(d.name)},</p><p>Your query has been logged under ticket ID <strong>${ticketId}</strong> (${d.category} • ${d.urgency}).</p><p>You can track its status at any time on our Ask a Query page.</p>`,
    });

    await sendOfficeNotification({
      subject: `New ${d.urgency} Query ${ticketId} (${d.category})`,
      html: `<p><strong>From:</strong> ${sanitizeText(d.name)} (${d.phone}, ${d.email})</p><p><strong>Category:</strong> ${d.category} • <strong>Urgency:</strong> ${d.urgency}</p><p><strong>Question:</strong> ${sanitizeText(d.question)}</p>`,
    });

    await sendWhatsAppTemplate({
      toPhone: d.phone,
      message: `Sunil Chawla Office: Your query (${ticketId}) has been received. Status: Received.`,
    });

    return NextResponse.json({
      ticketId,
      status: "Received",
      category: d.category,
      urgency: d.urgency,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit query." },
      { status: 500 }
    );
  }
}
