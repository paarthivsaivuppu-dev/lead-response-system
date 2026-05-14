import type { BookingReadiness } from "@/lib/types";

const readinessStyles: Record<BookingReadiness, string> = {
  booking_ready: "bg-teal-50 text-teal-800 ring-teal-200",
  interested: "bg-cyan-50 text-accent ring-cyan-200",
  low_intent: "bg-slate-100 text-slate-700 ring-slate-200",
  needs_review: "bg-amber-50 text-amber-800 ring-amber-200"
};

export function formatBookingReadiness(value: BookingReadiness | null) {
  if (!value) {
    return "Not Classified";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function BookingReadinessBadge({
  readiness
}: {
  readiness: BookingReadiness | null;
}) {
  if (!readiness) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
        Not Classified
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${readinessStyles[readiness]}`}
    >
      {formatBookingReadiness(readiness)}
    </span>
  );
}
