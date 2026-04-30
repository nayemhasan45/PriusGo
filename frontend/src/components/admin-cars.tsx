"use client";

import { CarFront, Loader2, Save, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCarStatusTone, groupBookingBlocksByCar, mapCarRowToCar, type CarBookingBlockRow, type CarRow } from "@/lib/supabase/cars";
import { createClient } from "@/lib/supabase/client";
import type { Car, CarStatus } from "@/lib/types";

const carColumns = "id,name,brand,model,year,fuel_type,transmission,seats,price_per_day,image_url,status,created_at";

export function AdminCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [blocksByCar, setBlocksByCar] = useState<ReturnType<typeof groupBookingBlocksByCar>>({});
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingCarId, setUpdatingCarId] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableCount = useMemo(() => cars.filter((car) => car.status === "available").length, [cars]);

  async function loadAdminCars() {
    setIsLoading(true);
    setError(null);
    setNeedsLogin(false);
    setIsForbidden(false);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured. Add .env.local first.");

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session?.user) {
        setNeedsLogin(true);
        setCars([]);
        return;
      }

      const user = sessionData.session.user;
      setAdminEmail(user.email ?? null);

      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profileError) throw profileError;

      if (profile?.role !== "admin") {
        setIsForbidden(true);
        setCars([]);
        return;
      }

      const { data: carRows, error: carsError } = await supabase.from("cars").select(carColumns).order("name", { ascending: true });
      if (carsError) throw carsError;
      setCars(((carRows ?? []) as CarRow[]).map(mapCarRowToCar));

      const { data: blockRows, error: blocksError } = await supabase.from("car_booking_blocks").select("car_id,start_date,end_date,status");
      if (!blocksError) setBlocksByCar(groupBookingBlocksByCar((blockRows ?? []) as CarBookingBlockRow[]));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load cars.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadAdminCars);
  }, []);

  async function updateCar(carId: string, values: { pricePerDay?: number; status?: CarStatus }) {
    setUpdatingCarId(carId);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");

      const updateValues: Record<string, number | string> = {};
      if (values.pricePerDay !== undefined) updateValues.price_per_day = values.pricePerDay;
      if (values.status !== undefined) updateValues.status = values.status;

      const { data, error: updateError } = await supabase.from("cars").update(updateValues).eq("id", carId).select(carColumns).single();
      if (updateError) throw updateError;

      const updatedCar = mapCarRowToCar(data as CarRow);
      setCars((current) => current.map((car) => (car.id === carId ? updatedCar : car)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update car.");
    } finally {
      setUpdatingCarId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-slate-600">
        <Loader2 className="mr-3 size-5 animate-spin" /> Loading fleet...
      </div>
    );
  }

  if (needsLogin) {
    return <AccessCard title="Admin login required" description="Sign in with the account that has the admin role." />;
  }

  if (isForbidden) {
    return <AccessCard title="Admin access only" description={`${adminEmail ?? "This account"} is signed in, but it is not marked as admin.`} tone="danger" />;
  }

  return (
    <div className="grid gap-6">
      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Fleet cars" value={cars.length} />
        <MetricCard label="Available now" value={availableCount} />
        <MetricCard label="Blocked rental ranges" value={Object.values(blocksByCar).flat().length} />
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5" />
            <p className="font-black">Fleet admin active{adminEmail ? ` — ${adminEmail}` : ""}</p>
          </div>
          <Link href="/admin/bookings" className="rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-800 hover:bg-emerald-100">
            Manage bookings
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {cars.map((car) => (
          <CarAdminCard key={car.id} car={car} blocks={blocksByCar[car.id] ?? []} isUpdating={updatingCarId === car.id} onUpdate={updateCar} />
        ))}
      </div>
    </div>
  );
}

function CarAdminCard({ car, blocks, isUpdating, onUpdate }: { car: Car; blocks: ReturnType<typeof groupBookingBlocksByCar>[string]; isUpdating: boolean; onUpdate: (carId: string, values: { pricePerDay?: number; status?: CarStatus }) => void }) {
  const [price, setPrice] = useState(String(car.pricePerDay));
  const [status, setStatus] = useState<CarStatus>(car.status);

  const parsedPrice = Number(price);
  const canSave = Number.isFinite(parsedPrice) && parsedPrice > 0;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><CarFront className="size-6" /></span>
          <div>
            <h2 className="text-xl font-black text-slate-950">{car.name}</h2>
            <p className="text-sm text-slate-500">{car.year} • {car.brand} {car.model}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getCarStatusTone(car.status)}`}>{car.status}</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Price per day
          <input value={price} onChange={(event) => setPrice(event.target.value)} type="number" min={1} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Car status
          <select value={status} onChange={(event) => setStatus(event.target.value as CarStatus)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
            <option value="available">available</option>
            <option value="unavailable">unavailable</option>
            <option value="maintenance">maintenance</option>
          </select>
        </label>
      </div>

      <button disabled={isUpdating || !canSave} onClick={() => onUpdate(car.id, { pricePerDay: parsedPrice, status })} className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
        {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save car
      </button>

      <div className="mt-6 rounded-3xl bg-slate-50 p-4">
        <p className="text-sm font-black text-slate-800">Rental calendar</p>
        {blocks.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No approved rental blocks yet.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {blocks.map((block) => (
              <div key={`${block.startDate}-${block.endDate}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                {block.startDate} → {block.endDate} <span className="text-emerald-700">({block.status})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function AccessCard({ title, description, tone = "default" }: { title: string; description: string; tone?: "default" | "danger" }) {
  const danger = tone === "danger";
  return (
    <div className={`rounded-3xl border p-10 text-center ${danger ? "border-red-200 bg-red-50" : "border-dashed border-slate-300 bg-white"}`}>
      <h2 className={`text-2xl font-black ${danger ? "text-red-800" : "text-slate-950"}`}>{title}</h2>
      <p className={`mt-3 ${danger ? "text-red-700" : "text-slate-600"}`}>{description}</p>
      {!danger && <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 font-black text-white hover:bg-emerald-700">Sign in</Link>}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
