import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/security";
import { generateRef, sanitizeText } from "@/lib/utils";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = await checkRateLimit(`notice_decoder:${ip}`, 8, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const noticeText = (formData.get("noticeText") as string) || "";
    const email = (formData.get("email") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const createTicket = formData.get("createTicket") === "true";
    const consent = formData.get("dpdpConsent") === "true";

    if (!consent) {
      return NextResponse.json(
        { error: "DPDP consent is required." },
        { status: 400 }
      );
    }

    if (!file && !noticeText.trim()) {
      return NextResponse.json(
        { error: "Please upload a notice file (PDF/JPG/PNG) or paste notice text." },
        { status: 400 }
      );
    }

    if (file && file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 8 MB." },
        { status: 400 }
      );
    }

    let extracted = {
      noticeType: "GST / Tax Notice (Preliminary Summary)",
      section: "Verify exact section on notice",
      dateIssued: new Date().toISOString().slice(0, 10),
      replyDeadline: new Date(Date.now() + 21 * 86400000)
        .toISOString()
        .slice(0, 10),
      authority: "Tax / Revenue Authority",
      whatThisMeans:
        "This communication seeks clarification, reconciliation, or a formal reply regarding tax filings or input tax credit.",
      whatHappensNext:
        "A structured written reply with supporting reconciliations and invoices must be submitted before the statutory deadline.",
      documentsLikelyNeeded: [
        "Copy of the Notice & Annexures",
        "GSTR-1, GSTR-3B & GSTR-2B Reconciliation",
        "Relevant Invoices, E-Way Bills & Ledger Extracts",
      ],
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && !apiKey.includes("sk-ant-xxxx")) {
      const anthropic = new Anthropic({ apiKey });
      const contentBlocks: Anthropic.MessageParam["content"] = [];

      if (file && file.type.startsWith("image/")) {
        const buf = Buffer.from(await file.arrayBuffer());
        contentBlocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: file.type as
              | "image/jpeg"
              | "image/png"
              | "image/webp"
              | "image/gif",
            data: buf.toString("base64"),
          },
        });
      }

      contentBlocks.push({
        type: "text",
        text: `Extract structured fields from this Indian GST/Income Tax notice. Return ONLY valid JSON with keys: noticeType, section, dateIssued (YYYY-MM-DD), replyDeadline (YYYY-MM-DD), authority, whatThisMeans, whatHappensNext, documentsLikelyNeeded (array of strings). Never give case-specific legal advice. ${noticeText ? `Notice text:\n${sanitizeText(noticeText)}` : ""}`,
      });

      const resp = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 600,
        messages: [{ role: "user", content: contentBlocks }],
      });

      const txt = resp.content.find((b) => b.type === "text");
      if (txt && "text" in txt) {
        const jsonMatch = txt.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extracted = { ...extracted, ...JSON.parse(jsonMatch[0]) };
        }
      }
    }

    let urgentTicketId: string | null = null;
    if (createTicket && email) {
      urgentTicketId = generateRef("SC");
    }

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      let queryId: string | null = null;

      if (urgentTicketId && email) {
        const { data: q } = await admin
          .from("queries")
          .insert({
            ticket_id: urgentTicketId,
            name: email.split("@")[0],
            email,
            phone: phone || "[NOT PROVIDED]",
            category: "Litigation",
            urgency: "Urgent",
            question: `Urgent Notice Decoder Submission: ${extracted.noticeType} (${extracted.section})`,
            notice_deadline: extracted.replyDeadline,
            dpdp_consent: true,
          })
          .select("id")
          .single();
        queryId = q?.id ?? null;
      }

      await admin.from("notice_scans").insert({
        email: email || null,
        phone: phone || null,
        file_name: file?.name || "pasted-notice.txt",
        extracted_notice_type: extracted.noticeType,
        extracted_section: extracted.section,
        date_issued: extracted.dateIssued,
        reply_deadline: extracted.replyDeadline,
        issuing_authority: extracted.authority,
        plain_english_summary: extracted,
        linked_query_id: queryId,
        dpdp_consent: true,
      });
    }

    return NextResponse.json({
      ...extracted,
      urgentTicketId,
      disclaimer: "AI-generated summary, verify with your advisor.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to decode notice." },
      { status: 500 }
    );
  }
}
