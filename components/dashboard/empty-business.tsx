export function EmptyBusiness() {
  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-slate-950">
        No business connected yet
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Your account is working, but it is not connected to a business record.
        In Phase 1, connect it by adding a row in the business_users table. The
        seed file includes an example you can copy.
      </p>
    </section>
  );
}
