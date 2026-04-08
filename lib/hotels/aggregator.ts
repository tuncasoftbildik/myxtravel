import { hotel as rhHotel, rhImage, hotelInfoBatchCached } from "@/lib/ratehawk";
import type { RhHotelInfo } from "@/lib/ratehawk";

// Single fetcher used by both region and by-id pipelines; delegates the raw
// API batch call so the cache layer stays ignorant of RateHawk service shapes.
const rhInfoFetcher = (ids: string[]) => rhHotel.hotelInfoBatch(ids);

// RateHawk needs YYYY-MM-DD. Our UI carries dates as DD.MM.YYYY (TravelRobot
// legacy format). Accept either and normalize — ISO passes through untouched.
function toIsoDate(d: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return d;
}
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
function infoToMeta(info: RhHotelInfo) {
  return {
    name: info.name,
    stars: info.star_rating,
    thumbnail: info.images?.[0] ? rhImage(info.images[0], "640x400") : null,
    address: info.address || null,
    city: info.region?.name || null,
    country: info.region?.country_code || null,
    location: {
      lat: typeof info.latitude === "number" ? info.latitude : null,
      lng: typeof info.longitude === "number" ? info.longitude : null,
    },
  };
}

async function runRatehawk(params: UnifiedSearchParams): Promise<UnifiedHotel[]> {
  if (!params.regionId) return []; // nothing to search without a RH region mapping
  const res = await rhHotel.searchByRegion({
    checkin: toIsoDate(params.checkIn),
    checkout: toIsoDate(params.checkOut),
    residency: params.nationality.toLowerCase(),
    language: "en",
    guests: [{ adults: params.adults, children: params.childAges }],
    region_id: params.regionId,
    currency: params.currency || "EUR",
  });
  const rawHotels = res?.hotels || [];
  if (!rawHotels.length) return [];

  // Hydrate metadata in parallel. Failures per-hotel are swallowed — we still
  // return the unified hotel with id fallback rather than dropping it.
  const infoMap = await hotelInfoBatchCached(
    rawHotels.map((h) => h.id),
    rhInfoFetcher,
  );

  return rawHotels
    .map((h) => {
      const info = infoMap.get(h.id);
      return normalizeRatehawkHotel(h, info ? infoToMeta(info) : undefined);
    })
    .filter((h): h is UnifiedHotel => h !== null);
}

/**
 * Hydrate a batch of RateHawk hotels directly from an arbitrary hid/slug list.
 * Exposed so search-by-hotels callers (and tests) can reuse the same pipeline.
 */
export async function fetchRatehawkByHotelIds(
  params: UnifiedSearchParams,
  hids: number[],
): Promise<UnifiedHotel[]> {
  if (!hids.length) return [];
  const res = await rhHotel.searchByHotels({
    checkin: toIsoDate(params.checkIn),
    checkout: toIsoDate(params.checkOut),
    residency: params.nationality.toLowerCase(),
    language: "en",
    guests: [{ adults: params.adults, children: params.childAges }],
    hids,
    currency: params.currency || "EUR",
  });
  const rawHotels = res?.hotels || [];
  if (!rawHotels.length) return [];
  const infoMap = await hotelInfoBatchCached(
    rawHotels.map((h) => h.id),
    rhInfoFetcher,
  );
  return rawHotels
    .map((h) => {
      const info = infoMap.get(h.id);
      return normalizeRatehawkHotel(h, info ? infoToMeta(info) : undefined);
    })
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
