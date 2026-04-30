"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CarCard } from "@/components/car-card";
import { cars as fallbackCars } from "@/lib/cars";
import { groupBookingBlocksByCar, mapCarRowToCar, type CarBookingBlockRow, type CarRow, type BookingBlocksByCar } from "@/lib/supabase/cars";
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/lib/types";

const carColumns = "id,name,brand,model,year,fuel_type,transmission,seats,price_per_day,image_url,status,created_at";

export function CustomerCars() {
  const [cars, setCars] = useState<Car[]>(fallbackCars);
  const [blocksByCar, setBlocksByCar] = useState<BookingBlocksByCar>({});
  const [isLoading, setIsLoading] = useState(Boolean(createClient()));

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
      <div className="flex items-center justify-center rounded-[2rem] border border-[#e9e9e9] bg-white p-10 text-[#616161]">
        <Loader2 className="mr-3 size-5 animate-spin text-[#ff3600]" /> Loading available rental cars...
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#e9e9e9] bg-white p-10 text-center">
        <h3 className="font-heading text-2xl font-black text-[#0b0b0b]">No cars available right now</h3>
        <p className="mt-3 text-[#616161]">Please check again later or contact PriusGo directly.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {cars.map((car) => <CarCard key={car.id} car={car} bookingBlocks={blocksByCar[car.id] ?? []} />)}
    </div>
  );
}
