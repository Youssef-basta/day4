import type { Database } from "@/lib/supabase/database.types";
import type {
  Addon,
  Booking,
  Drink,
  Service,
  Slot,
  Staff,
  StudioSettings,
  Testimonial,
} from "@/lib/types";

type ServiceRow         = Database["public"]["Tables"]["services"]["Row"];
type AddonRow           = Database["public"]["Tables"]["addons"]["Row"];
type SlotRow            = Database["public"]["Tables"]["slots"]["Row"];
type BookingRow         = Database["public"]["Tables"]["bookings"]["Row"];
type StudioSettingsRow  = Database["public"]["Tables"]["studio_settings"]["Row"];
type TestimonialRow     = Database["public"]["Tables"]["testimonials"]["Row"];
type DrinkRow           = Database["public"]["Tables"]["drinks"]["Row"];
type StaffRow           = Database["public"]["Tables"]["staff"]["Row"];

export function mapService(r: ServiceRow): Service {
  return {
    id: r.id,
    name: r.name,
    durationMin: r.duration_min,
    priceKwd: r.price_kwd,
    description: r.description ?? undefined,
    tier: (r.tier ?? undefined) as Service["tier"],
    // is_active was added in a later migration — default to true for older rows
    isActive: (r as ServiceRow & { is_active?: boolean }).is_active ?? true,
  };
}

export function mapAddon(r: AddonRow): Addon {
  return {
    id: r.id,
    name: r.name,
    durationMin: r.duration_min,
    priceKwd: r.price_kwd,
    description: r.description ?? undefined,
  };
}

export function mapSlot(r: SlotRow): Slot {
  return {
    id: r.id,
    date: r.date,
    time: r.time.slice(0, 5),
    isOpen: r.is_open,
  };
}

export function mapBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    ref: r.ref,
    customerName: r.customer_name,
    phone: r.phone,
    serviceId: r.service_id,
    addonIds: r.addon_ids,
    slotId: r.slot_id,
    notes: r.notes ?? undefined,
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    cardLast4: r.card_last4 ?? undefined,
    cancellationReason:
      (r.cancellation_reason as Booking["cancellationReason"]) ?? undefined,
    drinkOrders: Array.isArray(r.drink_orders) ? r.drink_orders : [],
    staffId:
      (r as BookingRow & { staff_id?: string | null }).staff_id ?? undefined,
    createdAt: r.created_at,
  };
}

export function mapStaff(r: StaffRow): Staff {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? undefined,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  };
}

export function mapDrink(r: DrinkRow): Drink {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    priceKwd: r.price_kwd,
    temperature: r.temperature,
  };
}

export function mapStudioSettings(r: StudioSettingsRow): StudioSettings {
  return {
    brandName: r.brand_name,
    heroKicker: r.hero_kicker ?? undefined,
    heroHeadline1: r.hero_headline_1 ?? undefined,
    heroHeadline2: r.hero_headline_2 ?? undefined,
    heroSubheading: r.hero_subheading ?? undefined,
    feature1Title: r.feature_1_title ?? undefined,
    feature1Hint: r.feature_1_hint ?? undefined,
    feature2Title: r.feature_2_title ?? undefined,
    feature2Hint: r.feature_2_hint ?? undefined,
    feature3Title: r.feature_3_title ?? undefined,
    feature3Hint: r.feature_3_hint ?? undefined,
    addressLine1: r.address_line_1 ?? undefined,
    addressLine2: r.address_line_2 ?? undefined,
    hoursLine1: r.hours_line_1 ?? undefined,
    hoursLine2: r.hours_line_2 ?? undefined,
    phone: r.phone ?? undefined,
    phoneHint: r.phone_hint ?? undefined,
    phonePlaceholder: r.phone_placeholder ?? undefined,
    graceMin: r.grace_min,
  };
}

export function mapTestimonial(r: TestimonialRow): Testimonial {
  return {
    id: r.id,
    quote: r.quote,
    author: r.author,
    rating: r.rating,
  };
}
