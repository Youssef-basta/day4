import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  mapAddon,
  mapDrink,
  mapService,
  mapSlot,
  mapStudioSettings,
  mapTestimonial,
} from "./map";
import type {
  Addon,
  Drink,
  Service,
  Slot,
  StudioSettings,
  Testimonial,
} from "@/lib/types";

const FALLBACK_SETTINGS: StudioSettings = {
  brandName: "Joe Barber Studio",
  graceMin: 30,
};

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

export async function getDrinks(): Promise<Drink[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .eq("is_active", true)
    .order("temperature", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapDrink);
}

export async function getStudioSettings(): Promise<StudioSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("studio_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("getStudioSettings:", error);
    return FALLBACK_SETTINGS;
  }
  return data ? mapStudioSettings(data) : FALLBACK_SETTINGS;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getTestimonials:", error);
    return [];
  }
  return (data ?? []).map(mapTestimonial);
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
