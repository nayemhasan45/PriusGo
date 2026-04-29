export type CarStatus = "available" | "unavailable" | "maintenance";

export type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  status: CarStatus;
  imageGradient: string;
  features: string[];
};

export type BookingRequest = {
  id: string;
  carId: string;
  carName: string;
  fullName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  message?: string;
  estimatedTotal: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  createdAt: string;
};
