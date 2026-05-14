"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isBusinessAccessible } from "@/lib/business/access";
import { createLeadForBusiness } from "@/lib/leads/create-lead";
import { createClient } from "@/lib/supabase/server";
import { getBusinessSettings, getCurrentBusiness } from "@/lib/data";
import { leadStatuses, type LeadStatus } from "@/lib/types";

const sourceOptions = ["manual", "email", "sms", "website"] as const;

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  if (!leadStatuses.includes(status)) {
    throw new Error("Invalid lead status.");
  }

  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No business is connected to this user.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("business_id", business.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function deleteLead(leadId: string) {
  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No business is connected to this user.");
  }

  const supabase = await createClient();
  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("lead_id", leadId)
    .eq("business_id", business.id);

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const { error: followUpsError } = await supabase
    .from("follow_ups")
    .delete()
    .eq("lead_id", leadId)
    .eq("business_id", business.id);

  if (followUpsError) {
    throw new Error(followUpsError.message);
  }

  const { error: leadError } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("business_id", business.id);

  if (leadError) {
    throw new Error(leadError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  redirect("/dashboard/leads");
}

export async function deleteSelectedLeads(formData: FormData) {
  const leadIds = formData
    .getAll("lead_ids")
    .map((value) => String(value))
    .filter(Boolean);

  if (leadIds.length === 0) {
    return;
  }

  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No business is connected to this user.");
  }

  const supabase = await createClient();
  const { data: ownedLeads, error: ownedLeadsError } = await supabase
    .from("leads")
    .select("id")
    .eq("business_id", business.id)
    .in("id", leadIds);

  if (ownedLeadsError) {
    throw new Error(ownedLeadsError.message);
  }

  const ownedLeadIds = (ownedLeads ?? []).map((lead) => lead.id as string);

  if (ownedLeadIds.length === 0) {
    return;
  }

  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("business_id", business.id)
    .in("lead_id", ownedLeadIds);

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const { error: followUpsError } = await supabase
    .from("follow_ups")
    .delete()
    .eq("business_id", business.id)
    .in("lead_id", ownedLeadIds);

  if (followUpsError) {
    throw new Error(followUpsError.message);
  }

  const { error: leadsError } = await supabase
    .from("leads")
    .delete()
    .eq("business_id", business.id)
    .in("id", ownedLeadIds);

  if (leadsError) {
    throw new Error(leadsError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}

export async function createLead(formData: FormData) {
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const customerEmail = String(formData.get("customer_email") ?? "").trim();
  const source = String(formData.get("source") ?? "manual").trim();
  const originalMessage = String(formData.get("original_message") ?? "").trim();

  if (!customerName) {
    throw new Error("Customer name is required.");
  }

  if (!sourceOptions.includes(source as (typeof sourceOptions)[number])) {
    throw new Error("Invalid lead source.");
  }

  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No business is connected to this user.");
  }

  if (!isBusinessAccessible(business)) {
    throw new Error(
      "Your ClinicResponse AI pilot is currently paused or expired."
    );
  }

  const supabase = await createClient();
  const settings = await getBusinessSettings(business.id);
  const { leadId } = await createLeadForBusiness({
    supabase,
    business,
    customerName,
    customerPhone,
    customerEmail,
    source: source as "manual" | "email" | "sms" | "website",
    originalMessage,
    emailNotificationsEnabled: settings.email_notifications_enabled,
    smsAlertsEnabled: settings.sms_alerts_enabled
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  redirect(`/dashboard/leads/${leadId}`);
}
