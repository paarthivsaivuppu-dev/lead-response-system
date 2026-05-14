import { PageLoading } from "@/components/ui/page-loading";

export default function AdminBusinessesLoading() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-7xl">
        <PageLoading title="Loading pilot businesses" rows={6} />
      </section>
    </main>
  );
}
