import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mapAddon, mapService, mapSlot } from "./map";
import type { Addon, Service, Slot } from "@/lib/types";

export async function getServices(): Promise<Service[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapService);
}

export async function getAddons(): Promise<Addon[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapAddon);
}

export async function getOpenSlots(): Promise<Slot[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("slots")
    .select("*")
    .eq("is_open", true)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapSlot);
}
