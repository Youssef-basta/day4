"use client";

import { useState } from "react";

type Props = {
  /** Booking ref shown to the user (e.g. KB-1234) */
  ref: string;
  /** Stable internal id used as ICS UID */
  bookingId: string;
  brandName: string;
  serviceName: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** HH:mm */
  startTime: string;
  durationMin: number;
  location?: string;
  /** Already-translated labels so this component doesn't import i18n */
  labels: {
    print: string;
    saveCal: string;
    saved: string;
  };
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildIcs(input: Props): string {
  const [y, mo, d] = input.startDate.split("-").map(Number);
  const [h, m] = input.startTime.split(":").map(Number);

  const startStamp = `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`;

  const endTotal = h * 60 + m + input.durationMin;
  const endH = Math.floor(endTotal / 60) % 24;
  const endM = endTotal % 60;
  // Note: doesn't roll over midnight; barbershop hours don't span days.
  const endStamp = `${y}${pad(mo)}${pad(d)}T${pad(endH)}${pad(endM)}00`;

  const now = new Date();
  const dtstamp =
    `${now.getUTCFullYear()}` +
    `${pad(now.getUTCMonth() + 1)}` +
    `${pad(now.getUTCDate())}T` +
    `${pad(now.getUTCHours())}` +
    `${pad(now.getUTCMinutes())}` +
    `${pad(now.getUTCSeconds())}Z`;

  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escape(input.brandName)}//Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.bookingId}@joebarber`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${escape(input.serviceName)} — ${escape(input.brandName)}`,
    `DESCRIPTION:Booking ID ${escape(input.ref)}`,
  ];
  if (input.location) lines.push(`LOCATION:${escape(input.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function ConfirmationActions(props: Props) {
  const [saved, setSaved] = useState(false);

  function print() {
    window.print();
  }

  function saveToCalendar() {
    const ics = buildIcs(props);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.ref}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="no-print mt-5 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={print}
        className="btn-primary"
        aria-label={props.labels.print}
      >
        🖨️ {props.labels.print}
      </button>
      <button
        type="button"
        onClick={saveToCalendar}
        className="btn-accent"
        aria-label={props.labels.saveCal}
      >
        📅 {saved ? props.labels.saved : props.labels.saveCal}
      </button>
    </div>
  );
}
