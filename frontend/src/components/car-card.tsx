"use client";

import type { Car } from "@/lib/types";
import type { CarBookingBlock } from "@/lib/supabase/cars";
import { getCustomerCarAvailability } from "@/lib/supabase/cars";
import { BookingCalendar } from "@/components/booking-calendar";
import { CheckCircle2, ChevronDown, Fuel, Gauge, Users, XCircle } from "lucide-react";
import { useState } from "react";

export function CarCard({ car, bookingBlocks = [], onSelect }: { car: Car; bookingBlocks?: CarBookingBlock[]; onSelect?: (car: Car) => void }) {
  const availability = getCustomerCarAvailability(car.status);
  const isAvailable = availability.canRent;
  const plateNumber = car.plateNumber ?? car.id.toUpperCase();
  const hasMaintenanceInfo = Boolean(car.maintenanceNote || car.nextAvailableDate);
  const [showCalendar, setShowCalendar] = useState(false);

  function selectCarForRental() {
    if (!isAvailable) return;
    window.dispatchEvent(new CustomEvent("priusgo:select-car", { detail: { carId: car.id } }));
    if (onSelect) {
      onSelect(car);
    } else {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#e9e9e9] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/8">
      {/* Car image area */}
      <div className={`relative min-h-60 bg-gradient-to-br ${car.imageGradient} p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#616161] shadow-sm">
            Šiauliai pickup
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${isAvailable ? "bg-emerald-500 text-white" : "bg-[#0b0b0b] text-white"}`}>
            {isAvailable ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
            {availability.label}
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-xl backdrop-blur">
          {car.imageUrl ? (
            // Use a normal img here because admin-added cars can use local or future storage URLs.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={car.imageUrl} alt={`${car.name} rental car`} className="h-56 w-full object-cover" />
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 h-14 w-44 rounded-t-[4rem] bg-slate-700" />
              <div className="mx-auto h-9 w-60 max-w-full rounded-b-3xl bg-white shadow-inner" />
              <div className="mx-auto mt-[-13px] flex max-w-52 justify-between px-7">
                <span className="size-8 rounded-full border-4 border-white bg-[#0b0b0b] shadow" />
                <span className="size-8 rounded-full border-4 border-white bg-[#0b0b0b] shadow" />
              </div>
            </div>
          )}
        </div>

        <span className="absolute bottom-4 left-4 rounded-full bg-[#0b0b0b] px-4 py-2.5 font-heading text-base font-black tracking-[0.14em] text-white shadow-xl sm:px-5 sm:text-lg">
          {plateNumber}
        </span>
      </div>

      {/* Card body */}
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#616161]">
              {car.year} · {car.brand} {car.model}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-black tracking-tight text-[#0b0b0b]">{car.name}</h3>
          </div>
          <div className="text-right">
            <p className="font-heading text-3xl font-black text-[#ff3600]">€{car.pricePerDay}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-[#616161]">per day</p>
            <p className="mt-0.5 text-xs font-semibold text-[#0b0b0b]">€100 / week</p>
          </div>
        </div>

        <div className={`mt-5 rounded-2xl p-4 ${isAvailable ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100" : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"}`}>
          <p className="text-sm font-semibold">{availability.label}</p>
          <p className="mt-0.5 text-sm opacity-75">{availability.description}</p>
          {!isAvailable && hasMaintenanceInfo && (
            <div className="mt-3 space-y-2 border-t border-current/10 pt-3 text-sm">
              {car.maintenanceNote && <p><span className="font-bold">Maintenance:</span> {car.maintenanceNote}</p>}
              {car.nextAvailableDate && <p><span className="font-bold">Next available:</span> {car.nextAvailableDate}</p>}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-medium text-[#616161] sm:grid-cols-3">
          <div className="rounded-2xl bg-[#fff7f4] p-3">
            <Fuel className="mb-1.5 size-4 text-[#ff3600]" />{car.fuelType}
          </div>
          <div className="rounded-2xl bg-[#fff7f4] p-3">
            <Gauge className="mb-1.5 size-4 text-[#ff3600]" />{car.transmission}
          </div>
          <div className="rounded-2xl bg-[#fff7f4] p-3">
            <Users className="mb-1.5 size-4 text-[#ff3600]" />{car.seats} seats
          </div>
        </div>

        <ul className="mt-5 grid gap-2 text-sm text-[#616161] sm:grid-cols-2">
          {car.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#ff3600]" />{feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className="mt-5 flex w-full items-center justify-between rounded-2xl border border-[#e9e9e9] px-4 py-3 text-sm font-semibold text-[#616161] transition hover:border-[#ff3600]/30 hover:text-[#ff3600]"
        >
          <span>{showCalendar ? "Hide availability calendar" : "Check available dates"}</span>
          <ChevronDown className={`size-4 transition-transform duration-200 ${showCalendar ? "rotate-180" : ""}`} />
        </button>
        {showCalendar && (
          <div className="mt-3">
            <BookingCalendar blocks={bookingBlocks} />
          </div>
        )}

        {isAvailable ? (
          <button
            type="button"
            onClick={selectCarForRental}
            className="group mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#ff3600] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#cc2b00]"
            aria-label={`Choose ${car.name}`}
          >
            Choose this car
            <span className="flex size-5 items-center justify-center rounded-full bg-white/20 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 7L7 1M7 1H2M7 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        ) : (
          <button disabled className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-[#e9e9e9] px-5 py-4 text-sm font-semibold text-[#616161]">
            Not available for rent
          </button>
        )}
      </div>
    </article>
  );
}
