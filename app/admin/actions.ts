"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapBooking } from "@/lib/db/map";
import { requireAdmin, requireOwner } from "@/lib/db/admin";
import type {
  AdminRole,
  BookingStatus,
  DrinkOrder,
  PaymentMethod,
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
  await requireOwner();
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
  await requireOwner();
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
  await requireOwner();
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
  await requireOwner();
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
  await requireOwner();
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
  await requireOwner();
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
  await requireOwner();
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

// ────────────────────────────────────────────────────────────────────
// Walk-in booking — admin creates a booking on behalf of a customer
// (e.g. somebody walks in without using the customer site).
// ────────────────────────────────────────────────────────────────────

export type AdminCreateBookingInput = {
  customerName: string;
  /** Accepts +96550001234 or 50001234 — normalized server-side. */
  phone: string;
  serviceId: string;
  addonIds: string[];
  drinkOrders: DrinkOrder[];
  slotId: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  /** Skip the gateway and mark this booking as paid immediately. */
  markPaid?: boolean;
  staffId?: string;
};

export async function adminCreateBookingAction(input: AdminCreateBookingInput) {
  await requireAdmin();
  const supabase = createAdminClient();

  // Normalize phone: 8-digit local → +965XXXXXXXX, else use as-is.
  const digits = input.phone.replace(/\D/g, "");
  const phone =
    digits.length === 8
      ? `+965${digits}`
      : digits.length === 11 && digits.startsWith("965")
      ? `+${digits}`
      : input.phone.trim();

  const { data, error } = await supabase.rpc("create_booking", {
    p_customer_name: input.customerName,
    p_phone: phone,
    p_service_id: input.serviceId,
    p_addon_ids: input.addonIds,
    p_slot_id: input.slotId,
    p_notes: input.notes ?? null,
    p_payment_method: input.paymentMethod,
    p_card_last4: null,
    p_drink_orders: input.drinkOrders.filter((d) => d.qty > 0),
  });

  if (error) {
    if (error.message.includes("slot_unavailable")) {
      throw new Error("That slot was just taken — please pick another.");
    }
    if (error.message.includes("slot_not_found")) {
      throw new Error("That slot no longer exists.");
    }
    throw error;
  }

  const booking = mapBooking(data as never);

  // Optional follow-ups: mark paid + assign staff. The RPC sets visa/knet
  // bookings as 'pending' for the gateway flow; for an admin-created
  // booking we skip the gateway and let the admin decide whether to mark
  // it paid right now (e.g. they collected cash on entry).
  const updates: {
    payment_status?: "paid";
    staff_id?: string;
  } = {};
  if (input.markPaid) updates.payment_status = "paid";
  if (input.staffId) updates.staff_id = input.staffId;
  if (Object.keys(updates).length > 0) {
    await supabase.from("bookings").update(updates).eq("id", booking.id);
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/bookings/${booking.id}`);
}

// ────────────────────────────────────────────────────────────────────
// Admin user management (owner-only)
// ────────────────────────────────────────────────────────────────────

type AdminUserInput = {
  email: string;
  password?: string;
  role: AdminRole;
  isActive?: boolean;
};

function validateAdminUser(input: AdminUserInput, requirePassword: boolean) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Valid email is required");
  }
  if (requirePassword) {
    if (!input.password || input.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
  } else if (input.password && input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (input.role !== "owner" && input.role !== "manager") {
    throw new Error("Role must be owner or manager");
  }
}

export async function createAdminUserAction(input: AdminUserInput) {
  await requireOwner();
  validateAdminUser(input, true);
  const supabase = createAdminClient();
  const password_hash = await bcrypt.hash(input.password!, 10);
  const { error } = await supabase.from("admin_users").insert({
    email: input.email.trim().toLowerCase(),
    password_hash,
    role: input.role,
    is_active: input.isActive ?? true,
  });
  if (error) throw error;
  revalidatePath("/admin/users");
}

export async function updateAdminUserAction(
  id: string,
  input: AdminUserInput
) {
  const session = await requireOwner();
  validateAdminUser(input, false);

  const supabase = createAdminClient();

  // Prevent the last active owner from demoting / deactivating themselves
  // into a state where no owner is left.
  if (
    session.userId === id &&
    (input.role !== "owner" || input.isActive === false)
  ) {
    throw new Error(
      "You can't demote or deactivate your own owner account. Promote another owner first."
    );
  }

  const update: {
    email: string;
    role: AdminRole;
    is_active: boolean;
    updated_at: string;
    password_hash?: string;
  } = {
    email: input.email.trim().toLowerCase(),
    role: input.role,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };
  if (input.password) {
    update.password_hash = await bcrypt.hash(input.password, 10);
  }

  const { error } = await supabase
    .from("admin_users")
    .update(update)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/users");
}

export async function deleteAdminUserAction(id: string) {
  const session = await requireOwner();
  if (session.userId === id) {
    throw new Error("You can't delete your own account.");
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/users");
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
