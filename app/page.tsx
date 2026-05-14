import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_28%,#dff7fb_0%,#eef9fb_38%,#f7fcfd_72%)] px-6 py-10">
      <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,33,51,0.12)] backdrop-blur">
        <div className="border-b border-cyan-100 bg-cyan-50/55 px-8 py-5">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
              <Sparkles className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="text-base font-semibold text-foreground">
              ClinicResponse AI
            </span>
          </div>
        </div>

        <div className="px-8 py-9">
          <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            For clinic enquiry teams
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight text-foreground">
            A calmer way to capture, prioritise, and respond to clinic leads.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Track every enquiry, spot booking-ready customers, and keep follow-up
            visible without forcing your team into a heavy CRM.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-dark"
              href="/auth/login"
            >
              Log in
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-cyan-50 hover:text-accent"
              href="/auth/signup"
            >
              Create account
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-muted sm:grid-cols-3">
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/45 p-4">
              Lead Attention
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/45 p-4">
              Treatment Demand
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/45 p-4">
              Safe Replies
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
