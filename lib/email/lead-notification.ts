import { Resend } from "resend";
import type { LeadExtraction } from "@/lib/ai/extract-lead";

type LeadNotificationInput = {
  to: string | null;
  leadId: string;
  leadName: string;
  phone: string | null;
  email: string | null;
  source: string;
  originalMessage: string;
  extraction: LeadExtraction | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function row(label: string, value: string | null | undefined) {
  return `
    <tr>
      <td style="padding: 8px 0; color: #475569; width: 190px;">${escapeHtml(label)}</td>
      <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(value || "Not provided")}</td>
    </tr>
  `;
}

export async function sendLeadNotificationEmail(input: LeadNotificationInput) {
  if (!input.to) {
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("Lead notification email skipped: RESEND_API_KEY is not set.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const leadUrl = `${appUrl}/dashboard/leads/${input.leadId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">New lead received</h1>
      <p style="margin: 0 0 20px; color: #475569;">
        A new manual lead was created in your dashboard.
      </p>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        ${row("Lead name", input.leadName)}
        ${row("Phone", input.phone)}
        ${row("Email", input.email)}
        ${row("Source", input.source)}
        ${row("Original message", input.originalMessage)}
        ${row("Service requested", input.extraction?.service_requested)}
        ${row("Urgency", input.extraction?.urgency)}
        ${row("AI summary", input.extraction?.ai_summary)}
        ${row("Recommended next action", input.extraction?.recommended_next_action)}
      </table>
      <p style="margin: 24px 0 0;">
        <a href="${escapeHtml(leadUrl)}" style="background: #0f172a; color: #ffffff; display: inline-block; padding: 10px 14px; border-radius: 6px; text-decoration: none;">
          View lead
        </a>
      </p>
    </div>
  `;

  const text = [
    "New lead received",
    "",
    `Lead name: ${input.leadName}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Email: ${input.email || "Not provided"}`,
    `Source: ${input.source}`,
    `Original message: ${input.originalMessage || "Not provided"}`,
    `Service requested: ${input.extraction?.service_requested || "Not provided"}`,
    `Urgency: ${input.extraction?.urgency || "Not provided"}`,
    `AI summary: ${input.extraction?.ai_summary || "Not provided"}`,
    `Recommended next action: ${input.extraction?.recommended_next_action || "Not provided"}`,
    "",
    `View lead: ${leadUrl}`
  ].join("\n");

  await resend.emails.send({
    from: "Lead Response <onboarding@resend.dev>",
    to: input.to,
    subject: `New lead: ${input.leadName}`,
    html,
    text
  });
}
