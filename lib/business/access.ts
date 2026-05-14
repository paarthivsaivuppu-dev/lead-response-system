import "server-only";

import type { Business } from "@/lib/types";

export const restrictedPilotStatuses = [
  "pilot_expired",
  "paused",
  "cancelled"
] as const;

export function isBusinessAccessible(business: Business) {
  if (
    business.pilot_status === "paid" ||
    business.subscription_status === "active"
  ) {
    return true;
  }

  if (restrictedPilotStatuses.includes(business.pilot_status as never)) {
    return false;
  }

  if (business.pilot_status === "pilot_active" && business.pilot_ends_at) {
    return new Date(business.pilot_ends_at).getTime() >= Date.now();
  }

  return true;
}

export function getDaysRemaining(date: string | null) {
  if (!date) {
    return null;
  }

  const msRemaining = new Date(date).getTime() - Date.now();

  return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
}
