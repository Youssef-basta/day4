"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  getAdminPassword,
  maxAgeSeconds,
  signSession,
} from "@/lib/auth";
import {
  findAdminUserByEmail,
  getOwnerForFallback,
} from "@/lib/db/admin";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: "Password is required." };
  }

  // 1. Try email + password against admin_users.
  if (emailRaw) {
    const user = await findAdminUserByEmail(emailRaw);
    if (user && user.is_active) {
      const ok = await bcrypt.compare(password, user.password_hash);
      if (ok) {
        const token = await signSession({
          userId: user.id,
          email: user.email,
          role: user.role,
        });
        cookies().set(ADMIN_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: maxAgeSeconds(),
        });
        redirect("/admin");
      }
    }
    // Fall through to single-password fallback if email path failed.
  }

  // 2. Backward-compat: legacy single-password fallback.
  if (password === getAdminPassword()) {
    const fallbackOwner = await getOwnerForFallback();
    if (!fallbackOwner) {
      return {
        error:
          "No active owner found in admin_users. Apply migrations and re-deploy.",
      };
    }
    const token = await signSession({
      userId: fallbackOwner.id,
      email: fallbackOwner.email,
      role: fallbackOwner.role,
    });
    cookies().set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds(),
    });
    redirect("/admin");
  }

  return { error: "Wrong email or password." };
}

export async function logoutAction() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
