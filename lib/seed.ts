// Date helpers used across server components.
// Catalog (services / addons / slots) lives in the database — see lib/db/catalog.ts.

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(now: Date = new Date()) {
  return formatDate(now);
}
