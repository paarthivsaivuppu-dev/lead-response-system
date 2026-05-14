export function RestrictedAccess() {
  return (
    <section className="app-card mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Pilot access paused
      </h1>
      <p className="mt-3 muted-copy">
        Your ClinicResponse AI pilot is currently paused or expired. Contact
        ClinicResponse AI to continue access.
      </p>
    </section>
  );
}
