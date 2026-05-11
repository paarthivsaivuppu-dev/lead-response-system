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
