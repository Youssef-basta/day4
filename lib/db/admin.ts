import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import {
  mapBooking,
  mapService,
  mapAddon,
  mapDrink,
  mapSlot,
  mapStaff,
} from "./map";
import { bookingTotals } from "@/lib/pricing";
import type {
  AdminUser,
  Booking,
  Service,
  Addon,
  Drink,
  Slot,
  Staff,
  CustomerSummary,
} from "@/lib/types";

export async function getAllBookings(): Promise<Booking[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBooking(data) : null;
}

export async function getAllSlots(): Promise<Slot[]> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapSlot);
}

export async function getCustomers(): Promise<CustomerSummary[]> {
  const supabase = createAdminClient();

  const [
    { data: bookings, error: bErr },
    { data: services, error: sErr },
    { data: addons, error: aErr },
    { data: drinks, error: dErr },
    { data: slots, error: slErr },
    { data: customers, error: cErr },
  ] = await Promise.all([
    supabase.from("bookings").select("*"),
    supabase.from("services").select("*"),
    supabase.from("addons").select("*"),
    supabase.from("drinks").select("*"),
    supabase.from("slots").select("id,date,time"),
    supabase
      .from("customers")
      .select("phone,is_vip,notes,name,email,password_hash"),
  ]);
  if (bErr) throw bErr;
  if (sErr) throw sErr;
  if (aErr) throw aErr;
  if (dErr) throw dErr;
  if (slErr) throw slErr;
  if (cErr) throw cErr;

  const svcArr = (services ?? []).map(mapService);
  const addonArr = (addons ?? []).map(mapAddon);
  const drinkArr = (drinks ?? []).map(mapDrink);
  const slotById = new Map(
    (slots ?? []).map((s) => [s.id, `${s.date}T${s.time}`])
  );
  const customerByPhone = new Map(
    (customers ?? []).map((c) => [
      c.phone,
      {
        isVip: c.is_vip,
        notes: c.notes,
        name: c.name,
        email: c.email,
        hasAccount: Boolean(c.password_hash),
      },
    ])
  );

  const byPhone = new Map<string, CustomerSummary>();

  for (const row of bookings ?? []) {
    const b = mapBooking(row);
    const phone = b.phone;
    const totals = bookingTotals(b, svcArr, addonArr, drinkArr);
    const slotKey = slotById.get(b.slotId) ?? "";

    const existing = byPhone.get(phone);
    if (existing) {
      existing.bookingCount += 1;
      if (b.status === "done") existing.doneCount += 1;
      if (b.status === "cancelled") existing.cancelledCount += 1;
      if (b.status === "done") existing.totalSpentKwd += totals.priceKwd;
      if (slotKey > (existing.lastVisit ?? "")) {
        existing.lastVisit = slotKey;
        existing.displayName = b.customerName || existing.displayName;
      }
    } else {
      const cust = customerByPhone.get(phone);
      byPhone.set(phone, {
        phone,
        displayName: cust?.name || b.customerName || phone,
        email: cust?.email ?? undefined,
        hasAccount: cust?.hasAccount ?? false,
        bookingCount: 1,
        doneCount: b.status === "done" ? 1 : 0,
        cancelledCount: b.status === "cancelled" ? 1 : 0,
        totalSpentKwd: b.status === "done" ? totals.priceKwd : 0,
        lastVisit: slotKey || undefined,
        isVip: cust?.isVip ?? false,
        notes: cust?.notes ?? undefined,
      });
    }
  }

  return Array.from(byPhone.values()).sort((a, b) => {
    if (a.isVip !== b.isVip) return a.isVip ? -1 : 1;
    return (b.lastVisit ?? "").localeCompare(a.lastVisit ?? "");
  });
}

export async function getCustomerHistory(phone: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("phone", phone)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

// Upcoming slots (open + booked) for the customer slot picker — shows
// booked ones grayed/red so users see real availability. Limited to the
// next 14 days to keep the grid manageable.
export async function getUpcomingSlots(daysAhead = 14): Promise<Slot[]> {
  const supabase = createAdminClient();
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + daysAhead);
  const startKey = start.toISOString().slice(0, 10);
  const endKey = end.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .gte("date", startKey)
    .lte("date", endKey)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapSlot);
}

export async function getServicesAdmin(): Promise<Service[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapService);
}

export async function getAddonsAdmin(): Promise<Addon[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapAddon);
}

// ────────────────────────────────────────────────────────────────────
// Admin users
// ────────────────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email,role,is_active,created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role,
    isActive: r.is_active,
    createdAt: r.created_at,
  }));
}

export async function findAdminUserByEmail(email: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email,password_hash,role,is_active")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function findAdminUserById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email,role,is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOwnerForFallback() {
  // Used when the legacy ADMIN_PASSWORD logs in: we attribute the session
  // to the seeded owner so audit trails / role checks work consistently.
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,email,role")
    .eq("role", "owner")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCurrentAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySession(token);
}

export async function requireOwner() {
  const session = await getCurrentAdmin();
  if (!session || session.role !== "owner") {
    throw new Error("Owner role required for this action");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getCurrentAdmin();
  if (!session) {
    throw new Error("Sign in required");
  }
  return session;
}

export async function getStaffAll(): Promise<Staff[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("is_active", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStaff);
}

export async function getStaffActive(): Promise<Staff[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapStaff);
}

export async function getDrinksAdmin(): Promise<Drink[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .order("temperature", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapDrink);
}
