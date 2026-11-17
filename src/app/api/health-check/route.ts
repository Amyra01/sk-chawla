import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeText } from "@/lib/utils";
import { sendEmail } from "@/lib/notifications";
import {
  createAdminSupabaseClient,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/admin";

const HealthSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  answers: z.object({
    registrationStatus: z.enum(["registered", "pending", "unsure"]),
    filingRegularity: z.enum(["always_on_time", "occasional_delay", "pending"]),
    gstr2bReconciled: z.enum(["monthly", "rarely", "never"]),
    pendingNotices: z.enum(["none", "one", "multiple"]),
    turnoverBracket: z.string(),
    gstinCount: z.number().int().min(0).max(100),
  }),
  dpdpConsent: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = HealthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    const { name, email, phone, answers } = parsed.data;
    let score = 100;
    const riskAreas: Array<{ area: string; level: "low" | "medium" | "high" }> =
      [];
    const actionList: string[] = [];

    if (answers.registrationStatus !== "registered") {
      score -= 15;
      riskAreas.push({ area: "GST / Statutory Registration", level: "medium" });
      actionList.push("Verify GSTIN / threshold registration eligibility.");
    } else {
      riskAreas.push({ area: "Registration Status", level: "low" });
    }

    if (answers.filingRegularity === "occasional_delay") {
      score -= 15;
      riskAreas.push({ area: "Return Filing Timeliness", level: "medium" });
      actionList.push("Set automated GSTR-1 & GSTR-3B due-date reminders.");
    } else if (answers.filingRegularity === "pending") {
      score -= 30;
      riskAreas.push({ area: "Pending Returns", level: "high" });
      actionList.push("Clear pending returns immediately to stop late fee & interest accrual.");
    } else {
      riskAreas.push({ area: "Return Filing Timeliness", level: "low" });
    }

    if (answers.gstr2bReconciled === "rarely") {
      score -= 15;
      riskAreas.push({ area: "GSTR-2B vs Books Reconciliation", level: "medium" });
      actionList.push("Perform quarterly GSTR-2B ITC reconciliation.");
    } else if (answers.gstr2bReconciled === "never") {
      score -= 25;
      riskAreas.push({ area: "ITC Mismatch Exposure", level: "high" });
      actionList.push("Urgent GSTR-2B vs Purchase Register audit recommended.");
    } else {
      riskAreas.push({ area: "ITC Reconciliation", level: "low" });
    }

    if (answers.pendingNotices === "one") {
      score -= 15;
      riskAreas.push({ area: "Open Tax Notice", level: "medium" });
      actionList.push("Upload your open notice to the Notice Decoder & book a review.");
    } else if (answers.pendingNotices === "multiple") {
      score -= 25;
      riskAreas.push({ area: "Multiple Open Notices", level: "high" });
      actionList.push("Book a Notice / Litigation Strategy Session immediately.");
    }

    score = Math.max(10, Math.min(100, score));
    if (actionList.length === 0) {
      actionList.push("Maintain monthly GSTR-2B reconciliations and annual GSTR-9 checks.");
    }

    if (isSupabaseAdminConfigured()) {
      const admin = createAdminSupabaseClient();
      await admin.from("health_check_results").insert({
        name: sanitizeText(name),
        email,
        phone: phone ? sanitizeText(phone) : null,
        answers,
        score,
        risk_areas: riskAreas,
        action_list: actionList,
        dpdp_consent: true,
      });

      await admin.from("leads").insert({
        name: sanitizeText(name),
        email,
        phone: phone ? sanitizeText(phone) : null,
        source: "health_check",
        stage: "New",
        dpdp_consent: true,
        metadata: { score, riskAreas },
      });
    }

    await sendEmail({
      to: email,
      subject: `Your Compliance Health Score: ${score}/100`,
      html: `<p>Dear ${sanitizeText(name)},</p><p>Your Business Compliance Health Score is <strong>${score}/100</strong>.</p><ul>${actionList.map((a) => `<li>${a}</li>`).join("")}</ul>`,
    });

    return NextResponse.json({ score, riskAreas, actionList });
  } catch {
    return NextResponse.json(
      { error: "Unable to compute health check." },
      { status: 500 }
    );
  }
}
