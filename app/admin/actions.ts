"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingStatus } from "@/lib/types";

export async function updateBookingStatusAction(
  bookingId: string,
  status: BookingStatus
) {
  const supabase = createAdminClient();

  const { data: booking, error: readErr } = await supabase
    .from("bookings")
    .select("slot_id, status")
    .eq("id", bookingId)
    .maybeSingle();
  if (readErr || !booking) throw readErr ?? new Error("Booking not found");

  const wasNotCancelled = booking.status !== "cancelled";
  const becomesCancelled = status === "cancelled";

  const { error: updErr } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);
  if (updErr) throw updErr;

  if (becomesCancelled && wasNotCancelled) {
    const { error: slotErr } = await supabase
      .from("slots")
      .update({ is_open: true })
      .eq("id", booking.slot_id);
    if (slotErr) throw slotErr;
  }

  revalidatePath("/admin", "layout");
}

export async function markPaidAction(bookingId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "paid" })
    .eq("id", bookingId);
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

export async function updateBookingExtrasAction(
  bookingId: string,
  input: { serviceId: string; addonIds: string[] }
) {
  const supabase = createAdminClient();

  const { data: svc, error: svcErr } = await supabase
    .from("services")
    .select("id")
    .eq("id", input.serviceId)
    .maybeSingle();
  if (svcErr) throw svcErr;
  if (!svc) throw new Error("Service not found");

  const cleanedAddons = Array.from(new Set(input.addonIds));
  if (cleanedAddons.length > 0) {
    const { data: validAddons, error: addonErr } = await supabase
      .from("addons")
      .select("id")
      .in("id", cleanedAddons);
    if (addonErr) throw addonErr;
    if ((validAddons?.length ?? 0) !== cleanedAddons.length) {
      throw new Error("One or more add-ons do not exist");
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      service_id: input.serviceId,
      addon_ids: cleanedAddons,
    })
    .eq("id", bookingId);
  if (error) throw error;

  revalidatePath("/admin", "layout");
}

export async function toggleSlotAction(slotId: string) {
  const supabase = createAdminClient();

  const { data: slot, error: readErr } = await supabase
    .from("slots")
    .select("is_open")
    .eq("id", slotId)
    .maybeSingle();
  if (readErr || !slot) throw readErr ?? new Error("Slot not found");

  const { error } = await supabase
    .from("slots")
    .update({ is_open: !slot.is_open })
    .eq("id", slotId);
  if (error) throw error;
  revalidatePath("/admin/slots");
}
