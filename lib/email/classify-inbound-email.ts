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

function findMatchingPattern(value: string, patterns: string[]) {
  return patterns.find((pattern) => value.includes(pattern));
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
    .replace(/\s+/g, " ")
    .toLowerCase();

  // Gmail forwarding setup emails need to be visible for manual setup, not treated
  // as generic verification-code noise.
  if (
    includesAny(combined, [
      "gmail forwarding confirmation",
      "confirm forwarding",
      "forwarding confirmation code",
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

  const nonEnquiryPattern = findMatchingPattern(combined, [
    "security alert",
    "new sign-in",
    "new signin",
    "sign-in was detected",
    "signin was detected",
    "google account",
    "password reset",
    "verification code",
    "confirm your email",
    "account alert",
    "login attempt",
    "invoice",
    "receipt",
    "payment confirmation",
    "newsletter",
    "unsubscribe",
    "calendar invitation",
    "delivery notification",
    "order confirmation",
    "tax invoice",
    "invoice attached",
    "meeting invite",
    "limited time offer",
    "promotion",
    "sale ends",
    "mail delivery subsystem",
    "delivery status notification",
    "no-reply",
    "noreply"
  ]);

  if (nonEnquiryPattern) {
    return {
      classification: "non_enquiry",
      reason: `Looks like an automated system, admin, security, marketing, receipt, or notification email. Matched "${nonEnquiryPattern}".`
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
