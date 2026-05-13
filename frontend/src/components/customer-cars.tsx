"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingForm } from "@/components/booking-form";
import { CarCard } from "@/components/car-card";
import { cars as fallbackCars } from "@/lib/cars";
import { groupBookingBlocksByCar, mapCarRowToCar, type CarBookingBlockRow, type CarRow, type BookingBlocksByCar } from "@/lib/supabase/cars";
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/lib/types";

const carColumns = "id,name,brand,model,year,fuel_type,transmission,seats,price_per_day,image_url,status,maintenance_note,next_available_date,created_at";

export function CustomerCars() {
  const [cars, setCars] = useState<Car[]>(fallbackCars);
  const [blocksByCar, setBlocksByCar] = useState<BookingBlocksByCar>({});
  const [isLoading, setIsLoading] = useState(Boolean(createClient()));
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    async function loadCars() {
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data: carRows, error: carsError } = await supabase.from("cars").select(carColumns).order("name", { ascending: true });
        if (!carsError && carRows) setCars((carRows as CarRow[]).map(mapCarRowToCar));

        const { data: blockRows, error: blocksError } = await supabase.from("car_booking_blocks").select("car_id,start_date,end_date,status");
        if (!blocksError && blockRows) setBlocksByCar(groupBookingBlocksByCar(blockRows as CarBookingBlockRow[]));
      } finally {
        setIsLoading(false);
      }
    }

    void loadCars();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-[2rem] border border-[#e9e9e9] bg-white p-6 text-center text-[#616161] sm:p-10">
        <Loader2 className="mr-3 size-5 animate-spin text-[#ff3600]" /> Loading available rental cars...
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#e9e9e9] bg-white p-6 text-center sm:p-10">
        <h3 className="font-heading text-2xl font-black text-[#0b0b0b]">No cars available right now</h3>
        <p className="mt-3 text-[#616161]">Please check again later or contact PriusGo directly.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            bookingBlocks={blocksByCar[car.id] ?? []}
            onSelect={setSelectedCar}
          />
        ))}
      </div>

      {selectedCar && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Book ${selectedCar.name}`}
        >
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#161616] shadow-2xl sm:max-w-4xl sm:rounded-[2rem]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Selected fleet car</p>
                <h2 className="mt-1 font-heading text-xl font-black text-white sm:text-2xl">Book {selectedCar.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCar(null)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:text-white"
                aria-label="Close booking modal"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-[calc(92vh-84px)] overflow-y-auto p-4 sm:p-6">
              <BookingForm
                key={selectedCar.id}
                initialCar={selectedCar}
                initialBookingBlocks={blocksByCar[selectedCar.id] ?? []}
                variant="modal"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
