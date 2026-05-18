"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

async function getOwnedInboundEmailLog(logId: string) {
  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No connected business found.");
  }

  const supabase = createAdminClient();
  const { data: log, error } = await supabase
    .from("inbound_email_logs")
    .select("*")
    .eq("business_id", business.id)
    .eq("id", logId)
    .single();

  if (error || !log) {
    throw new Error("Inbound email log was not found.");
  }

  return {
    business,
    log,
    supabase
  };
}

async function findLinkedLeadId({
  businessId,
  fromEmail,
  leadId,
  processingStatus,
  supabase
}: {
  businessId: string;
  fromEmail: string | null;
  leadId: string | null;
  processingStatus: string;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  if (leadId) {
    return leadId;
  }

  if (processingStatus !== "lead_created" || !fromEmail) {
    return null;
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("business_id", businessId)
    .eq("source", "email")
    .eq("email", fromEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (lead?.id as string | undefined) ?? null;
}

async function deleteLeadRecords({
  businessId,
  leadId,
  supabase
}: {
  businessId: string;
  leadId: string;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("business_id", businessId)
    .eq("lead_id", leadId);

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const { error: followUpsError } = await supabase
    .from("follow_ups")
    .delete()
    .eq("business_id", businessId)
    .eq("lead_id", leadId);

  if (followUpsError) {
    throw new Error(followUpsError.message);
  }

  const { error: leadError } = await supabase
    .from("leads")
    .delete()
    .eq("business_id", businessId)
    .eq("id", leadId);

  if (leadError) {
    throw new Error(leadError.message);
  }
}

export async function deleteSelectedInboundEmailLogs(formData: FormData) {
  const logIds = formData
    .getAll("log_ids")
    .map((value) => String(value))
    .filter(Boolean);

  if (logIds.length === 0) {
    return;
  }

  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No connected business found.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("inbound_email_logs")
    .delete()
    .eq("business_id", business.id)
    .in("id", logIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inbound-emails");
}

export async function deleteSelectedInboundEmailLogsAndLinkedLeads(
  formData: FormData
) {
  const logIds = formData
    .getAll("log_ids")
    .map((value) => String(value))
    .filter(Boolean);

  if (logIds.length === 0) {
    return;
  }

  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("No connected business found.");
  }

  const supabase = createAdminClient();
  const { data: logs, error: logsError } = await supabase
    .from("inbound_email_logs")
    .select("id, from_email, lead_id, processing_status")
    .eq("business_id", business.id)
    .in("id", logIds);

  if (logsError) {
    throw new Error(logsError.message);
  }

  const linkedLeadIds = new Set<string>();

  for (const log of logs ?? []) {
    const leadId = await findLinkedLeadId({
      businessId: business.id,
      fromEmail: log.from_email as string | null,
      leadId: log.lead_id as string | null,
      processingStatus: log.processing_status as string,
      supabase
    });

    if (leadId) {
      linkedLeadIds.add(leadId);
    }
  }

  for (const leadId of linkedLeadIds) {
    await deleteLeadRecords({
      businessId: business.id,
      leadId,
      supabase
    });
  }

  const { error: deleteLogsError } = await supabase
    .from("inbound_email_logs")
    .delete()
    .eq("business_id", business.id)
    .in("id", logIds);

  if (deleteLogsError) {
    throw new Error(deleteLogsError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/inbound-emails");
}

export async function deleteInboundEmailLogOnly(logId: string) {
  const { business, supabase } = await getOwnedInboundEmailLog(logId);

  const { error } = await supabase
    .from("inbound_email_logs")
    .delete()
    .eq("business_id", business.id)
    .eq("id", logId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/inbound-emails");
  redirect("/dashboard/inbound-emails");
}

export async function deleteInboundEmailLogAndLinkedLead(logId: string) {
  const { business, log, supabase } = await getOwnedInboundEmailLog(logId);
  const leadId = await findLinkedLeadId({
    businessId: business.id,
    fromEmail: log.from_email,
    leadId: log.lead_id,
    processingStatus: log.processing_status,
    supabase
  });

  if (leadId) {
    await deleteLeadRecords({
      businessId: business.id,
      leadId,
      supabase
    });
  }

  const { error: logError } = await supabase
    .from("inbound_email_logs")
    .delete()
    .eq("business_id", business.id)
    .eq("id", logId);

  if (logError) {
    throw new Error(logError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/inbound-emails");
  redirect("/dashboard/inbound-emails");
}
