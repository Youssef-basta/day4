export type ServiceTier = "standard" | "premium" | "signature";

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceKwd: number;
  description?: string;
  tier?: ServiceTier;
};

export type Addon = {
  id: string;
  name: string;
  priceKwd: number;
  durationMin: number;
  description?: string;
};

export type Slot = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  isOpen: boolean;
};

export type BookingStatus = "pending" | "done" | "cancelled";

export type PaymentMethod = "visa" | "knet" | "cash";
export type PaymentStatus = "paid" | "unpaid";

export type Booking = {
  id: string;
  ref: string;
  customerName: string;
  phone: string;
  serviceId: string;
  addonIds: string[];
  slotId: string;
  notes?: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cardLast4?: string;
  createdAt: string;
};
