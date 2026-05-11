import type { LeadExtraction } from "@/lib/ai/extract-lead";
import { sendClickSendSms } from "@/lib/sms/clicksend";
import { getSmsSafetyConfig } from "@/lib/sms/config";
import { getPrivacySafeServiceLabel } from "@/lib/sms/privacy";

type LeadSmsNotificationInput = {
  to: string | null;
  businessName: string;
  leadName: string;
  phone: string | null;
  source: string;
  extraction: LeadExtraction | null;
};

function formatValue(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

function formatLabel(value: string | null | undefined) {
  const formatted = formatValue(value);

  if (
    formatted === "Not provided" ||
    formatted.toLowerCase() === "unknown"
  ) {
    return formatted;
  }

  return formatted
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function sendLeadSmsNotification(input: LeadSmsNotificationInput) {
  const config = getSmsSafetyConfig();

  if (!config.businessSmsAlertsEnabled) {
    console.log("Business SMS skipped: BUSINESS_SMS_ALERTS_ENABLED is not true");
    return;
  }

  const service = input.extraction?.service_requested;
  const urgency = input.extraction?.urgency;
  const serviceLabel =
    getPrivacySafeServiceLabel(service) ?? "Treatment enquiry";
  const urgencyLabel = formatLabel(urgency);
  const firstName = input.leadName.trim().split(/\s+/)[0] || "there";
  const callOpener = `Hi ${firstName}, it's ${input.businessName}. I saw your enquiry and wanted to help with the next step.`;
  const details = [
    `Service: ${serviceLabel}`,
    urgencyLabel === "Not provided" || urgencyLabel === "Unknown"
      ? null
      : `Urgency: ${urgencyLabel}`,
    `Phone: ${formatValue(input.phone)}`,
    `Source: ${formatLabel(input.source)}`
  ].filter(Boolean);

  const body = [
    `NEW LEAD: ${input.leadName}`,
    "",
    ...details,
    "",
    "Call opener:",
    callOpener,
    "",
    "Open dashboard for full details."
  ].join("\n");

  await sendClickSendSms({
    to: input.to,
    body
  });
}
