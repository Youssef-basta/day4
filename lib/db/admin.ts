import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapBooking, mapService, mapAddon, mapDrink, mapSlot } from "./map";
import type { Booking, Service, Addon, Drink, Slot } from "@/lib/types";

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
