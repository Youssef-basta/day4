// Customer-side JWT session, separate from the admin session. Cookie name and
// payload shape are different so the two systems never alias.

import { SignJWT, jwtVerify } from "jose";

export const CUSTOMER_COOKIE = "kbs_customer";

const SESSION_TTL_DAYS = 30;

export type CustomerSession = {
  phone: string;
  name: string;
  email?: string;
};

function sessionSecret(): Uint8Array {
  const raw = process.env.SESSION_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "SESSION_SECRET (>=32 chars) is required. Set it in your environment."
    );
  }
  return new TextEncoder().encode(raw);
}

export async function signCustomerSession(payload: CustomerSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(sessionSecret());
}

export async function verifyCustomerSession(
  token: string | undefined | null
): Promise<CustomerSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    if (typeof payload.phone === "string" && typeof payload.name === "string") {
      return {
        phone: payload.phone,
        name: payload.name,
        email: typeof payload.email === "string" ? payload.email : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function customerMaxAgeSeconds() {
  return SESSION_TTL_DAYS * 24 * 60 * 60;
}

/** Cookie security flags shared by every customer-session write. */
export function customerCookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
