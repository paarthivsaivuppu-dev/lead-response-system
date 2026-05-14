"use server";

import { redirect } from "next/navigation";
import { isBusinessAccessible } from "@/lib/business/access";
import { createLeadForBusiness } from "@/lib/leads/create-lead";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";

type NotificationRules = {
  emailNotificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
};

async function getPublicLeadNotificationRules(
  businessId: string
): Promise<NotificationRules> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("business_rules")
      .select("rule_type, rule_value")
      .eq("business_id", businessId)
      .in("rule_type", ["email_notifications_enabled", "sms_alerts_enabled"]);

    const rules = new Map(
      (data ?? []).map((rule) => [
        rule.rule_type,
        rule.rule_value as { enabled?: boolean } | null | undefined
      ])
    );

    return {
      emailNotificationsEnabled:
        rules.get("email_notifications_enabled")?.enabled === true,
      smsAlertsEnabled: rules.get("sms_alerts_enabled")?.enabled === true
    };
  } catch (error) {
    console.error("Public lead notification settings lookup failed:", error);
    return {
      emailNotificationsEnabled: false,
      smsAlertsEnabled: false
    };
  }
}

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

  if (!isBusinessAccessible(business as Business)) {
    throw new Error("This enquiry form is not currently available.");
  }

  const notificationRules = await getPublicLeadNotificationRules(businessId);

  await createLeadForBusiness({
    supabase,
    business: business as Business,
    customerName,
    customerPhone,
    customerEmail,
    source: "website",
    originalMessage,
    emailNotificationsEnabled: notificationRules.emailNotificationsEnabled,
    smsAlertsEnabled: notificationRules.smsAlertsEnabled
  });

  redirect(`/lead-form/${businessId}?submitted=1`);
}
