"use client";

import { CalendarDays, CarFront, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { dateRangeOverlapsBlocks, estimateBookingPrice } from "@/lib/booking";
import { cars as fallbackCars } from "@/lib/cars";
import { buildBookingInsert } from "@/lib/supabase/bookings";
import { mapCarRowToCar, type CarBookingBlock, type CarBookingBlockRow, type CarRow } from "@/lib/supabase/cars";
import { createClient } from "@/lib/supabase/client";
import { BookingDatePicker } from "@/components/booking-date-picker";
import type { BookingRequest, Car } from "@/lib/types";

const bookingSchema = z.object({
  carId: z.string().min(1, "Choose a car"),
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  pickupLocation: z.string().min(2, "Pickup location is required"),
  pickupTime: z.string().min(1, "Pickup time is required"),
  returnTime: z.string().min(1, "Return time is required"),
  drivingLicenseConfirmed: z.boolean().refine(Boolean, "Confirm your valid driving license"),
  rentalRulesAccepted: z.boolean().refine(Boolean, "Accept the rental rules"),
  bookingNotFinalAcknowledged: z.boolean().refine(Boolean, "Confirm the booking is not final until admin confirms"),
  message: z.string().optional(),
});

const carColumns = "id,name,brand,model,year,fuel_type,transmission,seats,price_per_day,image_url,status,maintenance_note,next_available_date,created_at";
const pricePerWeek = 100;

const DRAFT_KEY = "priusgo:booking-draft";

type BookingDraft = {
  carId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  pickupLocation?: string;
  pickupTime?: string;
  returnTime?: string;
  drivingLicenseConfirmed?: boolean;
  rentalRulesAccepted?: boolean;
  bookingNotFinalAcknowledged?: boolean;
  message?: string;
};

export function BookingForm() {
  const [draft] = useState<BookingDraft | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (!saved) return null;
      sessionStorage.removeItem(DRAFT_KEY);
      return JSON.parse(saved) as BookingDraft;
    } catch { return null; }
  });

  const [availableCars, setAvailableCars] = useState<Car[]>(fallbackCars.filter((car) => car.status === "available"));
  const [selectedCarId, setSelectedCarId] = useState(draft?.carId ?? "");
  const [bookingBlocks, setBookingBlocks] = useState<CarBookingBlock[]>([]);
  const [startDate, setStartDate] = useState(draft?.startDate ?? "");
  const [endDate, setEndDate] = useState(draft?.endDate ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
      setSelectedCarId((current) => {
        if (current !== carId) {
          setStartDate("");
          setEndDate("");
        }
        return carId;
      });
      setSuccess(false);
      setError(null);
    }

    window.addEventListener("priusgo:select-car", handleCarSelection);
    return () => window.removeEventListener("priusgo:select-car", handleCarSelection);
  }, []);

  useEffect(() => {
    async function loadBlocks() {
      if (!selectedCarId) { setBookingBlocks([]); return; }
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase
        .from("car_booking_blocks")
        .select("car_id,start_date,end_date,status")
        .eq("car_id", selectedCarId);
      const blocks = data ? (data as CarBookingBlockRow[]).map((r) => ({ startDate: r.start_date, endDate: r.end_date, status: r.status })) : [];
      setBookingBlocks(blocks);
      if (startDate && endDate && dateRangeOverlapsBlocks(startDate, endDate, blocks)) {
        setEndDate("");
        setError("Those dates now overlap an existing booking. Please choose a different end date.");
      }
    }
    void loadBlocks();
  }, [selectedCarId, startDate, endDate]);

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
        pickupTime: String(formData.get("pickupTime") ?? ""),
        returnTime: String(formData.get("returnTime") ?? ""),
        drivingLicenseConfirmed: formData.get("drivingLicenseConfirmed") === "on",
        rentalRulesAccepted: formData.get("rentalRulesAccepted") === "on",
        bookingNotFinalAcknowledged: formData.get("bookingNotFinalAcknowledged") === "on",
        message: String(formData.get("message") ?? ""),
      });

      const car = availableCars.find((item) => item.id === values.carId);
      if (!car) throw new Error("Selected car was not found");
      if (dateRangeOverlapsBlocks(values.startDate, values.endDate, bookingBlocks)) {
        throw new Error("This car is already rented for those dates. Choose another car or different dates.");
      }

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
        pickupTime: values.pickupTime,
        returnTime: values.returnTime,
        drivingLicenseConfirmed: values.drivingLicenseConfirmed,
        rentalRulesAccepted: values.rentalRulesAccepted,
        bookingNotFinalAcknowledged: values.bookingNotFinalAcknowledged,
        message: values.message,
        estimatedTotal: estimateBookingPrice(car.pricePerDay, values.startDate, values.endDate, { pricePerWeek }),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const supabase = createClient();
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
            carId: selectedCarId,
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            startDate: values.startDate,
            endDate: values.endDate,
            pickupLocation: values.pickupLocation,
            pickupTime: values.pickupTime,
            returnTime: values.returnTime,
            drivingLicenseConfirmed: values.drivingLicenseConfirmed,
            rentalRulesAccepted: values.rentalRulesAccepted,
            bookingNotFinalAcknowledged: values.bookingNotFinalAcknowledged,
            message: values.message,
          }));
          setIsRedirecting(true);
          window.location.href = `/login?redirectTo=${encodeURIComponent("/#booking")}`;
          return;
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
    <div id="booking" className="relative rounded-[2rem] bg-[#161616] p-6 text-white ring-1 ring-white/5 sm:p-8">
      {isRedirecting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-[#161616]/90 backdrop-blur-sm">
          <Loader2 className="size-10 animate-spin text-[#ff3600]" />
          <p className="text-sm font-semibold text-white/70">Taking you to login...</p>
        </div>
      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-[#161616] p-8 ring-1 ring-white/10 shadow-2xl text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#ff3600]/15 ring-1 ring-[#ff3600]/30">
              <CheckCircle2 className="size-10 text-[#ff3600]" />
            </div>
            <h3 className="mt-6 font-heading text-2xl font-black text-white">Booking request sent!</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Your rental request has been submitted. We&apos;ll review it and get back to you to confirm the details.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="flex-1 inline-flex items-center justify-center rounded-full bg-[#ff3600] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#cc2b00]"
              >
                View my bookings
              </Link>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="flex-1 inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
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
            Booking is car-specific. Pick an available car from the fleet above, then this form will lock to that exact car.
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

        <Field label="Full name"><input name="fullName" required placeholder="Al Amin" defaultValue={draft?.fullName ?? ""} /></Field>
        <Field label="Email"><input name="email" required type="email" placeholder="you@email.com" defaultValue={draft?.email ?? ""} /></Field>
        <Field label="Phone"><input name="phone" required placeholder="+370 ..." defaultValue={draft?.phone ?? ""} /></Field>
        <Field label="Pickup location"><input name="pickupLocation" required defaultValue={draft?.pickupLocation ?? "Šiauliai"} /></Field>
        <Field label="Pickup time"><input name="pickupTime" required type="time" defaultValue={draft?.pickupTime ?? ""} /></Field>
        <Field label="Return time"><input name="returnTime" required type="time" defaultValue={draft?.returnTime ?? ""} /></Field>

        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="endDate" value={endDate} />
        <div className="md:col-span-2">
          <BookingDatePicker
            blocks={bookingBlocks}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        <div className="md:col-span-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-white/70">Before submitting, confirm:</p>
          <div className="mt-4 grid gap-3">
            <CheckItem
              name="drivingLicenseConfirmed"
              label="I have a valid driving license and can present it when needed."
              defaultChecked={draft?.drivingLicenseConfirmed ?? false}
            />
            <CheckItem
              name="rentalRulesAccepted"
              label="I accept PriusGo rental rules, pickup/return terms, and deposit conditions."
              defaultChecked={draft?.rentalRulesAccepted ?? false}
            />
            <CheckItem
              name="bookingNotFinalAcknowledged"
              label="I understand this booking is not final until the admin confirms it."
              defaultChecked={draft?.bookingNotFinalAcknowledged ?? false}
            />
          </div>
        </div>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-white/60">Message</span>
          <textarea name="message" defaultValue={draft?.message ?? ""} className="min-h-28 rounded-2xl border border-white/8 bg-white/8 px-4 py-3 text-white outline-none ring-[#ff3600] transition placeholder:text-white/25 focus:ring-2" placeholder="Pickup time, rental purpose, questions..." />
        </label>

        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/5 md:col-span-2">
          <p className="text-sm text-white/50">Estimated total</p>
          <p className="mt-1 font-heading text-4xl font-black text-[#ff3600]">€{estimatedTotal}</p>
          <p className="mt-1.5 text-xs text-white/35">Weekly discount applied automatically: €{pricePerWeek}/week + daily rate for extra days.</p>
        </div>

        <button disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff3600] px-6 py-4 font-semibold text-white transition hover:bg-[#cc2b00] disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2">
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
      <div className="[&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-2xl [&_input]:border [&_input]:border-white/8 [&_input]:bg-white/8 [&_input]:px-4 [&_input]:py-3 [&_input]:text-white [&_input]:outline-none [&_input]:ring-[#ff3600] [&_input]:transition [&_input]:placeholder:text-white/25 [&_input]:focus:ring-2">{children}</div>
    </label>
  );
}

function CheckItem({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white/75 transition hover:border-white/20">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 size-4 rounded border-white/20 bg-transparent text-[#ff3600] focus:ring-[#ff3600]"
      />
      <span className="leading-relaxed">{label}</span>
    </label>
  );
}
