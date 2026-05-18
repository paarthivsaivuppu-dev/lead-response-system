import { createClient } from "@/lib/supabase/server";
import type {
  Business,
  BusinessSettings,
  InboundEmailLog,
  Lead,
  Message
} from "@/lib/types";

type BusinessUserJoin = {
  businesses: Business | Business[] | null;
};

export async function getCurrentBusiness() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("business_users")
    .select("businesses(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const row = data as BusinessUserJoin | null;
  const business = Array.isArray(row?.businesses)
    ? row.businesses[0]
    : row?.businesses;

  if (error || !business) {
    return null;
  }

  return business;
}

export async function getLeadsForCurrentBusiness() {
  const business = await getCurrentBusiness();

  if (!business) {
    return { business: null, leads: [] as Lead[] };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return { business, leads: (data ?? []) as Lead[] };
}

export async function getBusinessSettings(
  businessId: string
): Promise<BusinessSettings> {
  const supabase = await createClient();
  const { data } = await supabase
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
    email_notifications_enabled:
      rules.get("email_notifications_enabled")?.enabled === true,
    sms_alerts_enabled: rules.get("sms_alerts_enabled")?.enabled === true
  };
}

export async function getLeadDetail(leadId: string) {
  const business = await getCurrentBusiness();

  if (!business) {
    return { business: null, lead: null, messages: [] as Message[] };
  }

  const supabase = await createClient();
  const [{ data: lead }, { data: messages }] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("business_id", business.id)
      .eq("id", leadId)
      .single(),
    supabase
      .from("messages")
      .select("*")
      .eq("business_id", business.id)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true })
  ]);

  return {
    business,
    lead: lead as Lead | null,
    messages: (messages ?? []) as Message[]
  };
}

export async function getInboundEmailLogsForCurrentBusiness() {
  const business = await getCurrentBusiness();

  if (!business) {
    return { business: null, logs: [] as InboundEmailLog[] };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("inbound_email_logs")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const logs = (data ?? []) as InboundEmailLog[];
  const emailsMissingLeadIds = Array.from(
    new Set(
      logs
        .filter((log) => log.processing_status === "lead_created" && !log.lead_id)
        .map((log) => log.from_email)
        .filter((email): email is string => Boolean(email))
    )
  );

  if (emailsMissingLeadIds.length === 0) {
    return {
      business,
      logs
    };
  }

  const { data: matchingLeads } = await supabase
    .from("leads")
    .select("id,email")
    .eq("business_id", business.id)
    .eq("source", "email")
    .in("email", emailsMissingLeadIds)
    .order("created_at", { ascending: false });

  const leadIdByEmail = new Map(
    (matchingLeads ?? []).map((lead) => [lead.email as string, lead.id as string])
  );

  return {
    business,
    logs: logs.map((log) => ({
      ...log,
      lead_id: log.lead_id ?? leadIdByEmail.get(log.from_email ?? "") ?? null
    }))
  };
}

export async function getInboundEmailLogDetail(logId: string) {
  const business = await getCurrentBusiness();

  if (!business) {
    return { business: null, log: null, lead: null };
  }

  const supabase = await createClient();
  const { data: log } = await supabase
    .from("inbound_email_logs")
    .select("*")
    .eq("business_id", business.id)
    .eq("id", logId)
    .single();

  const inboundLog = log as InboundEmailLog | null;

  if (!inboundLog) {
    return { business, log: inboundLog, lead: null };
  }

  let leadId = inboundLog.lead_id;

  if (!leadId && inboundLog.processing_status === "lead_created" && inboundLog.from_email) {
    const { data: matchingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("business_id", business.id)
      .eq("source", "email")
      .eq("email", inboundLog.from_email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    leadId = (matchingLead?.id as string | undefined) ?? null;
  }

  if (!leadId) {
    return { business, log: inboundLog, lead: null };
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", business.id)
    .eq("id", leadId)
    .single();

  return {
    business,
    log: inboundLog,
    lead: lead as Lead | null
  };
}
