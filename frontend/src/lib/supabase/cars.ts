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

export type AdminCarInsertInput = {
  plateNumber: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  imageUrl?: string;
  status: CarStatus;
};

export type AdminCarInsertRow = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  price_per_day: number;
  image_url: string;
  status: CarStatus;
};

const defaultPriusImageUrl = "/images/prius-fleet.jpg";

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

export function buildAdminCarInsert(input: AdminCarInsertInput): AdminCarInsertRow {
  const plateNumber = input.plateNumber.trim().toUpperCase();

  return {
    id: plateNumber,
    name: input.name.trim() || `Toyota Prius ${plateNumber}`,
    brand: input.brand.trim() || "Toyota",
    model: input.model.trim() || "Prius",
    year: input.year,
    fuel_type: input.fuelType.trim() || "Hybrid petrol",
    transmission: input.transmission.trim() || "Automatic",
    seats: input.seats,
    price_per_day: input.pricePerDay,
    image_url: input.imageUrl?.trim() || defaultPriusImageUrl,
    status: input.status,
  };
}

export function buildCarImageObjectPath(plateNumber: string, fileName: string) {
  const safePlateNumber = plateNumber.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "") || "CAR";
  const lastDotIndex = fileName.lastIndexOf(".");
  const rawName = lastDotIndex >= 0 ? fileName.slice(0, lastDotIndex) : fileName;
  const rawExtension = lastDotIndex >= 0 ? fileName.slice(lastDotIndex + 1) : "jpg";
  const safeName = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "photo";
  const safeExtension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `cars/${safePlateNumber}/${safeName}.${safeExtension}`;
}

export function getSupabaseErrorMessage(caughtError: unknown, fallback: string) {
  if (caughtError instanceof Error) return caughtError.message;

  const message = getErrorText(caughtError);
  if (!message) return fallback;

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("row-level security") || lowerMessage.includes("permission denied") || getErrorCode(caughtError) === "42501") {
    return "Database blocked this action: admin insert/update policy is missing or your profile is not admin. Run backend/supabase-schema.sql in Supabase and make sure your profile role is admin.";
  }

  if (lowerMessage.includes("duplicate key") || lowerMessage.includes("already exists")) {
    return "This plate number already exists in the fleet.";
  }

  return message;
}

function getErrorText(caughtError: unknown) {
  if (typeof caughtError === "string") return caughtError;
  if (!caughtError || typeof caughtError !== "object") return null;

  const maybeError = caughtError as { message?: unknown; details?: unknown; hint?: unknown };
  return [maybeError.message, maybeError.details, maybeError.hint].filter((value): value is string => typeof value === "string" && value.length > 0).join(" ") || null;
}

function getErrorCode(caughtError: unknown) {
  if (!caughtError || typeof caughtError !== "object") return null;
  const maybeError = caughtError as { code?: unknown };
  return typeof maybeError.code === "string" ? maybeError.code : null;
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
