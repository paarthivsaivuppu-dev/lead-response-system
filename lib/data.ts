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

  return {
    business,
    logs: (data ?? []) as InboundEmailLog[]
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

  if (!inboundLog?.lead_id) {
    return { business, log: inboundLog, lead: null };
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", business.id)
    .eq("id", inboundLog.lead_id)
    .single();

  return {
    business,
    log: inboundLog,
    lead: lead as Lead | null
  };
}
