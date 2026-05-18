const UNKNOWN_SERVICE_VALUES = new Set([
  "",
  "unknown",
  "not specified",
  "not provided",
  "n/a",
  "na",
  "none",
  "unsure",
  "your enquiry",
  "enquiry",
  "treatment enquiry",
  "service",
  "services",
  "consultation",
  "appointment",
  "no service captured yet"
]);

function cleanServiceValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normaliseServiceName(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const service = cleanServiceValue(value);

  if (UNKNOWN_SERVICE_VALUES.has(service)) {
    return null;
  }

  // Examples:
  // "laser treatment consultation" -> "Laser Treatment"
  // "skin consult" -> "Skin Consultation"
  // "microneedling consultation" -> "Microneedling"
  if (service.includes("laser") && service.includes("hair removal")) {
    return "Hair Removal";
  }

  if (service.includes("hair removal")) {
    return "Hair Removal";
  }

  if (service.includes("laser")) {
    return "Laser Treatment";
  }

  if (service.includes("skin consult")) {
    return "Skin Consultation";
  }

  if (service.includes("microneedling")) {
    return "Microneedling";
  }

  if (service.includes("hydrafacial") || service.includes("hydra facial")) {
    return "Hydrafacial";
  }

  if (service.includes("injectable")) {
    return "Injectables Consultation";
  }

  if (service.includes("cosmetic consult")) {
    return "Cosmetic Consultation";
  }

  if (service.includes("acne treatment")) {
    return "Acne Treatment";
  }

  if (service.includes("pigmentation")) {
    return "Pigmentation Consultation";
  }

  if (service.includes("teeth whitening") || service.includes("tooth whitening")) {
    return "Teeth Whitening";
  }

  return titleCase(service);
}

export function normaliseServiceNames(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  const parts = value
    .split(/[,/;+]|\s+\band\b\s+/i)
    .map((part) => normaliseServiceName(part))
    .filter((service): service is string => Boolean(service));

  return Array.from(new Set(parts));
}
