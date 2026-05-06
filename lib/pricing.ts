import type { Addon, Booking, Drink, DrinkOrder, Service } from "./types";

export type DrinkLine = { drink: Drink; qty: number; subtotal: number };

export function bookingTotals(
  booking: Pick<Booking, "serviceId" | "addonIds"> & {
    drinkOrders?: DrinkOrder[];
  },
  services: Service[],
  addons: Addon[],
  drinks: Drink[] = []
) {
  const service = services.find((s) => s.id === booking.serviceId);

  const selectedAddons = booking.addonIds
    .map((id) => addons.find((a) => a.id === id))
    .filter((a): a is Addon => Boolean(a));

  const drinkLines: DrinkLine[] = (booking.drinkOrders ?? [])
    .filter((o) => o && o.qty > 0)
    .map((o) => {
      const d = drinks.find((x) => x.id === o.id);
      if (!d) return null;
      return { drink: d, qty: o.qty, subtotal: d.priceKwd * o.qty };
    })
    .filter((l): l is DrinkLine => Boolean(l));

  const priceKwd =
    (service?.priceKwd ?? 0) +
    selectedAddons.reduce((sum, a) => sum + a.priceKwd, 0) +
    drinkLines.reduce((sum, l) => sum + l.subtotal, 0);

  const durationMin =
    (service?.durationMin ?? 0) +
    selectedAddons.reduce((sum, a) => sum + a.durationMin, 0);

  return {
    priceKwd,
    durationMin,
    addons: selectedAddons,
    drinks: drinkLines,
    service,
  };
}
