export const leadStatuses = [
  "New",
  "Contacted",
  "Replied",
  "Ready for Staff",
  "Booked",
  "Lost",
  "Invalid",
  "Needs Review"
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type Business = {
  id: string;
  name: string;
  notification_email: string | null;
  notification_phone: string | null;
  inbound_email_alias: string | null;
  reply_tone: string | null;
  created_at: string;
};

export type BusinessSettings = {
  email_notifications_enabled: boolean;
  sms_alerts_enabled: boolean;
};

export type Lead = {
  id: string;
  business_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  service_requested: string | null;
  urgency: string | null;
  intent: string | null;
  ai_summary: string | null;
  lead_quality: string | null;
  recommended_next_action: string | null;
  confidence: number | null;
  ai_extracted_at: string | null;
  ai_extraction_error: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  business_id: string;
  lead_id: string;
  direction: "inbound" | "outbound";
  channel: "email" | "sms" | "manual";
  body: string;
  created_at: string;
};

export type InboundEmailClassification =
  | "enquiry"
  | "non_enquiry"
  | "verification"
  | "unsure";

export type InboundEmailProcessingStatus =
  | "received"
  | "skipped"
  | "lead_created"
  | "needs_review"
  | "failed";

export type InboundEmailLog = {
  id: string;
  business_id: string | null;
  inbound_alias: string | null;
  resend_email_id: string | null;
  from_email: string | null;
  from_name: string | null;
  to_email: string | null;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  body_preview: string | null;
  classification: InboundEmailClassification;
  classification_reason: string | null;
  lead_id: string | null;
  processing_status: InboundEmailProcessingStatus;
  error_message: string | null;
  created_at: string;
};
