import type { Addon, Service, Slot } from "./types";

export const SERVICES: Service[] = [
  {
    id: "haircut",
    name: "Classic Haircut",
    durationMin: 30,
    priceKwd: 5,
    description: "Wash, scissor or clipper cut, and finish.",
  },
  {
    id: "beard",
    name: "Beard Trim",
    durationMin: 20,
    priceKwd: 3,
    description: "Tidy lines and a neat shape.",
  },
  {
    id: "kids",
    name: "Kids Cut",
    durationMin: 20,
    priceKwd: 3,
    description: "Patient, friendly cuts for under-12s.",
  },
  {
    id: "color",
    name: "Hair Color",
    durationMin: 60,
    priceKwd: 12,
    description: "Full color or grey blending.",
  },
  {
    id: "shave",
    name: "Hot Towel Shave",
    durationMin: 30,
    priceKwd: 7,
    tier: "premium",
    description: "Straight razor with a steamed towel finish.",
  },
  {
    id: "sculpt",
    name: "Beard Sculpt",
    durationMin: 30,
    priceKwd: 6,
    tier: "premium",
    description: "Detailed shaping with hot oil and balm.",
  },
  {
    id: "lineup",
    name: "Line-up / Hair Tattoo",
    durationMin: 30,
    priceKwd: 8,
    tier: "premium",
    description: "Crisp edges or custom razor designs.",
  },
  {
    id: "royal",
    name: "Royal Package",
    durationMin: 75,
    priceKwd: 18,
    tier: "signature",
    description: "Cut · Hot towel shave · Scalp massage · Style.",
  },
];

export const ADDONS: Addon[] = [
  {
    id: "eyebrows",
    name: "Eyebrow Trim",
    priceKwd: 1,
    durationMin: 5,
    description: "Quick clean-up.",
  },
  {
    id: "scalp",
    name: "Scalp Massage",
    priceKwd: 2,
    durationMin: 10,
    description: "5-min relax-down.",
  },
  {
    id: "hotoil",
    name: "Hot Oil Treatment",
    priceKwd: 3,
    durationMin: 10,
    description: "Nourish and add shine.",
  },
  {
    id: "mask",
    name: "Black Mask Facial",
    priceKwd: 4,
    durationMin: 15,
    description: "Deep-cleanse pores.",
  },
  {
    id: "wash",
    name: "Wash & Blow-dry",
    priceKwd: 2,
    durationMin: 10,
    description: "Shampoo and finish.",
  },
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Generate slots for today + next 2 days, every 30 minutes from 10:00 to 21:00.
export function buildInitialSlots(now: Date = new Date()): Slot[] {
  const slots: Slot[] = [];
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const day = new Date(now);
    day.setDate(now.getDate() + dayOffset);
    const date = formatDate(day);
    for (let hour = 10; hour <= 21; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 21 && minute === 30) continue;
        const time = `${pad(hour)}:${pad(minute)}`;
        slots.push({
          id: `${date}_${time}`,
          date,
          time,
          isOpen: true,
        });
      }
    }
  }
  return slots;
}

export function todayKey(now: Date = new Date()) {
  return formatDate(now);
}
