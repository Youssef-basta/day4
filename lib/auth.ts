// Admin auth: JWT cookie sessions encoding userId + role + exp.
// Backed by the admin_users table (bcrypt password hashes). The legacy
// ADMIN_PASSWORD env var still works as a single-password fallback —
// authenticating that way grants the seeded owner identity.

import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "./types";

export const ADMIN_COOKIE = "kbs_admin";

const SESSION_TTL_HOURS = 8;

export type AdminSession = {
  userId: string;
  email: string;
  role: AdminRole;
};

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function sessionSecret(): Uint8Array {
  const raw =
    process.env.SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "joe-barber-studio-dev-only-secret-change-me";
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
