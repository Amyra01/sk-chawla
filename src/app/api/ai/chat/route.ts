import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security";
import { sanitizeText } from "@/lib/utils";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

const ChatSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
});

const SYSTEM_PROMPT = `You are the informational website assistant for Mr. Sunil Chawla (Advocate, Tax Advisor & Tax Consultant, B.A. LL.B. Hons, DAVV Indore, 22+ years experience in GST, Income Tax, VAT, and tax litigation).
STRICT GUARDRAILS:
1. Never provide case-specific legal advice or predict case outcomes.
2. Never fabricate statutory citations, case law, or tax rates.
3. Answer only general informational questions about services (GST registration/returns, ITR filing, VAT/revenue court litigation, company incorporation via MCA), documents typically required, or how to book a consultation / ask a query.
4. Keep responses concise (under 110 words) and suggest booking a consultation (/book) or submitting a query (/ask-query) for specific matters.
5. Always end with a brief reminder that this is general information, not legal advice.`;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rl = await checkRateLimit(`ai_chat:${ip}`, 12, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { reply: "Rate limit reached. Please use Ask a Query or Book a Consultation." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const userMessage = sanitizeText(parsed.data.message);
    let reply =
      "We assist with GST registration & returns, Income Tax filing, VAT/revenue court litigation, and company incorporation. For guidance tailored to your documents, please book a consultation or submit a query via Ask a Query. (General information only — not legal advice.)";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && !apiKey.includes("sk-ant-xxxx")) {
      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 240,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });
      const textBlock = msg.content.find((b) => b.type === "text");
      if (textBlock && "text" in textBlock) {
        reply = textBlock.text;
      }
    }

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      await admin.from("ai_chat_logs").insert({
        session_id: parsed.data.sessionId || ip,
        user_message: userMessage,
        assistant_response: reply,
      });
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      {
        reply:
          "Our assistant is temporarily unavailable. Please use Ask a Query or Book a Consultation. (General information only — not legal advice.)",
      },
      { status: 200 }
    );
  }
}
