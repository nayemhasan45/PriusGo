import type { BookingRequest } from "@/lib/types";

export type BookingStatus = BookingRequest["status"];
export type BookingLicenseCheckStatus = "pending" | "verified" | "rejected";
export type BookingPaymentStatus = "unpaid" | "deposit_paid" | "paid" | "refunded";
export type BookingPaymentMethod = "cash" | "bank" | "card" | "other";

export type BookingFormValues = {
  carId: string;
  fullName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  pickupTime: string;
  returnTime: string;
  drivingLicenseConfirmed: boolean;
  rentalRulesAccepted: boolean;
  bookingNotFinalAcknowledged: boolean;
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
  driving_license_confirmed: boolean;
  rental_rules_accepted: boolean;
  booking_not_final_acknowledged: boolean;
  license_check_status: BookingLicenseCheckStatus;
  deposit_agreed: boolean;
  pickup_time: string | null;
  return_time: string | null;
  admin_notes: string | null;
  status: "pending";
  total_estimated_price: number;
};

export type BookingReadableRow = {
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
  driving_license_confirmed: boolean;
  rental_rules_accepted: boolean;
  booking_not_final_acknowledged: boolean;
  pickup_time: string | null;
  return_time: string | null;
  status: BookingStatus;
  total_estimated_price: number | string | null;
  created_at: string;
};

export type BookingRow = BookingReadableRow & {
  license_check_status: BookingLicenseCheckStatus;
  deposit_agreed: boolean;
  admin_notes: string | null;
  payment_status: BookingPaymentStatus;
  deposit_amount: number | string | null;
  payment_method: BookingPaymentMethod | null;
  payment_notes: string | null;
  rental_total: number | string | null;
  discount_amount: number | string | null;
  extra_charge: number | string | null;
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
    driving_license_confirmed: values.drivingLicenseConfirmed,
    rental_rules_accepted: values.rentalRulesAccepted,
    booking_not_final_acknowledged: values.bookingNotFinalAcknowledged,
    license_check_status: "pending",
    deposit_agreed: false,
    pickup_time: values.pickupTime.trim() ? values.pickupTime.trim() : null,
    return_time: values.returnTime.trim() ? values.returnTime.trim() : null,
    admin_notes: null,
    status: "pending",
    total_estimated_price: values.estimatedTotal,
  };
}

export function mapBookingRowToRequest(row: BookingReadableRow): BookingRequest {
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
    pickupTime: row.pickup_time,
    returnTime: row.return_time,
    drivingLicenseConfirmed: row.driving_license_confirmed,
    rentalRulesAccepted: row.rental_rules_accepted,
    bookingNotFinalAcknowledged: row.booking_not_final_acknowledged,
    estimatedTotal: Number(row.total_estimated_price ?? 0),
    status: row.status,
    createdAt: row.created_at,
  };
}
