import type { Car } from "@/lib/types";
import { Fuel, Gauge, Users, CheckCircle2 } from "lucide-react";

export function CarCard({ car }: { car: Car }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative flex h-56 items-center justify-center bg-gradient-to-br ${car.imageGradient}`}>
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
          {car.status === "available" ? "Available now" : car.status}
        </div>
        <div className="w-72 rounded-[2rem] border border-white/80 bg-white/70 p-6 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-4 h-16 w-44 rounded-t-[4rem] bg-slate-800" />
          <div className="mx-auto h-9 w-56 rounded-b-3xl bg-slate-200 shadow-inner" />
          <div className="mt-[-14px] flex justify-around px-8">
            <span className="size-8 rounded-full bg-slate-950" />
            <span className="size-8 rounded-full bg-slate-950" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-950">{car.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{car.year} • {car.brand} {car.model}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-emerald-600">€{car.pricePerDay}</p>
            <p className="text-xs font-semibold text-slate-500">per day</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-sm font-semibold text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-3"><Fuel className="mb-1 size-4 text-emerald-600" />{car.fuelType}</div>
          <div className="rounded-2xl bg-slate-50 p-3"><Gauge className="mb-1 size-4 text-emerald-600" />{car.transmission}</div>
          <div className="rounded-2xl bg-slate-50 p-3"><Users className="mb-1 size-4 text-emerald-600" />{car.seats} seats</div>
        </div>

        <ul className="mt-5 grid gap-2 text-sm text-slate-600">
          {car.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" />{feature}</li>
          ))}
        </ul>

        <a href={`#booking-${car.id}`} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700">
          Choose this car
        </a>
      </div>
    </article>
  );
}
