import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const { createClient } = await import("@supabase/supabase-js");
const { hotel: rhHotel } = await import("../lib/ratehawk/index.ts");
const { hotelInfoBatchCached, setCachedHotelInfo } = await import(
  "../lib/ratehawk/cache.ts"
);

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// Clean slate
await sb.from("ratehawk_hotel_info_cache").delete().neq("id", "__never__");

const fetcher = (ids: string[]) => {
  console.log("  >> fetcher called for", ids.length, "ids:", ids.slice(0, 3));
  return rhHotel.hotelInfoBatch(ids);
};

// First call — all misses, should hit API
console.log("\n[Pass 1] cold cache");
const t1 = Date.now();
const r1 = await hotelInfoBatchCached(
  ["conrad_los_angeles", "rosa_bell_motel_los_angeles", "key_view_the_residences"],
  fetcher,
);
console.log(`  got: ${r1.size} hotels in ${Date.now() - t1}ms`);

// Wait a beat so fire-and-forget write completes
await new Promise((r) => setTimeout(r, 1500));

const { count: rowCount } = await sb
  .from("ratehawk_hotel_info_cache")
  .select("*", { count: "exact", head: true });
console.log(`  rows in cache: ${rowCount}`);

// Second call — all hits
console.log("\n[Pass 2] warm cache");
const t2 = Date.now();
const r2 = await hotelInfoBatchCached(
  ["conrad_los_angeles", "rosa_bell_motel_los_angeles", "key_view_the_residences"],
  fetcher,
);
console.log(`  got: ${r2.size} hotels in ${Date.now() - t2}ms (should be much faster, no fetcher call)`);

// Third call — partial miss
console.log("\n[Pass 3] partial miss");
const t3 = Date.now();
const r3 = await hotelInfoBatchCached(
  ["conrad_los_angeles", "test_hotel_do_not_book"],
  fetcher,
);
console.log(`  got: ${r3.size} hotels in ${Date.now() - t3}ms`);

console.log("\n✅ cache test complete");
