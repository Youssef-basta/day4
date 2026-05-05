export function formatDateLong(dateIso: string) {
  const d = new Date(dateIso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(time: string) {
  // "14:30" → "2:30 PM"
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${mStr.padStart(2, "0")} ${ampm}`;
}
