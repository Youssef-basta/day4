import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CUSTOMER_COOKIE,
  verifyCustomerSession,
  type CustomerSession,
} from "@/lib/customer-auth";
import type { CustomerProfile, TimeBand } from "@/lib/types";

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  return verifyCustomerSession(token);
}

export async function getCustomerProfile(
  phone: string
): Promise<CustomerProfile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    phone: data.phone,
    name: data.name ?? undefined,
    email: data.email ?? undefined,
    hasAccount: Boolean(data.password_hash),
    isVip: data.is_vip,
    notes: data.notes ?? undefined,
    favoriteServiceIds: data.favorite_service_ids ?? [],
    preferredTimeBand: (data.preferred_time_band ?? "any") as TimeBand,
    smsOptIn: data.sms_opt_in,
    emailOptIn: data.email_opt_in,
  };
}
