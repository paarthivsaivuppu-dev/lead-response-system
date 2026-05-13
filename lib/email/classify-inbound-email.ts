export type InboundEmailClassification =
  | "enquiry"
  | "non_enquiry"
  | "verification"
  | "unsure";

export type InboundEmailClassificationResult = {
  classification: InboundEmailClassification;
  reason: string;
};

type ClassifyInboundEmailInput = {
  fromEmail: string | null;
  fromName: string | null;
  subject: string | null;
  textBody: string | null;
  htmlBodyText: string | null;
};

function includesAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

export function classifyInboundEmail({
  fromEmail,
  fromName,
  subject,
  textBody,
  htmlBodyText
}: ClassifyInboundEmailInput): InboundEmailClassificationResult {
  const combined = [fromEmail, fromName, subject, textBody, htmlBodyText]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  if (
    includesAny(combined, [
      "gmail forwarding confirmation",
      "confirm forwarding",
      "confirmation code",
      "please click the link below to confirm the request",
      "forwarding confirmation",
      "forwarding address",
      "google received a request to automatically forward"
    ]) ||
    (includesAny(combined, ["gmail", "google"]) &&
      includesAny(combined, ["forwarding", "confirmation"]))
  ) {
    return {
      classification: "verification",
      reason: "Looks like a Gmail or Google forwarding confirmation email."
    };
  }

  if (
    includesAny(combined, [
      "unsubscribe",
      "newsletter",
      "receipt",
      "tax invoice",
      "invoice attached",
      "delivery notification",
      "calendar invitation",
      "meeting invite",
      "limited time offer",
      "promotion",
      "sale ends",
      "mail delivery subsystem",
      "delivery status notification",
      "no-reply",
      "noreply"
    ])
  ) {
    return {
      classification: "non_enquiry",
      reason: "Looks like an operational, marketing, receipt, delivery, or automated email."
    };
  }

  if (
    includesAny(combined, [
      "book",
      "booking",
      "appointment",
      "availability",
      "available",
      "consultation",
      "consult",
      "service",
      "treatment",
      "price",
      "pricing",
      "quote",
      "cost",
      "next step",
      "interested in",
      "enquiry",
      "inquiry"
    ])
  ) {
    return {
      classification: "enquiry",
      reason: "Email appears to ask about booking, availability, services, pricing, or next steps."
    };
  }

  return {
    classification: "unsure",
    reason: "Could not confidently classify the email, so it should be reviewed."
  };
}
