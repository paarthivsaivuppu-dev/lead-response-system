import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-lg border border-border bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">
          Lead Response System
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">
          Simple lead tracking for fast follow-up.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Phase 1 sets up authentication, business records, protected dashboard
          pages, and lead status management.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            href="/auth/login"
          >
            Log in
          </Link>
          <Link
            className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-slate-700"
            href="/auth/signup"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
