import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createLeadForBusiness } from "@/lib/leads/create-lead";
import { normalizeAustralianMobilePhone } from "@/lib/phone/normalize";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";

type ResendInboundEvent = {
  type: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
  };
};

function parseEmailAddress(value: string | undefined | null) {
  if (!value) {
    return { name: null, email: null };
  }

  const match = value.match(/^(?:"?([^"<]*)"?\s*)?<([^>]+)>$/);

  if (match) {
    return {
      name: match[1]?.trim() || null,
      email: match[2]?.trim() || null
    };
  }

  return {
    name: null,
    email: value.trim()
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getInboundAlias(addresses: string[] | undefined) {
  const firstAddress = addresses?.[0];
  const { email } = parseEmailAddress(firstAddress);
  const localPart = email?.split("@")[0]?.trim().toLowerCase();

  return localPart || null;
}

function extractAustralianMobilePhone(value: string) {
  const candidates = value.match(/(?:\+?61[\s().-]*4|0?4)[\d\s().-]{8,14}/g);

  for (const candidate of candidates ?? []) {
    const normalized = normalizeAustralianMobilePhone(candidate);

    if (normalized.ok) {
      return normalized.value;
    }
  }

  return "";
}

async function parseWebhookEvent(request: NextRequest) {
  const payload = await request.text();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (!webhookSecret) {
    // TODO: Require RESEND_WEBHOOK_SECRET before production. This fallback keeps
    // local development simple while preserving the route shape for verification.
    console.warn("Resend webhook verification skipped: RESEND_WEBHOOK_SECRET is not set.");
    return {
      event: JSON.parse(payload) as ResendInboundEvent,
      resend
    };
  }

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    throw new Error("Missing Resend webhook signature headers.");
  }

  const event = resend.webhooks.verify({
    payload,
    headers: {
      id,
      timestamp,
      signature
    },
    webhookSecret
  }) as ResendInboundEvent;

  return { event, resend };
}

export async function POST(request: NextRequest) {
  try {
    const { event, resend } = await parseWebhookEvent(request);

    if (event.type !== "email.received") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const emailId = event.data?.email_id;

    if (!emailId) {
      console.error("Resend inbound email skipped: missing email_id.");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { data: receivedEmail, error: receivedEmailError } =
      await resend.emails.receiving.get(emailId);

    if (receivedEmailError || !receivedEmail) {
      throw new Error(
        receivedEmailError?.message ?? "Could not retrieve inbound email content."
      );
    }

    const email = receivedEmail as {
      from?: string;
      to?: string[];
      subject?: string;
      text?: string;
      html?: string;
    };
    const alias = getInboundAlias(event.data?.to ?? email.to);

    if (!alias) {
      console.error("Resend inbound email skipped: no inbound alias found.");
      return NextResponse.json({ ok: true, skipped: true });
    }

    const supabase = await createClient();
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("inbound_email_alias", alias)
      .single();

    if (!business) {
      console.error(`Resend inbound email skipped: no business for alias ${alias}.`);
      return NextResponse.json({ ok: true, skipped: true });
    }

    const sender = parseEmailAddress(email.from ?? event.data?.from);
    const subject = email.subject ?? event.data?.subject ?? "No subject";
    const body = email.text?.trim() || (email.html ? stripHtml(email.html) : "");
    const originalMessage = [`Subject: ${subject}`, "", body || "No body provided."]
      .join("\n")
      .trim();

    await createLeadForBusiness({
      supabase,
      business: business as Business,
      customerName: sender.name || sender.email || "Email enquiry",
      customerPhone: extractAustralianMobilePhone(body),
      customerEmail: sender.email ?? "",
      source: "email",
      originalMessage
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Resend inbound email webhook failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
