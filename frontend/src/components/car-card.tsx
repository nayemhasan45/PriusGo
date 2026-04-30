"use client";

import type { Car } from "@/lib/types";
import type { CarBookingBlock } from "@/lib/supabase/cars";
import { getCustomerCarAvailability } from "@/lib/supabase/cars";
import { ArrowRight, CalendarX2, CheckCircle2, Fuel, Gauge, MapPin, Users, XCircle } from "lucide-react";

export function CarCard({ car, bookingBlocks = [] }: { car: Car; bookingBlocks?: CarBookingBlock[] }) {
  const availability = getCustomerCarAvailability(car.status);
  const isAvailable = availability.canRent;

  function selectCarForRental() {
    window.dispatchEvent(new CustomEvent("priusgo:select-car", { detail: { carId: car.id } }));
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10">
      <div className={`relative min-h-64 bg-gradient-to-br ${car.imageGradient} p-5`}>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-700 shadow-sm">Šiauliai pickup</span>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black shadow-sm ${isAvailable ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"}`}>
            {isAvailable ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {availability.label}
          </span>
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/80 bg-white/75 p-6 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-4 h-16 w-48 rounded-t-[4rem] bg-slate-800" />
          <div className="mx-auto h-10 w-64 max-w-full rounded-b-3xl bg-white shadow-inner" />
          <div className="mx-auto mt-[-15px] flex max-w-56 justify-between px-7">
            <span className="size-9 rounded-full border-4 border-white bg-slate-950 shadow" />
            <span className="size-9 rounded-full border-4 border-white bg-slate-950 shadow" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black text-emerald-700"><MapPin className="size-4" /> PriusGo car option</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{car.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{car.year} • {car.brand} {car.model}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-emerald-600">€{car.pricePerDay}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">per day</p>
            <p className="mt-1 text-xs font-black text-slate-700">€100/week</p>
          </div>
        </div>

        <div className={`mt-5 rounded-2xl p-4 ${isAvailable ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
          <p className="text-sm font-black">{availability.label}</p>
          <p className="mt-1 text-sm font-semibold opacity-80">{availability.description}</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-sm font-semibold text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-3"><Fuel className="mb-1 size-4 text-emerald-600" />{car.fuelType}</div>
          <div className="rounded-2xl bg-slate-50 p-3"><Gauge className="mb-1 size-4 text-emerald-600" />{car.transmission}</div>
          <div className="rounded-2xl bg-slate-50 p-3"><Users className="mb-1 size-4 text-emerald-600" />{car.seats} seats</div>
        </div>

        <ul className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          {car.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-600" />{feature}</li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-sm font-black text-slate-900"><CalendarX2 className="size-4 text-amber-600" /> Unavailable dates</p>
            <span className="text-xs font-bold text-slate-500">per car</span>
          </div>
          {bookingBlocks.length === 0 ? (
            <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">No blocked dates yet. This car is open for new rental dates.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {bookingBlocks.slice(0, 4).map((block) => (
                <div key={`${block.startDate}-${block.endDate}`} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                  {block.startDate} → {block.endDate}
                </div>
              ))}
              {bookingBlocks.length > 4 && <p className="text-xs font-bold text-slate-500">+{bookingBlocks.length - 4} more unavailable date ranges</p>}
            </div>
          )}
        </div>

        {isAvailable ? (
          <button type="button" onClick={selectCarForRental} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700">
            Rent this car <ArrowRight className="size-4" />
          </button>
        ) : (
          <button disabled className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-5 py-4 text-sm font-black text-slate-500">
            Not available for rent
          </button>
        )}
      </div>
    </article>
  );
}
