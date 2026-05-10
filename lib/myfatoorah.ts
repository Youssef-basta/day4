// Server-side wrapper around the MyFatoorah hosted-payment API.
// Docs: https://myfatoorah.readme.io/docs
//
// Activates when MYFATOORAH_API_TOKEN is set. Falls back gracefully so the
// rest of the app keeps working with the existing fake-gateway demo until
// real credentials are in place.

import "server-only";

type Env = {
  apiToken: string;
  baseUrl: string;
  callbackUrl: string;
  errorUrl: string;
};

function loadEnv(): Env | null {
  const apiToken = process.env.MYFATOORAH_API_TOKEN;
  if (!apiToken) return null;

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return {
    apiToken,
    // Test: https://apitest.myfatoorah.com  Live: https://api.myfatoorah.com
    baseUrl:
      process.env.MYFATOORAH_BASE_URL ?? "https://apitest.myfatoorah.com",
    callbackUrl:
      process.env.MYFATOORAH_CALLBACK_URL ?? `${base}/api/payment/callback`,
    errorUrl:
      process.env.MYFATOORAH_ERROR_URL ??
      `${base}/api/payment/callback?status=error`,
  };
}

export function isMyFatoorahEnabled(): boolean {
  return Boolean(process.env.MYFATOORAH_API_TOKEN);
}

type MFEnvelope<T> = {
  IsSuccess: boolean;
  Message: string;
  Data: T;
  ValidationErrors?: { Name: string; Error: string }[];
};

async function call<T>(env: Env, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${env.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${env.apiToken}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MyFatoorah ${path} HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as MFEnvelope<T>;
  if (!json.IsSuccess) {
    const errs = json.ValidationErrors?.map(
      (e) => `${e.Name}: ${e.Error}`
    ).join(", ");
    throw new Error(
      `MyFatoorah ${path}: ${json.Message}${errs ? ` — ${errs}` : ""}`
    );
  }
  return json.Data;
}

// MyFatoorah's two main hosted payment methods we expose at checkout.
// Each customer-facing option maps to one PaymentMethodId.
// Real IDs vary per merchant account — the values below are the published
// MyFatoorah test environment defaults. In production, call
// /v2/InitiatePayment with the invoice amount to discover live IDs.
export type GatewayMethod = "visa" | "knet";

const GATEWAY_METHOD_IDS: Record<GatewayMethod, number> = {
  visa: 2, // Visa / Mastercard
  knet: 1, // KNET
};

export type ExecutePaymentInput = {
  method: GatewayMethod;
  /** Amount in KWD, decimal allowed (e.g. 7.5) */
  amountKwd: number;
  customerName: string;
  /** International format, e.g. +96550001234 */
  customerMobile: string;
  /** Public booking ref shown to customer (e.g. KB-1234) */
  bookingRef: string;
  /** Internal booking row id, echoed back via UserDefinedField */
  bookingId: string;
};

type ExecutePaymentData = {
  PaymentURL: string;
  InvoiceId: number;
};

export async function executePayment(input: ExecutePaymentInput) {
  const env = loadEnv();
  if (!env) throw new Error("MyFatoorah is not configured");

  // MyFatoorah caps CustomerMobile at 11 chars; we store full international
  // format (+96550001234 = 12 chars) so send the last 8 digits — the local
  // Kuwait subscriber number — which the gateway expects.
  const localMobile = input.customerMobile.replace(/\D/g, "").slice(-8);

  const data = await call<ExecutePaymentData>(env, "/v2/ExecutePayment", {
    PaymentMethodId: GATEWAY_METHOD_IDS[input.method],
    InvoiceValue: input.amountKwd,
    CustomerName: input.customerName,
    CustomerMobile: localMobile,
    Language: "EN",
    CurrencyIso: "KWD",
    DisplayCurrencyIso: "KWD",
    CallBackUrl: env.callbackUrl,
    ErrorUrl: env.errorUrl,
    UserDefinedField: input.bookingId,
    InvoiceItems: [
      {
        ItemName: `Booking ${input.bookingRef}`,
        Quantity: 1,
        UnitPrice: input.amountKwd,
      },
    ],
  });

  return { paymentUrl: data.PaymentURL, invoiceId: data.InvoiceId };
}

export type PaymentStatus = "Paid" | "Failed" | "Expired" | "Pending";

type PaymentStatusData = {
  InvoiceStatus: PaymentStatus;
  InvoiceReference: string;
  UserDefinedField: string | null;
  InvoiceTransactions: Array<{
    TransactionStatus: string;
    PaymentId: string;
  }>;
};

export async function getPaymentStatus(paymentId: string) {
  const env = loadEnv();
  if (!env) throw new Error("MyFatoorah is not configured");
  return call<PaymentStatusData>(env, "/v2/getPaymentStatus", {
    Key: paymentId,
    KeyType: "PaymentId",
  });
}
