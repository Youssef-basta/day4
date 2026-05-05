import type { Database } from "@/lib/supabase/database.types";
import type { Addon, Booking, Service, Slot } from "@/lib/types";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type AddonRow   = Database["public"]["Tables"]["addons"]["Row"];
type SlotRow    = Database["public"]["Tables"]["slots"]["Row"];
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export function mapService(r: ServiceRow): Service {
  return {
    id: r.id,
    name: r.name,
    durationMin: r.duration_min,
    priceKwd: r.price_kwd,
    description: r.description ?? undefined,
    tier: (r.tier ?? undefined) as Service["tier"],
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
    createdAt: r.created_at,
  };
}
