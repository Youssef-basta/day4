// Server-side wrappers for Twilio (SMS) and Resend (email) so the admin can
// nudge customers with appointment reminders. Each provider is independently
// optional — the app no-ops gracefully when its env vars are missing.
//
// Phase 1 ships the API client + readiness signal + a manual "send test"
// path. Phase 2 will add a pg_cron job that calls sendReminderBatch() on a
// schedule (24h before, 1h before, etc.).

import "server-only";

// ─────────────────────────────────────────────────────────────────
// SMS (Twilio)
// ─────────────────────────────────────────────────────────────────

export type SmsConfig = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

function smsConfig(): SmsConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !fromNumber) return null;
  return { accountSid, authToken, fromNumber };
}

export function isSmsConfigured(): boolean {
  return Boolean(smsConfig());
}

export async function sendSms(to: string, body: string) {
  const cfg = smsConfig();
  if (!cfg) {
    return { ok: false as const, skipped: true as const };
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`;
  const params = new URLSearchParams({ To: to, From: cfg.fromNumber, Body: body });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, error: text || `HTTP ${res.status}` };
  }
  const data = (await res.json()) as { sid: string };
  return { ok: true as const, sid: data.sid };
}

// ─────────────────────────────────────────────────────────────────
// Email (Resend)
// ─────────────────────────────────────────────────────────────────

export type EmailConfig = {
  apiKey: string;
  fromAddress: string;
};

function emailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  if (!apiKey || !fromAddress) return null;
  return { apiKey, fromAddress };
}

export function isEmailConfigured(): boolean {
  return Boolean(emailConfig());
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const cfg = emailConfig();
  if (!cfg) {
    return { ok: false as const, skipped: true as const };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: cfg.fromAddress,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, error: text || `HTTP ${res.status}` };
  }
  const data = (await res.json()) as { id: string };
  return { ok: true as const, id: data.id };
}

// ─────────────────────────────────────────────────────────────────
// Reminder content
// ─────────────────────────────────────────────────────────────────

export function bookingReminderSms(input: {
  brandName: string;
  customerName: string;
  ref: string;
  whenLabel: string; // e.g. "Sat, May 6 · 2:30 PM"
}) {
  const first = input.customerName.split(" ")[0] || input.customerName;
  return `Hi ${first}, this is ${input.brandName}. Reminder: ${input.whenLabel}. Ref ${input.ref}. See you soon!`;
}

export function bookingReminderEmail(input: {
  brandName: string;
  customerName: string;
  ref: string;
  whenLabel: string;
}) {
  const first = input.customerName.split(" ")[0] || input.customerName;
  return {
    subject: `${input.brandName} — appointment reminder`,
    text: `Hi ${first},\n\nThis is a reminder for your upcoming appointment at ${input.brandName}.\n\nWhen: ${input.whenLabel}\nReference: ${input.ref}\n\nSee you soon!`,
  };
}
