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

const compactReadinessLabels: Record<BookingReadiness, string> = {
  booking_ready: "Ready",
  interested: "Interested",
  low_intent: "Low intent",
  needs_review: "Review"
};

export function BookingReadinessBadge({
  compact = false,
  readiness
}: {
  compact?: boolean;
  readiness: BookingReadiness | null;
}) {
  if (!readiness) {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium leading-5 text-slate-600 ring-1 ring-slate-200">
        {compact ? "Not classified" : "Not Classified"}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 ring-1 ${readinessStyles[readiness]}`}
    >
      {compact ? compactReadinessLabels[readiness] : formatBookingReadiness(readiness)}
    </span>
  );
}
