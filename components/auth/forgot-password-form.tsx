"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="app-label" htmlFor="email">
          Email
        </label>
        <input
          className="app-input mt-2"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </div>

      {submitted ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-800">
          If an account exists for this email, a password reset link has been
          sent.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          className="font-medium text-accent underline-offset-4 hover:underline"
          href="/auth/login"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}
