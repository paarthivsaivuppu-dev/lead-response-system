export function EmptyBusiness() {
  return (
    <section className="app-card p-6">
      <h2 className="text-lg font-semibold text-foreground">
        No business connected yet
      </h2>
      <p className="mt-2 max-w-2xl muted-copy">
        Your account is working, but it is not connected to a business record.
        In Phase 1, connect it by adding a row in the business_users table. The
        seed file includes an example you can copy.
      </p>
    </section>
  );
}
