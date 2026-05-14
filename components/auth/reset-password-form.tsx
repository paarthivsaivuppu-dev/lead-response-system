"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ResetPasswordFormProps = {
  code?: string;
  urlError?: string;
};

export function ResetPasswordForm({ code, urlError }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(urlError ?? null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      const supabase = createClient();

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          code
        );

        if (exchangeError && isMounted) {
          setError(
            "This password reset link is invalid or has expired. Please request a new reset link."
          );
        }
      } else {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session && isMounted) {
          setError(
            "This password reset link is invalid or has expired. Please request a new reset link."
          );
        }
      }

      if (isMounted) {
        setReady(true);
      }
    }

    prepareRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [code]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="app-label" htmlFor="password">
          New password
        </label>
        <input
          className="app-input mt-2"
          disabled={!ready || success}
          id="password"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={password}
        />
      </div>

      <div>
        <label className="app-label" htmlFor="confirm_password">
          Confirm password
        </label>
        <input
          className="app-input mt-2"
          disabled={!ready || success}
          id="confirm_password"
          minLength={6}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Re-enter your new password"
          required
          type="password"
          value={confirmPassword}
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-800">
          Your password has been updated. You can now continue to your
          dashboard.
        </p>
      ) : null}

      <Button className="w-full" disabled={!ready || loading || success} type="submit">
        {loading ? "Updating..." : "Update password"}
      </Button>

      <p className="text-center text-sm text-muted">
        {success ? (
          <Link
            className="font-medium text-accent underline-offset-4 hover:underline"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        ) : (
          <Link
            className="font-medium text-accent underline-offset-4 hover:underline"
            href="/auth/forgot-password"
          >
            Request a new link
          </Link>
        )}
      </p>
    </form>
  );
}
