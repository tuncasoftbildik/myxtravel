import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const { hotel: rhHotel } = await import("../lib/ratehawk/index.ts");

// 1) hotelPage to get a live book_hash
console.log("[1] hotelPage conrad_los_angeles");
const hp = (await rhHotel.hotelPage({
  id: "conrad_los_angeles",
  checkin: "2026-04-09",
  checkout: "2026-04-11",
  residency: "tr",
  language: "en",
  guests: [{ adults: 2, children: [] }],
  currency: "EUR",
})) as Record<string, unknown>;

const hotels = (hp.hotels as Record<string, unknown>[]) || [];
const rates = (hotels[0]?.rates as Record<string, unknown>[]) || [];
console.log(`  got ${rates.length} rates`);
if (!rates.length) {
  console.log("  raw:", JSON.stringify(hp).slice(0, 500));
  process.exit(1);
}

const first = rates[0];
console.log("  first.book_hash:", first.book_hash);
console.log("  first.match_hash:", first.match_hash);
console.log("  first.room_name:", first.room_name);

// 2) prebook — try both body shapes
const { ratehawkRequest } = await import("../lib/ratehawk/client.ts");

async function tryBody(label: string, body: Record<string, unknown>) {
  console.log(`\n[2] prebook — ${label}`);
  try {
    const res = await ratehawkRequest<unknown>({ path: "/hotel/prebook/", body });
    console.log("  ✅ success:", JSON.stringify(res, null, 2).slice(0, 600));
    return true;
  } catch (err) {
    const e = err as Error & { status?: number; body?: unknown };
    console.log(`  ❌ ${e.status}`, (e.body as Record<string, unknown>)?.debug ? JSON.stringify((e.body as any).debug?.validation_error) : JSON.stringify(e.body).slice(0, 300));
    return false;
  }
}

const bh = first.book_hash as string;
const mh = first.match_hash as string;

await tryBody("book_hash", { book_hash: bh });
await tryBody("hash", { hash: bh });
await tryBody("match_hash", { match_hash: mh });
await tryBody("book_hash + price_increase_percent", { book_hash: bh, price_increase_percent: 10 });
await tryBody("hash from match_hash", { hash: mh });
