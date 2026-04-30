"use client";

import { CalendarDays, CarFront, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { estimateBookingPrice } from "@/lib/booking";
import { cars as fallbackCars } from "@/lib/cars";
import { buildBookingInsert } from "@/lib/supabase/bookings";
import { mapCarRowToCar, type CarRow } from "@/lib/supabase/cars";
import { createClient } from "@/lib/supabase/client";
import type { BookingRequest, Car } from "@/lib/types";

const bookingSchema = z.object({
  carId: z.string().min(1, "Choose a car"),
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  pickupLocation: z.string().min(2, "Pickup location is required"),
  message: z.string().optional(),
});

const carColumns = "id,name,brand,model,year,fuel_type,transmission,seats,price_per_day,image_url,status,created_at";
const pricePerWeek = 100;

export function BookingForm() {
  const [availableCars, setAvailableCars] = useState<Car[]>(fallbackCars.filter((car) => car.status === "available"));
  const [selectedCarId, setSelectedCarId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [success, setSuccess] = useState(false);
  const [savedToSupabase, setSavedToSupabase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCar = availableCars.find((car) => car.id === selectedCarId);
  const supabaseReady = Boolean(createClient());

  useEffect(() => {
    async function loadAvailableCars() {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error: carsError } = await supabase.from("cars").select(carColumns).eq("status", "available").order("name", { ascending: true });
      if (carsError || !data) return;

      const mappedCars = (data as CarRow[]).map(mapCarRowToCar);
      setAvailableCars(mappedCars);
      setSelectedCarId((current) => (mappedCars.some((car) => car.id === current) ? current : ""));
    }

    void loadAvailableCars();
  }, []);

  useEffect(() => {
    function handleCarSelection(event: Event) {
      const customEvent = event as CustomEvent<{ carId?: string }>;
      const carId = customEvent.detail?.carId;
      if (!carId) return;
      setSelectedCarId(carId);
      setSuccess(false);
      setError(null);
    }

    window.addEventListener("priusgo:select-car", handleCarSelection);
    return () => window.removeEventListener("priusgo:select-car", handleCarSelection);
  }, []);

  const estimatedTotal = useMemo(() => {
    if (!selectedCar || !startDate || !endDate) return 0;
    try {
      return estimateBookingPrice(selectedCar.pricePerDay, startDate, endDate, { pricePerWeek });
    } catch {
      return 0;
    }
  }, [selectedCar, startDate, endDate]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setSavedToSupabase(false);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const values = bookingSchema.parse({
        carId: selectedCarId,
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        startDate: String(formData.get("startDate") ?? ""),
        endDate: String(formData.get("endDate") ?? ""),
        pickupLocation: String(formData.get("pickupLocation") ?? ""),
        message: String(formData.get("message") ?? ""),
      });

      const car = availableCars.find((item) => item.id === values.carId);
      if (!car) throw new Error("Selected car was not found");

      const booking: BookingRequest = {
        id: crypto.randomUUID(),
        carId: car.id,
        carName: car.name,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        startDate: values.startDate,
        endDate: values.endDate,
        pickupLocation: values.pickupLocation,
        message: values.message,
        estimatedTotal: estimateBookingPrice(car.pricePerDay, values.startDate, values.endDate, { pricePerWeek }),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const supabase = createClient();
      if (supabase) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) {
          throw new Error("Please sign in before submitting a real booking request.");
        }

        const { data: isAvailable, error: availabilityError } = await supabase.rpc("car_is_available", {
          selected_car_id: values.carId,
          requested_start_date: values.startDate,
          requested_end_date: values.endDate,
        });
        if (!availabilityError && isAvailable === false) {
          throw new Error("This car is already rented for those dates. Choose another car or different dates.");
        }

        const { error: insertError } = await supabase
          .from("bookings")
          .insert(buildBookingInsert({ ...values, estimatedTotal: booking.estimatedTotal }, userData.user.id));
        if (insertError) throw insertError;
        setSavedToSupabase(true);
      } else {
        const saved = JSON.parse(localStorage.getItem("priusgo-bookings") ?? "[]") as BookingRequest[];
        localStorage.setItem("priusgo-bookings", JSON.stringify([booking, ...saved]));
      }

      setSuccess(true);
      form.reset();
      setStartDate("");
      setEndDate("");
    } catch (caughtError) {
      if (caughtError instanceof z.ZodError) {
        setError(caughtError.issues[0]?.message ?? "Please check the form.");
      } else {
        setError(caughtError instanceof Error ? caughtError.message : "Booking failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div id="booking" className="rounded-[2rem] bg-[#161616] p-6 text-white ring-1 ring-white/5 sm:p-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="rounded-2xl bg-[#ff3600] p-3 text-white"><CalendarDays className="size-6" /></div>
        <div>
          <h2 className="font-heading text-2xl font-black">Request your rental</h2>
          <p className="mt-1.5 text-sm text-white/50">
            {supabaseReady ? "Sign in first, then submit your rental request." : "Demo mode — add Supabase keys for real backend storage."}
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
          <div className="flex items-center gap-3"><CheckCircle2 className="size-5" /> Booking request saved {savedToSupabase ? "to Supabase" : "locally"}.</div>
          <Link href="/dashboard" className="mt-2 inline-flex text-emerald-200 underline underline-offset-4">Check dashboard</Link>
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-500/10 p-4 text-sm font-semibold text-red-300 ring-1 ring-red-500/20">{error}</div>
      )}

      {!selectedCar ? (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-6 text-center sm:p-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#ff3600] text-white">
            <CarFront className="size-7" />
          </div>
          <h3 className="mt-5 font-heading text-2xl font-black text-white">Choose a car from the fleet first</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55">
            Booking is car-specific. Pick MJO146, MHP235, or another available car from the fleet, then this form will lock to that exact car.
          </p>
          <a href="#cars" className="mt-6 inline-flex rounded-full bg-[#ff3600] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#cc2b00]">
            View fleet
          </a>
        </div>
      ) : (
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
        <input type="hidden" name="carId" value={selectedCar.id} />

        <div className="md:col-span-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Selected car</p>
              <h3 className="mt-2 font-heading text-2xl font-black text-white">
                {selectedCar.plateNumber ?? selectedCar.id.toUpperCase()} — {selectedCar.name}
              </h3>
              <p className="mt-1 text-sm text-white/50">
                {selectedCar.year} · {selectedCar.fuelType} · {selectedCar.transmission} · {selectedCar.seats} seats
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-heading text-3xl font-black text-[#ff3600]">€{selectedCar.pricePerDay}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/45">per day · €{pricePerWeek}/week</p>
            </div>
          </div>
          <a href="#cars" className="mt-4 inline-flex text-sm font-semibold text-white/65 underline underline-offset-4 transition hover:text-white">
            Change car
          </a>
        </div>

        <Field label="Full name"><input name="fullName" required placeholder="Al Amin" /></Field>
        <Field label="Email"><input name="email" required type="email" placeholder="you@email.com" /></Field>
        <Field label="Phone"><input name="phone" required placeholder="+370 ..." /></Field>
        <Field label="Pickup location"><input name="pickupLocation" required defaultValue="Šiauliai" /></Field>
        <Field label="Start date"><input name="startDate" required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></Field>
        <Field label="End date"><input name="endDate" required type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></Field>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-white/60">Message</span>
          <textarea name="message" className="min-h-28 rounded-2xl border border-white/8 bg-white/8 px-4 py-3 text-white outline-none ring-[#ff3600] transition placeholder:text-white/25 focus:ring-2" placeholder="Pickup time, rental purpose, questions..." />
        </label>

        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/5 md:col-span-2">
          <p className="text-sm text-white/50">Estimated total</p>
          <p className="mt-1 font-heading text-4xl font-black text-[#ff3600]">€{estimatedTotal}</p>
          <p className="mt-1.5 text-xs text-white/35">Weekly discount applied automatically: €{pricePerWeek}/week + daily rate for extra days.</p>
        </div>

        <button disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff3600] px-6 py-4 font-semibold text-white transition hover:bg-[#cc2b00] disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2">
          {isSubmitting && <Loader2 className="size-5 animate-spin" />} Submit rental request for {selectedCar.plateNumber ?? selectedCar.id.toUpperCase()}
        </button>
      </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>> }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/60">{label}</span>
      <div className="[&_input]:w-full [&_input]:rounded-2xl [&_input]:border [&_input]:border-white/8 [&_input]:bg-white/8 [&_input]:px-4 [&_input]:py-3 [&_input]:text-white [&_input]:outline-none [&_input]:ring-[#ff3600] [&_input]:transition [&_input]:placeholder:text-white/25 [&_input]:focus:ring-2">{children}</div>
    </label>
  );
}
