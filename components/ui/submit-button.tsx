"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
};

export function SubmitButton({
  children,
  pendingText,
  className,
  variant = "primary"
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-disabled={pending}
      className={className}
      disabled={pending}
      type="submit"
      variant={variant}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
