import type { Booking } from "@/lib/types";

const METHOD_LABEL = {
  visa: "Visa",
  knet: "KNET",
  cash: "Cash",
} as const;

export function PaymentBadge({ booking }: { booking: Booking }) {
  const paid = booking.paymentStatus === "paid";
  return (
    <span
      className={`chip ${
        paid ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
      }`}
    >
      {METHOD_LABEL[booking.paymentMethod]} · {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

export function methodLabel(method: Booking["paymentMethod"]) {
  return METHOD_LABEL[method];
}
