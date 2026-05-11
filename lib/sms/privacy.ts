const sensitiveTerms = [
  "acne",
  "acne scarring",
  "scar",
  "scars",
  "scarring",
  "pigmentation",
  "stretch mark",
  "stretch marks",
  "hair loss",
  "symptom",
  "symptoms",
  "condition",
  "conditions",
  "diagnosis",
  "diagnoses",
  "medication",
  "medications",
  "medicine",
  "pain",
  "rash",
  "infection",
  "body",
  "face",
  "neck",
  "chest",
  "back",
  "legs",
  "arms"
];

const vagueTerms = ["unknown", "your enquiry", "enquiry", "not provided"];

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getPrivacySafeServiceLabel(service: string | null | undefined) {
  const value = service?.trim().replace(/\s+/g, " ");

  if (!value) {
    return null;
  }

  const lowerValue = value.toLowerCase();

  if (vagueTerms.includes(lowerValue)) {
    return null;
  }

  const baseService = value
    .split(/\s+(?:for|about|with|regarding|because of|due to)\s+/i)[0]
    .trim();
  const lowerBaseService = baseService.toLowerCase();

  if (!baseService || vagueTerms.includes(lowerBaseService)) {
    return null;
  }

  if (sensitiveTerms.some((term) => lowerBaseService.includes(term))) {
    return null;
  }

  return titleCase(baseService);
}
