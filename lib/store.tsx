"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ADDONS, SERVICES, buildInitialSlots } from "./seed";
import type {
  Addon,
  Booking,
  BookingStatus,
  PaymentMethod,
  Service,
  Slot,
} from "./types";

type State = {
  services: Service[];
  addons: Addon[];
  slots: Slot[];
  bookings: Booking[];
};

type StoreApi = State & {
  createBooking: (input: {
    customerName: string;
    phone: string;
    serviceId: string;
    addonIds: string[];
    slotId: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    cardLast4?: string;
  }) => Booking;
  updateStatus: (bookingId: string, status: BookingStatus) => void;
  markPaid: (bookingId: string) => void;
  toggleSlot: (slotId: string) => void;
  getService: (id: string) => Service | undefined;
  getAddon: (id: string) => Addon | undefined;
  getSlot: (id: string) => Slot | undefined;
  getBooking: (id: string) => Booking | undefined;
};

const StoreContext = createContext<StoreApi | null>(null);

const LS_KEY = "kbs.state.v4";

function loadFromStorage(): State | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as State;
    if (
      !parsed.services ||
      !parsed.addons ||
      !parsed.slots ||
      !parsed.bookings
    )
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function makeRef() {
  return "KB-" + Math.floor(1000 + Math.random() * 9000).toString();
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    services: SERVICES,
    addons: ADDONS,
    slots: buildInitialSlots(),
    bookings: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  const createBooking: StoreApi["createBooking"] = useCallback((input) => {
    const booking: Booking = {
      id: makeId(),
      ref: makeRef(),
      customerName: input.customerName,
      phone: input.phone,
      serviceId: input.serviceId,
      addonIds: input.addonIds,
      slotId: input.slotId,
      notes: input.notes,
      status: "pending",
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "cash" ? "unpaid" : "paid",
      cardLast4: input.cardLast4,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      bookings: [booking, ...prev.bookings],
      slots: prev.slots.map((s) =>
        s.id === input.slotId ? { ...s, isOpen: false } : s
      ),
    }));
    return booking;
  }, []);

  const updateStatus: StoreApi["updateStatus"] = useCallback(
    (bookingId, status) => {
      setState((prev) => {
        const booking = prev.bookings.find((b) => b.id === bookingId);
        if (!booking) return prev;
        const reopenSlot = status === "cancelled";
        return {
          ...prev,
          bookings: prev.bookings.map((b) =>
            b.id === bookingId ? { ...b, status } : b
          ),
          slots: reopenSlot
            ? prev.slots.map((s) =>
                s.id === booking.slotId ? { ...s, isOpen: true } : s
              )
            : prev.slots,
        };
      });
    },
    []
  );

  const markPaid: StoreApi["markPaid"] = useCallback((bookingId) => {
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, paymentStatus: "paid" } : b
      ),
    }));
  }, []);

  const toggleSlot: StoreApi["toggleSlot"] = useCallback((slotId) => {
    setState((prev) => ({
      ...prev,
      slots: prev.slots.map((s) =>
        s.id === slotId ? { ...s, isOpen: !s.isOpen } : s
      ),
    }));
  }, []);

  const api = useMemo<StoreApi>(
    () => ({
      ...state,
      createBooking,
      updateStatus,
      markPaid,
      toggleSlot,
      getService: (id) => state.services.find((s) => s.id === id),
      getAddon: (id) => state.addons.find((a) => a.id === id),
      getSlot: (id) => state.slots.find((s) => s.id === id),
      getBooking: (id) => state.bookings.find((b) => b.id === id),
    }),
    [state, createBooking, updateStatus, markPaid, toggleSlot]
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <BookingProvider>");
  return ctx;
}
