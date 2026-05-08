import Link from "next/link";
import { DashboardBookings } from "@/components/dashboard-bookings";
import { Header } from "@/components/header";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-black uppercase tracking-[0.3em] text-emerald-600">Customer dashboard</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Your booking requests</h1>
            <p className="mt-3 text-slate-600">When Supabase keys are configured, this page loads real bookings linked to the logged-in customer.</p>
          </div>
          <Link href="/#booking" className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-700">
            New booking
          </Link>
        </div>
        <DashboardBookings />
      </section>
    </main>
  );
}
