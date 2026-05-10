import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminOverview } from "@/components/admin-overview";

export default function AdminPage() {
  return (
    <AdminShell
      title="Operations dashboard"
      description="A daily command center for approvals, pickups, returns, deposits, and fleet readiness."
      actions={
        <>
          <Link href="/admin/bookings" className="rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#090b10] transition hover:bg-[#ff6a3d] hover:text-white">
            Manage bookings
          </Link>
          <Link href="/admin/cars" className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-black text-white/70 transition hover:border-[#ff6a3d]/50 hover:text-white">
            Manage fleet
          </Link>
        </>
      }
    >
      <AdminOverview />
    </AdminShell>
  );
}
