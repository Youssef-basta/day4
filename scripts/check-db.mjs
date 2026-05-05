// Quick read-only sanity check of the Supabase backend.
// Usage:  node scripts/check-db.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

function pad(n, w) {
  return String(n).padStart(w);
}

async function head(label, q) {
  const { data, error, count } = await q;
  if (error) {
    console.log(`✗ ${label}: ${error.message}`);
    return;
  }
  console.log(`✓ ${label}: ${count} rows`);
  return data;
}

async function main() {
  console.log(`Project: ${url}\n`);

  const services = await head(
    "services",
    supabase
      .from("services")
      .select("id,name,price_kwd,duration_min,tier", { count: "exact" })
      .order("sort_order")
  );
  if (services) {
    for (const s of services) {
      console.log(
        `   ${pad(s.id, 8)}  ${pad(s.name, 22)}  ${pad(s.price_kwd, 3)} KWD  ${pad(s.duration_min, 3)}m  ${s.tier ?? "standard"}`
      );
    }
  }

  console.log("");
  const addons = await head(
    "addons",
    supabase
      .from("addons")
      .select("id,name,price_kwd,duration_min", { count: "exact" })
      .order("sort_order")
  );
  if (addons) {
    for (const a of addons) {
      console.log(
        `   ${pad(a.id, 8)}  ${pad(a.name, 22)}  +${pad(a.price_kwd, 2)} KWD  ${pad(a.duration_min, 3)}m`
      );
    }
  }

  console.log("");
  const allSlots = await supabase
    .from("slots")
    .select("id,is_open", { count: "exact", head: true });
  const openSlots = await supabase
    .from("slots")
    .select("id", { count: "exact", head: true })
    .eq("is_open", true);
  console.log(
    `✓ slots: ${allSlots.count} total · ${openSlots.count} open · ${
      allSlots.count - openSlots.count
    } closed`
  );

  const { data: dateRange } = await supabase
    .from("slots")
    .select("date")
    .order("date", { ascending: true })
    .limit(1);
  const { data: dateRangeMax } = await supabase
    .from("slots")
    .select("date")
    .order("date", { ascending: false })
    .limit(1);
  if (dateRange?.length && dateRangeMax?.length) {
    console.log(`   range: ${dateRange[0].date}  →  ${dateRangeMax[0].date}`);
  }

  console.log("");
  const bookings = await head(
    "bookings",
    supabase
      .from("bookings")
      .select(
        "ref,customer_name,phone,service_id,slot_id,status,payment_method,payment_status,created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .limit(10)
  );
  if (bookings && bookings.length) {
    console.log("   most recent 10:");
    for (const b of bookings) {
      console.log(
        `   ${b.ref}  ${pad(b.customer_name, 18)}  ${pad(b.service_id, 8)}  ${pad(b.slot_id, 16)}  ${pad(b.status, 9)}  ${pad(b.payment_method, 4)}/${b.payment_status}`
      );
    }
  } else if (bookings) {
    console.log("   (no bookings yet)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
