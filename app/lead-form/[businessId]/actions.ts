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

  await createLeadForBusiness({
    supabase,
    business: business as Business,
    customerName,
    customerPhone,
    customerEmail,
    source: "website",
    originalMessage
  });

  redirect(`/lead-form/${businessId}?submitted=1`);
}
