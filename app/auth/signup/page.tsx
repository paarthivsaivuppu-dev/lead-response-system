import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start with the basic Phase 1 dashboard.
        </p>
        <div className="mt-8">
          <AuthForm mode="signup" />
        </div>
      </section>
    </main>
  );
}
