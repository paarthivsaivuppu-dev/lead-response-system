"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.push(isLogin ? "/dashboard" : "/auth/login");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={password}
        />
      </div>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Please wait..." : isLogin ? "Log in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          className="font-medium text-slate-950 underline-offset-4 hover:underline"
          href={isLogin ? "/auth/signup" : "/auth/login"}
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
