import { Resend } from "resend";

export const OFFICE_NOTIFICATION_EMAIL =
  process.env.OFFICE_NOTIFICATION_EMAIL || "sunilkumarchawla@gmail.com";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes("re_xxxx")) return null;
  return new Resend(key);
}

export async function sendOfficeNotification(params: {
  subject: string;
  html: string;
}): Promise<{ sent: boolean; id?: string }> {
  return sendEmail({
    to: OFFICE_NOTIFICATION_EMAIL,
    subject: `[SK Chawla Office] ${params.subject}`,
    html: params.html,
  });
}

export function generateICS(params: {
  uid: string;
  title: string;
  description: string;
  startIso: string;
  endIso: string;
  location: string;
}): string {
  const formatICSDate = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sunil Chawla Advocate & Tax Consultant//EN",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${formatICSDate(params.startIso)}`,
    `DTEND:${formatICSDate(params.endIso)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${params.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  icsContent?: string;
}): Promise<{ sent: boolean; id?: string }> {
  const resend = getResend();
  if (!resend) {
    return { sent: false };
  }
  try {
    const from =
      process.env.RESEND_FROM_EMAIL ||
      "Sunil Chawla Office <no-reply@sunilchawla.in>";
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.icsContent
        ? [
            {
              filename: "consultation.ics",
              content: Buffer.from(params.icsContent, "utf8").toString(
                "base64"
              ),
            },
          ]
        : undefined,
    });
    return { sent: true, id: result.data?.id };
  } catch {
    return { sent: false };
  }
}

export async function sendWhatsAppTemplate(params: {
  toPhone: string;
  message: string;
}): Promise<{ sent: boolean }> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiUrl = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v20.0";

  if (!phoneId || !token || token.includes("your-whatsapp")) {
    return { sent: false };
  }

  const normalized = params.toPhone.replace(/\D/g, "");
  const recipient = normalized.length === 10 ? `91${normalized}` : normalized;

  try {
    const res = await fetch(`${apiUrl}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body: params.message },
      }),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}

export function buildGstInvoiceHtml(params: {
  invoiceNumber: string;
  issuedAt: string;
  customerName: string;
  customerEmail: string;
  customerGstin?: string;
  items: Array<{ title: string; sac: string; amount: number }>;
  subtotal: number;
  gstAmount: number;
  total: number;
}): string {
  const rows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #222;">${item.title}</td>
        <td style="padding:8px;border-bottom:1px solid #222;">${item.sac}</td>
        <td style="padding:8px;border-bottom:1px solid #222;text-align:right;">₹${item.amount.toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto;background:#0A0F1C;color:#fff;padding:32px;border:1px solid #4F74E8;">
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid #1e293b;padding-bottom:16px;">
        <div>
          <h1 style="margin:0;font-size:20px;color:#fff;">SUNIL CHAWLA &amp; ASSOCIATES</h1>
          <p style="margin:4px 0 0;color:#AEB6C6;font-size:12px;">Advocate & Tax Consultant</p>
          <p style="margin:2px 0 0;color:#AEB6C6;font-size:12px;">42, Street No. 1B7, Santokh Nagar, Shiv Puri, Ludhiana, Punjab 141008</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;color:#E0B860;font-weight:bold;">TAX INVOICE</p>
          <p style="margin:4px 0 0;font-size:13px;">${params.invoiceNumber}</p>
          <p style="margin:2px 0 0;color:#AEB6C6;font-size:12px;">${params.issuedAt}</p>
        </div>
      </div>
      <div style="margin:20px 0;">
        <p style="margin:0;color:#AEB6C6;font-size:12px;">Billed To</p>
        <p style="margin:4px 0 0;font-weight:600;">${params.customerName}</p>
        <p style="margin:2px 0 0;color:#AEB6C6;font-size:13px;">${params.customerEmail}</p>
        ${params.customerGstin ? `<p style="margin:2px 0 0;color:#AEB6C6;font-size:13px;">GSTIN: ${params.customerGstin}</p>` : ""}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#111827;color:#E0B860;">
            <th style="padding:8px;text-align:left;">Service</th>
            <th style="padding:8px;text-align:left;">SAC</th>
            <th style="padding:8px;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:20px;text-align:right;font-size:14px;">
        <p style="margin:4px 0;">Subtotal: ₹${params.subtotal.toLocaleString("en-IN")}</p>
        <p style="margin:4px 0;">GST (18%): ₹${params.gstAmount.toLocaleString("en-IN")}</p>
        <p style="margin:8px 0 0;font-size:18px;color:#E0B860;font-weight:bold;">Total: ₹${params.total.toLocaleString("en-IN")}</p>
      </div>
      <p style="margin-top:24px;font-size:11px;color:#AEB6C6;border-top:1px solid #1e293b;padding-top:12px;">
        System-generated GST tax invoice. The information on this website is for general informational purposes and does not constitute legal advice.
      </p>
    </div>
  `;
}
