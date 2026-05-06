"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  BookingStatus,
  DrinkOrder,
  ServiceTier,
  StudioSettings,
} from "@/lib/types";

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
    .update({
      status,
      cancellation_reason: becomesCancelled ? "admin" : null,
    })
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
  input: {
    serviceId: string;
    addonIds: string[];
    drinkOrders?: DrinkOrder[];
  }
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

  const cleanedDrinks = (input.drinkOrders ?? [])
    .filter((d) => d && typeof d.id === "string" && d.qty > 0)
    .map((d) => ({ id: d.id, qty: Math.min(99, Math.floor(d.qty)) }));
  if (cleanedDrinks.length > 0) {
    const ids = Array.from(new Set(cleanedDrinks.map((d) => d.id)));
    const { data: validDrinks, error: drinkErr } = await supabase
      .from("drinks")
      .select("id")
      .in("id", ids);
    if (drinkErr) throw drinkErr;
    if ((validDrinks?.length ?? 0) !== ids.length) {
      throw new Error("One or more drinks do not exist");
    }
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      service_id: input.serviceId,
      addon_ids: cleanedAddons,
      drink_orders: cleanedDrinks,
    })
    .eq("id", bookingId);
  if (error) throw error;

  revalidatePath("/admin", "layout");
}

// ────────────────────────────────────────────────────────────────────
// Customer admin
// ────────────────────────────────────────────────────────────────────

export async function toggleVipAction(phone: string, isVip: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .upsert(
      { phone, is_vip: isVip, updated_at: new Date().toISOString() },
      { onConflict: "phone" }
    );
  if (error) throw error;
  revalidatePath("/admin/customers");
}

export async function setCustomerNotesAction(phone: string, notes: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .upsert(
      {
        phone,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone" }
    );
  if (error) throw error;
  revalidatePath("/admin/customers");
}

// ────────────────────────────────────────────────────────────────────
// Service catalog admin
// ────────────────────────────────────────────────────────────────────

type ServiceInput = {
  id: string;
  name: string;
  durationMin: number;
  priceKwd: number;
  description?: string;
  tier?: ServiceTier;
  sortOrder?: number;
  isActive?: boolean;
};

function validateServiceInput(input: ServiceInput) {
  if (!/^[a-z0-9_-]+$/.test(input.id)) {
    throw new Error("Service ID must be lowercase letters, numbers, _ or -");
  }
  if (!input.name.trim()) throw new Error("Name is required");
  if (input.durationMin <= 0) throw new Error("Duration must be > 0 min");
  if (input.priceKwd < 0) throw new Error("Price must be >= 0");
}

export async function createServiceAction(input: ServiceInput) {
  validateServiceInput(input);
  const supabase = createAdminClient();
  const { error } = await supabase.from("services").insert({
    id: input.id,
    name: input.name.trim(),
    duration_min: input.durationMin,
    price_kwd: input.priceKwd,
    description: input.description?.trim() || null,
    tier: input.tier ?? null,
    sort_order: input.sortOrder ?? 100,
    is_active: input.isActive ?? true,
  });
  if (error) throw error;
  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
}

export async function updateServiceAction(input: ServiceInput) {
  validateServiceInput(input);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: input.name.trim(),
      duration_min: input.durationMin,
      price_kwd: input.priceKwd,
      description: input.description?.trim() || null,
      tier: input.tier ?? null,
      sort_order: input.sortOrder ?? 100,
      is_active: input.isActive ?? true,
    })
    .eq("id", input.id);
  if (error) throw error;
  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
}

export async function deleteServiceAction(id: string) {
  const supabase = createAdminClient();
  // Try hard delete; if FK blocks because past bookings reference it,
  // fall back to soft delete (is_active = false).
  const del = await supabase.from("services").delete().eq("id", id);
  if (del.error) {
    const soft = await supabase
      .from("services")
      .update({ is_active: false })
      .eq("id", id);
    if (soft.error) throw soft.error;
  }
  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
}

// ────────────────────────────────────────────────────────────────────
// Staff admin
// ────────────────────────────────────────────────────────────────────

type StaffInput = {
  id: string;
  name: string;
  phone?: string;
  isActive?: boolean;
  sortOrder?: number;
};

function validateStaffInput(input: StaffInput) {
  if (!/^[a-z0-9_-]+$/.test(input.id)) {
    throw new Error("Staff ID must be lowercase letters, numbers, _ or -");
  }
  if (!input.name.trim()) throw new Error("Name is required");
}

export async function createStaffAction(input: StaffInput) {
  validateStaffInput(input);
  const supabase = createAdminClient();
  const { error } = await supabase.from("staff").insert({
    id: input.id,
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    is_active: input.isActive ?? true,
    sort_order: input.sortOrder ?? 100,
  });
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

export async function updateStaffAction(input: StaffInput) {
  validateStaffInput(input);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("staff")
    .update({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 100,
    })
    .eq("id", input.id);
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

export async function deleteStaffAction(id: string) {
  const supabase = createAdminClient();
  // Hard-delete first; FK on bookings.staff_id is ON DELETE SET NULL so this
  // is safe — past bookings just lose the assignment. Soft-delete fallback
  // for any other constraint failure (shouldn't happen).
  const del = await supabase.from("staff").delete().eq("id", id);
  if (del.error) {
    const soft = await supabase
      .from("staff")
      .update({ is_active: false })
      .eq("id", id);
    if (soft.error) throw soft.error;
  }
  revalidatePath("/admin", "layout");
}

export async function assignBookingStaffAction(
  bookingId: string,
  staffId: string | null
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ staff_id: staffId })
    .eq("id", bookingId);
  if (error) throw error;
  revalidatePath("/admin", "layout");
}

// ────────────────────────────────────────────────────────────────────
// Studio settings admin
// ────────────────────────────────────────────────────────────────────

export async function updateSettingsAction(
  input: Partial<StudioSettings>
) {
  const supabase = createAdminClient();
  if (!input.brandName || !input.brandName.trim()) {
    throw new Error("Brand name is required");
  }
  if (input.graceMin !== undefined && input.graceMin < 0) {
    throw new Error("Grace minutes must be >= 0");
  }

  const row = {
    brand_name: input.brandName.trim(),
    hero_kicker: input.heroKicker?.trim() || null,
    hero_headline_1: input.heroHeadline1?.trim() || null,
    hero_headline_2: input.heroHeadline2?.trim() || null,
    hero_subheading: input.heroSubheading?.trim() || null,
    feature_1_title: input.feature1Title?.trim() || null,
    feature_1_hint: input.feature1Hint?.trim() || null,
    feature_2_title: input.feature2Title?.trim() || null,
    feature_2_hint: input.feature2Hint?.trim() || null,
    feature_3_title: input.feature3Title?.trim() || null,
    feature_3_hint: input.feature3Hint?.trim() || null,
    address_line_1: input.addressLine1?.trim() || null,
    address_line_2: input.addressLine2?.trim() || null,
    hours_line_1: input.hoursLine1?.trim() || null,
    hours_line_2: input.hoursLine2?.trim() || null,
    phone: input.phone?.trim() || null,
    phone_hint: input.phoneHint?.trim() || null,
    phone_placeholder: input.phonePlaceholder?.trim() || null,
    grace_min: input.graceMin ?? 30,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("studio_settings")
    .update(row)
    .eq("id", 1);
  if (error) throw error;

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
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
