import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminBookings } from "@/components/admin-bookings";

export default function AdminBookingsPage() {
  return (
    <AdminShell
      title="Booking control"
      description="Review requests, approve rentals, contact customers, track deposits, and close out returns."
      actions={
        <Link href="/admin" className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-black text-white/70 transition hover:border-[#ff6a3d]/50 hover:text-white">
          Back to dashboard
        </Link>
      }
    >
      <div className="admin-legacy">
        <AdminBookings />
      </div>
    </AdminShell>
  );
}
