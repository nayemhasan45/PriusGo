import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminCars } from "@/components/admin-cars";

export default function AdminCarsPage() {
  return (
    <AdminShell
      title="Fleet readiness"
      description="Control car availability, maintenance notes, rental prices, photos, and approved booking blocks."
      actions={
        <Link href="/admin" className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-black text-white/70 transition hover:border-[#ff6a3d]/50 hover:text-white">
          Back to dashboard
        </Link>
      }
    >
      <div className="admin-legacy">
        <AdminCars />
      </div>
    </AdminShell>
  );
}
