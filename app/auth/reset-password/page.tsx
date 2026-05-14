import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    code?: string;
    error_description?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const { code, error_description: errorDescription } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="app-card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Enter a new password for your ClinicResponse AI account.
        </p>
        <div className="mt-8">
          <ResetPasswordForm code={code} urlError={errorDescription} />
        </div>
      </section>
    </main>
  );
}
