import type { Addon, Booking, Service } from "./types";

export function bookingTotals(
  booking: Pick<Booking, "serviceId" | "addonIds">,
  services: Service[],
  addons: Addon[]
) {
  const service = services.find((s) => s.id === booking.serviceId);
  const selected = booking.addonIds
    .map((id) => addons.find((a) => a.id === id))
    .filter((a): a is Addon => Boolean(a));

  const priceKwd =
    (service?.priceKwd ?? 0) +
    selected.reduce((sum, a) => sum + a.priceKwd, 0);
  const durationMin =
    (service?.durationMin ?? 0) +
    selected.reduce((sum, a) => sum + a.durationMin, 0);

  return { priceKwd, durationMin, addons: selected, service };
}
