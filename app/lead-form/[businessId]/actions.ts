"use server";

import { redirect } from "next/navigation";
import { createLeadForBusiness } from "@/lib/leads/create-lead";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";

export async function submitPublicLead(
  businessId: string,
  formData: FormData
) {
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim();
  const originalMessage = String(formData.get("original_message") ?? "").trim();

  if (!customerName) {
    throw new Error("Customer name is required.");
  }

  if (!originalMessage) {
    throw new Error("Message is required.");
  }

  const supabase = await createClient();
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (error || !business) {
    throw new Error("Form not found.");
  }

  const { data: emailNotificationRule } = await supabase
    .from("business_rules")
    .select("rule_value")
    .eq("business_id", businessId)
    .eq("rule_type", "email_notifications_enabled")
    .maybeSingle();
  const ruleValue = emailNotificationRule?.rule_value as
    | { enabled?: boolean }
    | null
    | undefined;

  await createLeadForBusiness({
    supabase,
    business: business as Business,
    customerName,
    customerPhone,
    customerEmail,
    source: "website",
    originalMessage,
    emailNotificationsEnabled: ruleValue?.enabled === true
  });

  redirect(`/lead-form/${businessId}?submitted=1`);
}
