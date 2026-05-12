"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data";

export async function updateBusinessSettings(formData: FormData) {
  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No business is connected to this user.");
  }

  const businessName = String(formData.get("business_name") ?? "").trim();
  const notificationEmail = String(
    formData.get("notification_email") ?? ""
  ).trim();
  const notificationPhone = String(
    formData.get("notification_phone") ?? ""
  ).trim();
  const inboundEmailAlias = String(
    formData.get("inbound_email_alias") ?? ""
  )
    .trim()
    .toLowerCase();
  const replyTone = String(formData.get("reply_tone") ?? "").trim();
  const emailNotificationsEnabled =
    formData.get("email_notifications_enabled") === "on";
  const smsAlertsEnabled = formData.get("sms_alerts_enabled") === "on";

  if (!businessName) {
    throw new Error("Business name is required.");
  }

  const supabase = await createClient();
  const { error: businessError } = await supabase
    .from("businesses")
    .update({
      name: businessName,
      notification_email: notificationEmail || null,
      notification_phone: notificationPhone || null,
      inbound_email_alias: inboundEmailAlias || null,
      reply_tone: replyTone || "Friendly and professional"
    })
    .eq("id", business.id);

  if (businessError) {
    throw new Error(businessError.message);
  }

  const { error: ruleError } = await supabase.from("business_rules").upsert(
    {
      business_id: business.id,
      rule_type: "reply_tone",
      rule_value: {
        tone: replyTone || "Friendly and professional"
      },
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "business_id,rule_type"
    }
  );

  if (ruleError) {
    throw new Error(ruleError.message);
  }

  const { error: emailRuleError } = await supabase.from("business_rules").upsert(
    {
      business_id: business.id,
      rule_type: "email_notifications_enabled",
      rule_value: {
        enabled: emailNotificationsEnabled
      },
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "business_id,rule_type"
    }
  );

  if (emailRuleError) {
    throw new Error(emailRuleError.message);
  }

  const { error: smsRuleError } = await supabase.from("business_rules").upsert(
    {
      business_id: business.id,
      rule_type: "sms_alerts_enabled",
      rule_value: {
        enabled: smsAlertsEnabled
      },
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "business_id,rule_type"
    }
  );

  if (smsRuleError) {
    throw new Error(smsRuleError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?saved=1");
}
