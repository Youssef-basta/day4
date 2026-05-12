// Admin auth: JWT cookie sessions encoding userId + role + exp.
// Backed by the admin_users table (bcrypt password hashes). An optional
// ADMIN_PASSWORD legacy single-password fallback exists, but only when
// explicitly set in env — there's no hardcoded default password.

import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "./types";

export const ADMIN_COOKIE = "kbs_admin";

const SESSION_TTL_HOURS = 8;

export type AdminSession = {
  userId: string;
  email: string;
  role: AdminRole;
};

/**
 * Returns the legacy single-password fallback, or `null` if not configured.
 * When `null`, the legacy login path is disabled and only admin_users
 * credentials are accepted.
 */
export function getAdminPassword(): string | null {
  const raw = process.env.ADMIN_PASSWORD;
  if (!raw || raw.length < 4) return null;
  return raw;
}

function sessionSecret(): Uint8Array {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "SESSION_SECRET (>=32 chars) is required. Set it in your environment."
    );
  }
  return new TextEncoder().encode(raw);
}

export async function signSession(payload: AdminSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_HOURS}h`)
    .sign(sessionSecret());
}

export async function verifySession(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      (payload.role === "owner" || payload.role === "manager")
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function maxAgeSeconds() {
  return SESSION_TTL_HOURS * 60 * 60;
}

/** Cookie security flags shared by every session write. */
export function sessionCookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
