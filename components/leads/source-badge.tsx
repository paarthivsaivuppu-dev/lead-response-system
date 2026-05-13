import { Globe2, Mail, MessageSquareText, Pencil } from "lucide-react";

const sourceStyles: Record<string, string> = {
  email: "bg-slate-50 text-slate-700 ring-slate-200",
  manual: "bg-amber-50 text-amber-800 ring-amber-200",
  sms: "bg-teal-50 text-teal-800 ring-teal-200",
  website: "bg-cyan-50 text-accent ring-cyan-200"
};

const sourceIcons = {
  email: Mail,
  manual: Pencil,
  sms: MessageSquareText,
  website: Globe2
};

function formatSource(source: string | null) {
  if (!source) {
    return "Unknown";
  }

  if (source === "website") {
    return "Website";
  }

  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function SourceBadge({ source }: { source: string | null }) {
  const normalized = source?.toLowerCase() ?? "unknown";
  const Icon = sourceIcons[normalized as keyof typeof sourceIcons];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
        sourceStyles[normalized] ?? "bg-slate-50 text-slate-700 ring-slate-200"
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {formatSource(source)}
    </span>
  );
}
