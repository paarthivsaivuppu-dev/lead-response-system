"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-cyan-50 hover:text-accent"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
