import Link from "next/link";
import { Header } from "@/components/header";
import { AdminOverview } from "@/components/admin-overview";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600">Admin dashboard</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Business overview</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Track the day&apos;s bookings, fleet status, and quick links to operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/bookings" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
              Manage bookings
            </Link>
            <Link href="/admin/cars" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
              Manage cars
            </Link>
          </div>
        </div>
        <AdminOverview />
      </section>
    </main>
  );
}
