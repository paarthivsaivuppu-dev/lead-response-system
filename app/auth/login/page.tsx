import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-foreground">Log in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access your lead response dashboard.
        </p>
        <div className="mt-8">
          <AuthForm mode="login" />
        </div>
      </section>
    </main>
  );
}
