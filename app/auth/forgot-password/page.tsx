import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="app-card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Enter your account email and we’ll send you a password reset link.
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
