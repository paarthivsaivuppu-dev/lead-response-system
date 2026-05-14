"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : "Save settings"}
    </Button>
  );
}

export function SettingsSaveNotice() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = containerRef.current?.closest("form");

    if (!form) {
      return;
    }

    function markDirty() {
      setDirty(true);
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!dirty) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");

      if (!link || link.target === "_blank") {
        return;
      }

      const confirmed = window.confirm(
        "You have unsaved settings. Leave without saving?"
      );

      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function handleSubmit() {
      setDirty(false);
    }

    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", handleSubmit);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", handleSubmit);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [dirty]);

  if (!dirty) {
    return <div ref={containerRef} />;
  }

  return (
    <div
      className="sticky bottom-4 z-20 rounded-2xl border border-cyan-200 bg-white/95 p-3 shadow-soft backdrop-blur"
      ref={containerRef}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          You have unsaved settings.
        </p>
        <SaveButton />
      </div>
    </div>
  );
}
