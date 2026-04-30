import type { Car, CarStatus } from "@/lib/types";
import type { BookingStatus } from "./bookings";

export type CarRow = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  price_per_day: number | string;
  image_url: string | null;
  status: CarStatus;
  created_at: string;
};

export type CarBookingBlockRow = {
  car_id: string;
  start_date: string;
  end_date: string;
  status: Extract<BookingStatus, "approved" | "completed">;
};

export type CarBookingBlock = {
  startDate: string;
  endDate: string;
  status: CarBookingBlockRow["status"];
};

export type BookingBlocksByCar = Record<string, CarBookingBlock[]>;

const gradients = [
  "from-emerald-100 via-white to-sky-100",
  "from-slate-100 via-white to-emerald-100",
  "from-zinc-100 via-white to-cyan-100",
  "from-stone-100 via-white to-lime-100",
];

export function mapCarRowToCar(row: CarRow): Car {
  const gradientIndex = Math.abs(hashString(row.id)) % gradients.length;

  const plateNumber = getPlateNumber(row.id, row.name);

  return {
    id: row.id,
    name: plateNumber ? `Toyota Prius ${plateNumber}` : row.name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    seats: row.seats,
    pricePerDay: Number(row.price_per_day),
    status: row.status,
    imageGradient: gradients[gradientIndex],
    imageUrl: row.image_url ?? "/images/prius-fleet.jpg",
    plateNumber,
    features: ["Hybrid economy", row.transmission, `${row.seats} seats`, "Daily rental"],
  };
}

export function groupBookingBlocksByCar(rows: CarBookingBlockRow[]): BookingBlocksByCar {
  return rows.reduce<BookingBlocksByCar>((grouped, row) => {
    grouped[row.car_id] ??= [];
    grouped[row.car_id].push({
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
    });
    return grouped;
  }, {});
}

export function getCarStatusTone(status: CarStatus) {
  const tones: Record<CarStatus, string> = {
    available: "bg-emerald-100 text-emerald-800",
    unavailable: "bg-amber-100 text-amber-800",
    maintenance: "bg-red-100 text-red-800",
  };

  return tones[status];
}

export function getCustomerCarAvailability(status: CarStatus) {
  if (status === "available") {
    return {
      label: "Available",
      description: "Ready to rent. Choose dates and request this car directly.",
      canRent: true,
      tone: "available" as const,
    };
  }

  return {
    label: "Not available",
    description: status === "maintenance" ? "This car is under maintenance right now." : "This car is not accepting rental requests right now.",
    canRent: false,
    tone: "not-available" as const,
  };
}

function hashString(value: string) {
  return value.split("").reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function getPlateNumber(id: string, name: string) {
  const legacyPlateNumbers: Record<string, string> = {
    "toyota-prius-white-2014": "MJO146",
    "toyota-prius-silver-2015": "MHP235",
  };
  const platePattern = /\b[A-Z]{3}\d{3}\b/;
  return legacyPlateNumbers[id] ?? name.match(platePattern)?.[0] ?? id.match(platePattern)?.[0];
}
