import { AdminCars } from "@/components/admin-cars";
import { Header } from "@/components/header";

export default function AdminCarsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600">Fleet management</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Admin cars</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Control rental prices, car availability, and see each car&apos;s approved rental calendar.
          </p>
        </div>
        <AdminCars />
      </section>
    </main>
  );
}
