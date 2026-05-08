import { Header } from "@/components/header";
import { AdminBookings } from "@/components/admin-bookings";

export default function AdminBookingsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600">Admin dashboard</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Booking requests</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Review customer requests, approve bookings, reject unavailable dates, and mark rentals completed after return.
          </p>
        </div>
        <AdminBookings />
      </section>
    </main>
  );
}
