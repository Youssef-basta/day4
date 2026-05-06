"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapBooking } from "@/lib/db/map";
import type { DrinkOrder, PaymentMethod } from "@/lib/types";

export type CreateBookingInput = {
  customerName: string;
  phone: string;
  serviceId: string;
  addonIds: string[];
  drinkOrders: DrinkOrder[];
  slotId: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
};

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function createBookingAction(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_customer_name: input.customerName,
    p_phone: input.phone,
    p_service_id: input.serviceId,
    p_addon_ids: input.addonIds,
    p_slot_id: input.slotId,
    p_notes: input.notes ?? null,
    p_payment_method: input.paymentMethod,
    p_card_last4: input.cardLast4 ?? null,
    p_drink_orders: input.drinkOrders.filter((d) => d.qty > 0),
  });

  if (error) {
    if (error.message.includes("slot_unavailable")) {
      return { ok: false, error: "That slot was just taken — please pick another." };
    }
    if (error.message.includes("slot_not_found")) {
      return { ok: false, error: "That slot no longer exists." };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  // RPC returns a single row matching `bookings`.
  const booking = mapBooking(data as never);
  redirect(`/confirmation/${booking.id}`);
}
