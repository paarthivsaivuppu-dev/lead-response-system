import { extractLeadDetails } from "@/lib/ai/extract-lead";
import { sendLeadNotificationEmail } from "@/lib/email/lead-notification";
import { normalizeAustralianMobilePhone } from "@/lib/phone/normalize";
import { sendCustomerAutoReply } from "@/lib/sms/customer-auto-reply";
import { sendLeadSmsNotification } from "@/lib/sms/lead-notification";
import type { Business } from "@/lib/types";

type SupabaseClient = {
  from: (table: string) => any;
};

type CreateLeadForBusinessInput = {
  supabase: SupabaseClient;
  business: Business;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  source: "manual" | "email" | "sms" | "website";
  originalMessage: string;
};

export async function createLeadForBusiness({
  supabase,
  business,
  customerName,
  customerPhone,
  customerEmail,
  source,
  originalMessage
}: CreateLeadForBusinessInput) {
  const normalizedPhone = customerPhone
    ? normalizeAustralianMobilePhone(customerPhone)
    : null;
  const storedPhone = normalizedPhone?.ok
    ? normalizedPhone.value
    : customerPhone || null;
  const invalidPhoneNote =
    normalizedPhone && !normalizedPhone.ok ? normalizedPhone.reason : null;

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      business_id: business.id,
      full_name: customerName,
      phone: storedPhone,
      email: customerEmail || null,
      source,
      status: invalidPhoneNote ? "Needs Review" : "New",
      notes: originalMessage || null
    })
    .select("id")
    .single();

  if (leadError || !lead) {
    throw new Error(leadError?.message ?? "Could not create lead.");
  }

  if (!originalMessage) {
    return { leadId: lead.id as string };
  }

  let extraction = null;

  const { error: messageError } = await supabase.from("messages").insert({
    business_id: business.id,
    lead_id: lead.id,
    direction: "inbound",
    channel: source === "sms" ? "sms" : source === "email" ? "email" : "manual",
    body: originalMessage
  });

  if (messageError) {
    throw new Error(messageError.message);
  }

  try {
    extraction = await extractLeadDetails(originalMessage);

    await supabase
      .from("leads")
      .update({
        service_requested: extraction.service_requested,
        urgency: extraction.urgency,
        intent: extraction.intent,
        ai_summary: extraction.ai_summary,
        lead_quality: extraction.lead_quality,
        recommended_next_action: extraction.recommended_next_action,
        confidence: extraction.confidence,
        ai_extracted_at: new Date().toISOString(),
        ai_extraction_error: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", lead.id)
      .eq("business_id", business.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI extraction failed.";

    await supabase
      .from("leads")
      .update({
        status: "Needs Review",
        ai_extraction_error: message,
        updated_at: new Date().toISOString()
      })
      .eq("id", lead.id)
      .eq("business_id", business.id);
  }

  try {
    await sendLeadNotificationEmail({
      to: business.notification_email,
      leadId: lead.id,
      leadName: customerName,
      phone: storedPhone,
      email: customerEmail || null,
      source,
      originalMessage,
      extraction
    });
  } catch (error) {
    console.error("Lead notification email failed:", error);
  }

  try {
    await sendLeadSmsNotification({
      to: business.notification_phone,
      businessName: business.name,
      leadName: customerName,
      phone: storedPhone,
      source,
      extraction
    });
  } catch (error) {
    console.error("Lead SMS notification failed:", error);
  }

  try {
      const customerReply = await sendCustomerAutoReply({
        leadName: customerName,
        leadPhone: normalizedPhone?.ok ? normalizedPhone.value : null,
        extraction
      });

    if (customerReply) {
      const { error: outboundMessageError } = await supabase.from("messages").insert({
        business_id: business.id,
        lead_id: lead.id,
        direction: "outbound",
        channel: "sms",
        body: customerReply
      });

      if (outboundMessageError) {
        console.error(
          "Customer SMS message history insert failed:",
          outboundMessageError
        );
      }
    }
  } catch (error) {
    console.error("Customer SMS auto-reply failed:", error);
  }

  if (invalidPhoneNote) {
    await supabase
      .from("leads")
      .update({
        status: "Needs Review",
        ai_extraction_error: invalidPhoneNote,
        updated_at: new Date().toISOString()
      })
      .eq("id", lead.id)
      .eq("business_id", business.id);
  }

  return { leadId: lead.id as string };
}
