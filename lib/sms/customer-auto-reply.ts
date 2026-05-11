import type { LeadExtraction } from "@/lib/ai/extract-lead";
import { sendClickSendSms } from "@/lib/sms/clicksend";
import { getSmsSafetyConfig } from "@/lib/sms/config";
import { getPrivacySafeServiceLabel } from "@/lib/sms/privacy";

type CustomerAutoReplyInput = {
  leadName: string;
  leadPhone: string | null;
  extraction: LeadExtraction | null;
};

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function buildCustomerAutoReply(input: CustomerAutoReplyInput) {
  const service = getPrivacySafeServiceLabel(input.extraction?.service_requested);

  if (!service) {
    return `Hi ${firstName(input.leadName)}, thanks for reaching out. The team has received your enquiry and will get back to you shortly.`;
  }

  return `Hi ${firstName(input.leadName)}, thanks for reaching out about ${service.toLowerCase()}. The team has received your enquiry and will get back to you shortly.`;
}

export async function sendCustomerAutoReply(input: CustomerAutoReplyInput) {
  const config = getSmsSafetyConfig();

  if (!config.customerSmsAutoReplyEnabled) {
    console.log("Customer SMS skipped: CUSTOMER_SMS_AUTO_REPLY_ENABLED is not true");
    return null;
  }

  const to = config.customerSmsTestMode
    ? process.env.TEST_CUSTOMER_PHONE
    : input.leadPhone;

  if (config.customerSmsTestMode) {
    console.log("Customer SMS test mode active: sending to TEST_CUSTOMER_PHONE");
  }

  if (!to) {
    console.error("Customer SMS auto-reply skipped: no destination phone.");
    return null;
  }

  const body = buildCustomerAutoReply(input);

  await sendClickSendSms({
    to,
    body
  });

  return body;
}
