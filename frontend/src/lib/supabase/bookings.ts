import type { BookingRequest } from "@/lib/types";

export type BookingStatus = BookingRequest["status"];

export type BookingFormValues = {
  carId: string;
  fullName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  message?: string;
  estimatedTotal: number;
};

export type BookingInsert = {
  user_id: string;
  car_id: string;
  full_name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  message: string | null;
  status: "pending";
  total_estimated_price: number;
};

export type BookingRow = {
  id: string;
  user_id: string;
  car_id: string;
  full_name: string | null;
  email: string | null;
  phone: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  message: string | null;
  status: BookingStatus;
  total_estimated_price: number | null;
  created_at: string;
};

export function buildBookingInsert(values: BookingFormValues, userId: string): BookingInsert {
  return {
    user_id: userId,
    car_id: values.carId,
    full_name: values.fullName,
    email: values.email,
    phone: values.phone,
    start_date: values.startDate,
    end_date: values.endDate,
    pickup_location: values.pickupLocation,
    message: values.message?.trim() ? values.message.trim() : null,
    status: "pending",
    total_estimated_price: values.estimatedTotal,
  };
}

export function mapBookingRowToRequest(row: BookingRow): BookingRequest {
  return {
    id: row.id,
    carId: row.car_id,
    carName: `Toyota Prius ${row.car_id}`,
    fullName: row.full_name ?? "Customer",
    email: row.email ?? "",
    phone: row.phone,
    startDate: row.start_date,
    endDate: row.end_date,
    pickupLocation: row.pickup_location,
    message: row.message ?? undefined,
    estimatedTotal: Number(row.total_estimated_price ?? 0),
    status: row.status,
    createdAt: row.created_at,
  };
}
