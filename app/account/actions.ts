"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CUSTOMER_COOKIE,
  customerMaxAgeSeconds,
  signCustomerSession,
} from "@/lib/customer-auth";
import { getCustomerSession } from "@/lib/db/customer";
import type { TimeBand } from "@/lib/types";

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  // Accept either 8-digit local Kuwait number or already-prefixed 11-digit.
  if (digits.length === 8) return `+965${digits}`;
  if (digits.length === 11 && digits.startsWith("965")) return `+${digits}`;
  return null;
}

function normalizeEmail(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export async function signupAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");
  const emailRaw = String(formData.get("email") ?? "");

  if (!name) return { error: "Please enter your name." };
  const phone = normalizePhone(phoneRaw);
  if (!phone) return { error: "Phone must be 8 digits." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  let email: string | null = null;
  if (emailRaw.trim()) {
    email = normalizeEmail(emailRaw);
    if (!email) return { error: "Email format looks off." };
  }

  const supabase = createAdminClient();

  const { data: existing, error: readErr } = await supabase
    .from("customers")
    .select("phone, password_hash")
    .eq("phone", phone)
    .maybeSingle();
  if (readErr) return { error: readErr.message };
  if (existing?.password_hash) {
    return {
      error:
        "An account already exists for this number. Try signing in instead.",
    };
  }

  if (email) {
    const { data: emailDupe } = await supabase
      .from("customers")
      .select("phone")
      .ilike("email", email)
      .maybeSingle();
    if (emailDupe && emailDupe.phone !== phone) {
      return { error: "That email is already registered." };
    }
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { error: upsertErr } = await supabase
    .from("customers")
    .upsert(
      {
        phone,
        name,
        email,
        password_hash,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone" }
    );
  if (upsertErr) return { error: upsertErr.message };

  const token = await signCustomerSession({
    phone,
    name,
    email: email ?? undefined,
  });
  cookies().set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: customerMaxAgeSeconds(),
  });
  redirect("/account");
}

export async function customerLoginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const phoneRaw = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");

  const phone = normalizePhone(phoneRaw);
  if (!phone) return { error: "Phone must be 8 digits." };
  if (!password) return { error: "Password is required." };

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("customers")
    .select("phone,name,email,password_hash")
    .eq("phone", phone)
    .maybeSingle();

  if (!row || !row.password_hash) {
    return { error: "Wrong phone or password." };
  }
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return { error: "Wrong phone or password." };

  const token = await signCustomerSession({
    phone: row.phone,
    name: row.name ?? "Guest",
    email: row.email ?? undefined,
  });
  cookies().set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: customerMaxAgeSeconds(),
  });
  redirect("/account");
}

export async function customerLogoutAction() {
  cookies().delete(CUSTOMER_COOKIE);
  redirect("/");
}

// ────────────────────────────────────────────────────────────────────
// Profile updates (require an active session)
// ────────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getCustomerSession();
  if (!session) throw new Error("Not signed in");
  return session;
}

export async function updateProfileAction(input: {
  name: string;
  email: string;
  preferredTimeBand: TimeBand;
  smsOptIn: boolean;
  emailOptIn: boolean;
  password?: string;
}): Promise<{ ok: true } | { error: string }> {
  const session = await requireSession();

  const name = input.name.trim();
  if (!name) return { error: "Name is required." };

  let email: string | null = null;
  if (input.email.trim()) {
    email = normalizeEmail(input.email);
    if (!email) return { error: "Email format looks off." };
  }

  const supabase = createAdminClient();

  if (email) {
    const { data: dupe } = await supabase
      .from("customers")
      .select("phone")
      .ilike("email", email)
      .maybeSingle();
    if (dupe && dupe.phone !== session.phone) {
      return { error: "That email is already in use." };
    }
  }

  const update: {
    name: string;
    email: string | null;
    preferred_time_band: TimeBand;
    sms_opt_in: boolean;
    email_opt_in: boolean;
    updated_at: string;
    password_hash?: string;
  } = {
    name,
    email,
    preferred_time_band: input.preferredTimeBand,
    sms_opt_in: input.smsOptIn,
    email_opt_in: input.emailOptIn,
    updated_at: new Date().toISOString(),
  };

  if (input.password) {
    if (input.password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    update.password_hash = await bcrypt.hash(input.password, 10);
  }

  const { error } = await supabase
    .from("customers")
    .update(update)
    .eq("phone", session.phone);
  if (error) return { error: error.message };

  // Refresh the session cookie so name/email in the header stay current.
  const token = await signCustomerSession({
    phone: session.phone,
    name,
    email: email ?? undefined,
  });
  cookies().set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: customerMaxAgeSeconds(),
  });

  revalidatePath("/account");
  return { ok: true };
}

export async function toggleFavoriteServiceAction(
  serviceId: string
): Promise<{ favoriteServiceIds: string[] } | { error: string }> {
  const session = await requireSession();
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("customers")
    .select("favorite_service_ids")
    .eq("phone", session.phone)
    .maybeSingle();

  const current = (row?.favorite_service_ids ?? []) as string[];
  const next = current.includes(serviceId)
    ? current.filter((id) => id !== serviceId)
    : [...current, serviceId];

  const { error } = await supabase
    .from("customers")
    .update({
      favorite_service_ids: next,
      updated_at: new Date().toISOString(),
    })
    .eq("phone", session.phone);
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { favoriteServiceIds: next };
}
