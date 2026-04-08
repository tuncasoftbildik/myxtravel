import { hotel as rhHotel } from "@/lib/ratehawk";
import { normalizeRatehawkHotel } from "./normalize/ratehawk";
import { normalizeTravelrobotHotel } from "./normalize/travelrobot";
import type {
  HotelSupplier,
  UnifiedHotel,
  UnifiedSearchParams,
  UnifiedSearchResult,
} from "./types";

/**
 * Which suppliers the aggregator should query. Controlled via env so we can
 * dark-launch RateHawk without touching code.
 *
 *   HOTEL_SUPPLIERS=travelrobot          → travelrobot only (default)
 *   HOTEL_SUPPLIERS=travelrobot,ratehawk → both in parallel
 *   HOTEL_SUPPLIERS=ratehawk             → ratehawk only (testing)
 */
export function enabledSuppliers(): HotelSupplier[] {
  const raw = process.env.HOTEL_SUPPLIERS?.trim();
  if (!raw) return ["travelrobot"];
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is HotelSupplier => s === "travelrobot" || s === "ratehawk");
  return list.length ? list : ["travelrobot"];
}

interface SupplierCall {
  supplier: HotelSupplier;
  run: () => Promise<UnifiedHotel[]>;
}

async function timeit(call: SupplierCall) {
  const start = Date.now();
  try {
    const hotels = await call.run();
    return { supplier: call.supplier, ok: true, count: hotels.length, ms: Date.now() - start, hotels };
  } catch (err) {
    return {
      supplier: call.supplier,
      ok: false,
      count: 0,
      ms: Date.now() - start,
      hotels: [] as UnifiedHotel[],
      error: (err as Error).message,
    };
  }
}

/**
 * Run RateHawk region search and normalize. Metadata hydration (hotel names,
 * stars, images) is not yet wired — Task 3.5.
 */
async function runRatehawk(params: UnifiedSearchParams): Promise<UnifiedHotel[]> {
  if (!params.regionId) return []; // nothing to search without a RH region mapping
  const res = await rhHotel.searchByRegion({
    checkin: params.checkIn,
    checkout: params.checkOut,
    residency: params.nationality.toLowerCase(),
    language: "en",
    guests: [{ adults: params.adults, children: params.childAges }],
    region_id: params.regionId,
    currency: params.currency || "EUR",
  });
  return (res?.hotels || [])
    .map((h) => normalizeRatehawkHotel(h))
    .filter((h): h is UnifiedHotel => h !== null);
}

/**
 * Aggregate hotels across all enabled suppliers in parallel.
 *
 * @param params unified search params
 * @param travelrobotFetcher injected by the API route — it already knows how to
 *   talk to kplus v0 and parse its nested shape. We pass a callback so this
 *   module stays free of TravelRobot request-body plumbing.
 */
export async function searchHotels(
  params: UnifiedSearchParams,
  travelrobotFetcher: () => Promise<{ rawItems: Record<string, unknown>[]; searchId: string | null }>,
): Promise<UnifiedSearchResult> {
  const suppliers = enabledSuppliers();

  const calls: SupplierCall[] = [];
  let searchId: string | null = null;

  if (suppliers.includes("travelrobot")) {
    calls.push({
      supplier: "travelrobot",
      run: async () => {
        const { rawItems, searchId: sid } = await travelrobotFetcher();
        searchId = sid;
        return rawItems
          .map((r) => normalizeTravelrobotHotel(r))
          .filter((h): h is UnifiedHotel => h !== null);
      },
    });
  }

  if (suppliers.includes("ratehawk")) {
    calls.push({
      supplier: "ratehawk",
      run: () => runRatehawk(params),
    });
  }

  const results = await Promise.all(calls.map(timeit));

  const merged: UnifiedHotel[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    for (const h of r.hotels) {
      if (seen.has(h.key)) continue;
      seen.add(h.key);
      merged.push(h);
    }
  }

  // Sort by cheapest price (0 = unknown → push to end)
  merged.sort((a, b) => {
    const pa = a.price.total || Number.MAX_SAFE_INTEGER;
    const pb = b.price.total || Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });

  return {
    hotels: merged,
    suppliers: results.map(({ supplier, ok, count, ms, error }) => ({
      supplier,
      ok,
      count,
      ms,
      error,
    })),
    searchId,
  };
}
