export type ServiceTier = "standard" | "premium" | "signature";

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceKwd: number;
  description?: string;
  tier?: ServiceTier;
  isActive: boolean;
};

export type Customer = {
  phone: string;
  isVip: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminRole = "owner" | "manager";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
};

export type Staff = {
  id: string;
  name: string;
  phone?: string;
  isActive: boolean;
  sortOrder: number;
};

export type CustomerSummary = {
  phone: string;
  displayName: string;
  bookingCount: number;
  doneCount: number;
  cancelledCount: number;
  totalSpentKwd: number;
  lastVisit?: string;
  isVip: boolean;
  notes?: string;
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

export type DrinkTemperature = "hot" | "cold";

export type Drink = {
  id: string;
  name: string;
  description?: string;
  priceKwd: number;
  temperature: DrinkTemperature;
};

export type DrinkOrder = {
  id: string;
  qty: number;
};

export type CancellationReason = "admin" | "no_show";

export type StudioSettings = {
  brandName: string;
  heroKicker?: string;
  heroHeadline1?: string;
  heroHeadline2?: string;
  heroSubheading?: string;
  feature1Title?: string;
  feature1Hint?: string;
  feature2Title?: string;
  feature2Hint?: string;
  feature3Title?: string;
  feature3Hint?: string;
  addressLine1?: string;
  addressLine2?: string;
  hoursLine1?: string;
  hoursLine2?: string;
  phone?: string;
  phoneHint?: string;
  phonePlaceholder?: string;
  graceMin: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  rating: number;
};

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
  cancellationReason?: CancellationReason;
  drinkOrders: DrinkOrder[];
  staffId?: string;
  createdAt: string;
};
